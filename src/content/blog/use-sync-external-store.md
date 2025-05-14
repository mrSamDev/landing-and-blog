---
title: Bridging the Gap - My Journey Understanding React's useSyncExternalStore
excerpt: How I tackled state inconsistencies by diving deep into useSyncExternalStore, moving beyond useEffect for safer external state integration in React.
publishDate: 'April 10 2025'
isPublished: true
tags:
  - React
  - JavaScript
  - useSyncExternalStore
  - Front-end Development
  - State Management
  - Learning Journey
seo:
  image:
    src: https://res.cloudinary.com/dnmuyrcd7/image/upload/f_auto,q_auto/v1/Blog/bemskg1cumn1x9z07wym
    alt: 'React component interacting with external state using useSyncExternalStore'
---

Last month, I found myself deep in debugging hell with a React application. Components that _should_ have displayed the same data were randomly showing different values, leading to frustrating inconsistencies. The culprit? We were directly subscribing to `window` events in multiple components, bypassing React's state management and creating a synchronization nightmare.

That painful experience didn't just lead me to _a_ solution; it sparked a desire to **truly understand the underlying mechanics** of how React handles external state changes safely, especially with concurrent features. Instead of immediately reaching for a state management library (which often uses this hook under the hood), I decided to **roll up my sleeves and deeply internalize React's `useSyncExternalStore` hook directly**. It felt crucial to "hard-wire" this concept in my understanding. This hook is the tool I wish I'd understood much earlier, not just to fix the immediate bug, but to grasp _how_ React can reliably interact with the world outside its own rendering cycle.

**Disclaimer:** This post focuses on my journey learning and applying the `useSyncExternalStore` hook directly. While powerful for understanding and specific use cases, remember that excellent libraries and abstractions exist. Always research and evaluate different approaches (like state management libraries for complex state, or React Query/SWR for data fetching) before implementing any feature.

React excels at managing its own ecosystem, but real applications don't live in isolation. They need to communicate with browser APIs, third-party libraries, and sometimes even legacy code. This interaction with external data sources that React doesn't control is precisely the gap `useSyncExternalStore` was designed to bridge safely and consistently.

## The Problem That Sparked My Deep Dive

The specific project that sent me down this rabbit hole involved displaying real-time data from WebSockets while also respecting user preferences stored in `localStorage`. Our initial approach felt like the "React way" at first – a combination of `useEffect` hooks, various event listeners, and manual state updates scattered across components. It quickly became apparent this wasn't sustainable.

Here's a taste of the chaos we (mostly I) wrestled with:

- **UI Inconsistencies (Tearing):** This was the most visible symptom. Different components would literally show conflicting data _during the same render_. One part of the UI might react to a WebSocket message while another was still showing stale `localStorage` data. The React team calls this "tearing," and believe me, users notice. It was exactly the kind of random value display I mentioned fighting with earlier.
- **Performance Headaches:** We swung between two extremes. Sometimes, components updated far too often, triggered by noisy external events, leading to sluggishness. Other times, a well-intentioned attempt by a teammate to debounce an event listener meant critical updates were noticeably delayed. Finding the right balance felt like guesswork.
- **Subscription Hell:** Manually managing subscriptions – adding listeners on mount, removing them on unmount, handling dependencies correctly in `useEffect` – became increasingly complex and error-prone. We definitely leaked a listener or two along the way.

It became clear we needed a more robust, React-aware way to handle these external connections. That's when I decided to properly investigate `useSyncExternalStore`.

## Unpacking `useSyncExternalStore`: How It Actually Works

Honestly, when `useSyncExternalStore` was released alongside React's Concurrent Features, I glanced at it and moved on. It seemed like something only library authors would need. It wasn't until I was debugging the mess described above and stumbled upon a post-mortem discussing similar issues that its purpose clicked for me.

At its heart, the hook requires you to provide two key functions (and an optional third for SSR):

- **`subscribe(callback)`:** This is where you set up the connection to your external data source (like adding an event listener). The crucial part I initially missed: this function _must_ return an `unsubscribe` function. And critically, the `callback` provided by React needs to be called _whenever_ the external data changes to notify React. My first attempt involved setting up the listener but forgetting to actually _call_ the callback on updates!
- **`getSnapshot()`:** This function's job is simple: return the current value (the "snapshot") from your external source _right now_. The subtle trap I fell into here was performance and identity. This function needs to be fast. More importantly, if the underlying data hasn't _actually_ changed since the last time `getSnapshot` was called, it **must return the exact same value reference** (for objects/arrays) or primitive value. Failing to do this triggers unnecessary re-renders and can lead to the dreaded "maximum update depth exceeded" error, as I painfully discovered.

![useSyncExternalStore architecture](https://res.cloudinary.com/dnmuyrcd7/image/upload/f_auto,q_auto/v1/Blog/useExternalstore/ka2mgxsndhlyswecb27q)
_(Diagram showing how subscribe connects to the external source and getSnapshot reads from it, feeding into React)_

## My `useEffect` Struggles vs. The `useSyncExternalStore` Solution

Before showing how I applied the hook, let's compare it to the `useEffect` approach I was initially using. Having wrestled with both in production code, the differences became starkly clear.

### The Familiar (and Flawed) `useEffect` Way

Here's a typical custom hook for tracking window size using `useEffect`, similar to what we initially had:

```javascript
function useWindowSizeWithEffect() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      // This triggers a state update, causing a re-render
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    // Cleanup is crucial!
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array means it runs once on mount

  return size;
}
```

### Why This Caused Me Grief (Issues with `useEffect` for External State)

1.  **Race Conditions & Tearing:** This was our biggest headache. If the window resized _while_ React was in the middle of rendering, different components could read the `size` state _before_ the `useEffect` handler ran and updated it. Result: inconsistent UI, exactly the tearing I was trying to fix.
2.  **Timing Gaps & Flickering:** There's a brief moment between the component rendering initially and the `useEffect` actually running to attach the listener. During this gap, the component isn't subscribed. We saw noticeable UI flickering during fast transitions because of this.
3.  **Render Churn:** Every single 'resize' event triggered a `setSize`, which caused a re-render. Even with throttling/debouncing (which adds its own complexity), frequent external updates could lead to performance issues in complex UIs due to cascading renders.
4.  **Synchronization Complexity:** If multiple, separate components needed the _same_ window size, we had to either pass the `size` down as props (prop drilling) or lift it into Context, adding boilerplate.
5.  **Concurrent Mode Unfriendliness:** This pattern is known to be problematic with React's concurrent features (like time-slicing) because the timing inconsistencies are exacerbated, making tearing more likely.

![useEffect vs useSyncExternalStore](https://res.cloudinary.com/dnmuyrcd7/image/upload/f_auto,q_auto/v1/Blog/useExternalstore/uvmjtiolqx4etlsfcxmb)
_(Diagram contrasting the indirect update cycle of useEffect with the direct read of useSyncExternalStore)_

### How `useSyncExternalStore` Addressed My Problems

Switching my mindset and implementation to `useSyncExternalStore` felt like a direct solution to the issues I faced:

1.  **Consistency Guaranteed:** React uses the `getSnapshot` value _during_ the render phase, ensuring all components reading from the same store see the exact same value within a single render pass. This completely eliminated the tearing we experienced.
2.  **No Timing Gaps:** The subscription and snapshot are available from the very first render. No more flickering during transitions because the component was momentarily disconnected.
3.  **Optimized Renders:** React compares the snapshot values. If `getSnapshot` returns the same value reference as last time (because the data didn't change), React can often skip re-rendering the component. This helped tame the render churn.
4.  **Concurrent Mode Ready:** It's designed explicitly for this, making my code more robust for future React updates.
5.  **SSR Compatibility:** The optional third argument (`getServerSnapshot`) allowed us to provide a sensible default for server-side rendering, something our `useEffect` approach couldn't handle gracefully.

## Putting Theory Into Practice: Examples From My Learning Curve

Okay, enough theory. Here's how I applied `useSyncExternalStore` to solve the real problems I was facing, including the mistakes and refinements along the way.

### 1. Responsive Layouts That Finally Behaved

We needed components to adapt dynamically based on screen size, going beyond simple CSS media queries for more complex layout logic. My first `useEffect` attempt led straight to the tearing issues mentioned earlier. Here's the `useSyncExternalStore` version I landed on after some trial and error:

```javascript
// Helper for deep equality check (important later!)
function isEqual(a, b) {
  // If the same object reference or same primitive value
  if (a === b) return true;

  // If either is null or not an object
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }

  // For regular objects
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => Object.prototype.hasOwnProperty.call(b, key) && isEqual(a[key], b[key]));
}

function useWindowSize() {
  // Initial snapshot value, safe for SSR
  const getServerSnapshot = () => ({
    width: 0, // Sensible default for server
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: true // Assume desktop on server? Or configure?
  });

  // useRef to cache the *last returned snapshot object*
  // This is the KEY to preventing infinite loops!
  const lastSnapshot = React.useRef(null);

  const getSnapshot = () => {
    // Safety check for non-browser environments
    if (typeof window === 'undefined') {
      // Initialize cache if needed on client, or return server default
      if (lastSnapshot.current === null) {
        lastSnapshot.current = getServerSnapshot();
      }
      return lastSnapshot.current;
    }

    // Calculate current state
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;
    const currentIsMobile = currentWidth < 768;
    const currentIsTablet = currentWidth >= 768 && currentWidth < 1024;
    const currentIsDesktop = currentWidth >= 1024;

    // Construct the potential new snapshot
    const newSnapshot = {
      width: currentWidth,
      height: currentHeight,
      isMobile: currentIsMobile,
      isTablet: currentIsTablet,
      isDesktop: currentIsDesktop
    };

    // **CRITICAL:** Only update the ref and return a *new* object
    // if the data has actually changed. Otherwise, return the *cached* object.
    if (lastSnapshot.current === null || !isEqual(lastSnapshot.current, newSnapshot)) {
      // Data changed! Update the cache.
      lastSnapshot.current = newSnapshot;
    }

    // Return the stable reference (either old or new)
    return lastSnapshot.current;
  };

  const subscribe = (callback) => {
    // Can't subscribe on the server
    if (typeof window === 'undefined') {
      return () => {}; // Return an empty unsubscribe function
    }

    // Throttling to avoid excessive updates on resize spam
    const throttledCallback = (() => {
      let lastExecTime = 0;
      const throttleInterval = 100; // ms

      return () => {
        const now = Date.now();
        if (now - lastExecTime >= throttleInterval) {
          lastExecTime = now;
          callback();
        }
      };
    })();

    /* 
    // For comparison, here's what a debounce implementation would look like:
    // Debouncing - waits until activity stops before executing
    // This would potentially delay UI updates making the app feel less responsive
    let debounceTimer;
    const debouncedCallback = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        callback();
      }, 100);
    };
    */

    window.addEventListener('resize', throttledCallback);
    // Return the cleanup function!
    return () => {
      window.removeEventListener('resize', throttledCallback);
    };
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Example Usage
function AppLayout() {
  const { isMobile, isTablet } = useWindowSize();

  // Explicit checks based on the hook's output
  if (isMobile) return <MobileLayout />;
  if (isTablet) return <TabletLayout />;
  return <DesktopLayout />;
}
```

Key things I learned building this:

1.  **Snapshot Caching is Non-Negotiable:** My first attempt returned a new `{ width: window.innerWidth, ... }` object every time in `getSnapshot`. Instant "maximum update depth exceeded" error. Caching the last returned object and only creating a new one _if the values actually changed_ (using `isEqual`) was the fix. `useRef` was perfect for holding this cache.
2.  **Throttling is Still Useful:** While `useSyncExternalStore` optimizes renders, the underlying event (`resize`) can still fire rapidly. Throttling the `callback` in `subscribe` prevents unnecessary churn _within_ the hook's logic. (I initially implemented debounce here by mistake, which delayed updates too much).
3.  **SSR Needs Consideration:** The `getServerSnapshot` became essential. Returning a sensible default prevents errors during server rendering. The client-side `getSnapshot` also needs `typeof window === 'undefined'` checks.
4.  **Cleanup Matters:** Forgetting the `return () => window.removeEventListener(...)` in `subscribe` would create memory leaks.

### 2. Syncing `localStorage` Across Tabs (The Real Test)

This was tougher. The goal: change a setting in one tab, and have all other open tabs reflect it instantly. The standard `storage` event is designed for cross-tab communication, but it has a quirk: it _only fires in other tabs_, not in the tab that actually made the change. My initial thought was to use a custom event dispatched on the `window` object to notify the current tab, which works, but felt a bit like a workaround.

While debugging and researching this, I came across the **`BroadcastChannel` API**. This browser API provides a much more direct and standard way for different browser contexts (tabs, windows, iframes) from the **same origin** to send messages to each other. It seemed like a perfect fit to elegantly solve the "notify the current tab" problem, potentially replacing the custom event approach.

Here's how I refactored the `useLocalStorage` hook to leverage `BroadcastChannel` alongside the necessary `storage` event:

```javascript
import React, { useRef, useCallback, useSyncExternalStore } from 'react';

// Create a unique channel name - perhaps based on app name or a constant
const LOCAL_STORAGE_SYNC_CHANNEL = 'myAppLocalStorageSync'; // Or generate dynamically

// Create a singleton factory for BroadcastChannel instances
const channelRegistry = {
  _channels: {},
  _refCounts: {},

  getChannel(channelName) {
    if (!this._channels[channelName]) {
      this._channels[channelName] = new BroadcastChannel(channelName);
      this._refCounts[channelName] = 0;
    }
    this._refCounts[channelName]++;
    return this._channels[channelName];
  },

  releaseChannel(channelName) {
    if (this._channels[channelName]) {
      this._refCounts[channelName]--;
      if (this._refCounts[channelName] <= 0) {
        this._channels[channelName].close();
        delete this._channels[channelName];
        delete this._refCounts[channelName];
      }
    }
  }
};

function useLocalStorage(key, initialValue) {
  const getServerSnapshot = () => initialValue;
  const cache = useRef(null);
  const channelName = `${LOCAL_STORAGE_SYNC_CHANNEL}_${key}`;

  const getSnapshot = () => {
    if (typeof window === 'undefined') {
      return cache.current ?? initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      const parsedItem = item ? JSON.parse(item) : initialValue;
      if (cache.current === null || !isEqual(cache.current, parsedItem)) {
        cache.current = parsedItem;
      }
      return cache.current;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      if (cache.current === null) cache.current = initialValue;
      return cache.current;
    }
  };

  const subscribe = useCallback(
    (callback) => {
      if (typeof window === 'undefined') {
        return () => {};
      }

      const channel = channelRegistry.getChannel(channelName);

      // Listener for standard 'storage' event (fired in other tabs)
      const handleStorageEvent = (event) => {
        if (event.storageArea === window.localStorage && event.key === key) {
          callback();
        }
      };

      // Listener for BroadcastChannel messages (fired in *all* tabs, including current)
      const handleChannelMessage = (event) => {
        // Check if the message is relevant to this key
        if (event.data?.type === 'localStorage-update' && event.data?.key === key) {
          // You could potentially use event.data.newValue directly here
          // if you want to avoid the localStorage read, but reading from
          // localStorage ensures consistency across tabs
          callback();
        }
      };

      window.addEventListener('storage', handleStorageEvent);
      channel.addEventListener('message', handleChannelMessage);

      // Cleanup: remove listeners and release channel reference
      return () => {
        window.removeEventListener('storage', handleStorageEvent);
        channel.removeEventListener('message', handleChannelMessage);
        // Let the registry handle proper channel cleanup
        channelRegistry.releaseChannel(channelName);
      };
    },
    [key, channelName]
  ); // Depend on key and channelName

  const storedValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (valueOrFn) => {
      if (typeof window === 'undefined') return; // Don't run setValue on server

      try {
        const newValue = typeof valueOrFn === 'function' ? valueOrFn(storedValue) : valueOrFn;
        window.localStorage.setItem(key, JSON.stringify(newValue));

        try {
          // Separate try/catch for channel operations
          const channel = channelRegistry.getChannel(channelName);
          channel.postMessage({
            type: 'localStorage-update',
            key: key,
            newValue: newValue
          });
        } catch (channelError) {
          console.error(`Error broadcasting localStorage change for key "${key}":`, channelError);
          // Operation can still succeed even if broadcasting fails
          // Other tabs won't be notified, but current tab state is correct
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, channelName]
  );

  // Effect to ensure channel is properly registered
  React.useEffect(() => {
    // Ensure channel is created even if setValue hasn't been called
    channelRegistry.getChannel(channelName);

    // Return cleanup function
    return () => {
      channelRegistry.releaseChannel(channelName);
    };
  }, [channelName]);

  return [storedValue, setValue];
}

// Example Usage remains the same
function UserPreferencesPanel() {
  const [preferences, setPreferences] = useLocalStorage('user-preferences', {
    theme: 'light',
    fontSize: 'medium'
  });

  return (
    <div>
      <label>
        Theme:
        <select value={preferences.theme} onChange={(e) => setPreferences((prev) => ({ ...prev, theme: e.target.value }))}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <pre>Current: {JSON.stringify(preferences)}</pre>
    </div>
  );
}
```

How the cache gets refreshed:

1. When any tab updates localStorage, it calls `channel.postMessage()`
   with the updated value.

2. All tabs (including the one that made the change) receive this message
   via their `handleChannelMessage` event listener.

3. When the message is received, the listener calls the `callback()`
   that React provided to our `subscribe` function.

4. This callback triggers React to re-run the `getSnapshot()` function
   to get the latest value.

5. `getSnapshot()` reads from localStorage, updates our cache if the
   value has changed, and returns either the updated value or the
   cached value if nothing changed.

This ensures that all tabs stay in sync with the latest value,
whether they made the change themselves or another tab did.

My key takeaways from building the `localStorage` hook, now incorporating `BroadcastChannel`:

1.  **`storage` Event Limitation:** Still true – it only notifies _other_ tabs.
2.  **`BroadcastChannel` for Unified Notification:** This API elegantly solves the problem of notifying _all_ relevant contexts (including the current tab) about a change. Posting a message after `setItem` triggers the `onmessage` listener in the `subscribe` function of _all_ active hook instances using the same channel name.
3.  **Cleaner Than Custom Events:** It avoids polluting the global `window` object with custom events and feels more idiomatic for cross-context communication.
4.  **Channel Management:** You need to create and manage the `BroadcastChannel` instance. The registry pattern ensures proper instance sharing and cleanup, preventing memory leaks even when multiple components use the same key.
5.  **Error Handling & Deep Equality:** These remain just as crucial as before for robustness and performance.

Using `BroadcastChannel` felt like a more "correct" solution once I understood the limitations of the `storage` event. You can learn more about it on [MDN Web Docs: BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel).

**Important Considerations:**

- **Browser Support:** While good in modern browsers, `BroadcastChannel` isn't supported in older browsers like IE. If you need legacy support, the custom event approach might be necessary as a fallback.
- **Channel Naming/Management:** Choose channel names carefully to avoid collisions. The registry pattern helps manage channel lifecycles properly.
- **Deep Equality Robustness:** The `isEqual` function shown here properly handles arrays and nested objects. For even more complex cases (like `Date` objects, `RegExp`, circular references), using a battle-tested library function (e.g., from Lodash, `fast-deep-equal`) is highly recommended in production.
- **Error Handling in `getSnapshot`:** The added `try...catch` around `JSON.parse` is crucial. If the data in `localStorage` gets corrupted, you don't want your entire app to crash.

## Pitfalls I Stumbled Into (So You Don't Have To)

This learning process wasn't smooth. Here are the main traps I fell into while getting comfortable with `useSyncExternalStore`:

1.  **Forgetting to Call `callback`:** In `subscribe`, I'd set up my event listener perfectly but forget the crucial step: `listener = () => { callback(); }`. My components simply never updated to external changes.
2.  **The `getSnapshot` Identity Crisis:** As mentioned multiple times because it bit me multiple times: returning a _new_ object/array reference from `getSnapshot` on every call, even if the data was identical. This is the #1 cause of infinite render loops with this hook. **Always cache and return the previous reference if the data hasn't changed.**

    ```javascript
    // BAD - New object every time = infinite loop potential
    const getSnapshot = () => ({ width: window.innerWidth });

    // GOOD - Primitive caching is simpler
    const cache = React.useRef(window.innerWidth);
    const getSnapshot = () => {
      const current = window.innerWidth;
      if (current !== cache.current) {
        cache.current = current;
      }
      return cache.current; // Return primitive
    };

    // BETTER - Object caching with deep equality check
    const cache = React.useRef({ data: getExternalData() });
    const getSnapshot = () => {
      const newData = getExternalData();
      // Use a robust deep equal function here!
      if (!isDeepEqual(cache.current.data, newData)) {
        // Only create a new object if data changed
        cache.current = { data: newData };
      }
      return cache.current; // Return stable cache object
    };
    ```

3.  **Heavy Lifting in `getSnapshot`:** I once tried doing complex data filtering and transformation directly inside `getSnapshot`. Since it runs during rendering, this caused noticeable UI jank. Lesson learned: keep `getSnapshot` fast and focused on retrieving the raw data. Do transformations later (e.g., with `useMemo` in the component using the hook's value).
4.  **Ignoring SSR:** My first deployment using a `window`-dependent hook broke spectacularly during server rendering. Forgetting the `getServerSnapshot` and `typeof window` checks in `getSnapshot` and `subscribe` is a common oversight.
5.  **Leaky Subscriptions/Cleanup:** Forgetting the `return unsubscribeFn` in `subscribe`, or if using `setTimeout`/`setInterval`, forgetting to clear them in the returned cleanup function. Memory leaks are subtle but deadly.

## Wrapping Up My `useSyncExternalStore` Journey

Modern React applications inevitably need to interact with the world outside React's direct control – browser APIs, third-party scripts, legacy systems, you name it. My initial struggles with keeping these interactions consistent and performant using `useEffect` led me to reluctantly dive into `useSyncExternalStore`.

I admit I was hesitant at first; it seemed overly complex. But working through the examples, hitting the pitfalls, and seeing how it elegantly solved the very real "tearing" and synchronization problems I faced turned me into a convert. It provided the precise control and consistency guarantees that `useEffect` lacked for this specific job.

Now, whenever I need to subscribe React components to an external data source that changes over time, `useSyncExternalStore` is the first tool I consider. It required a bit more upfront thinking, especially around snapshot identity and caching, but the resulting stability and concurrent-mode readiness have been well worth the effort.

If you take one thing away from my experience: the next time you reach for `useEffect` to subscribe to something outside React, pause and ask if `useSyncExternalStore` might be a better fit. Understanding _how_ it works, even if you end up using a library that abstracts it later, provides valuable insight into React's rendering model. Just be meticulous about those `getSnapshot` return values – trust me on that one!
