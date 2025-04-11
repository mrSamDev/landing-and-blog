---
title: Bridging the Gap - React and the Outside World with useSyncExternalStore
excerpt: Seamlessly integrate external state into React components using useSyncExternalStore for responsive designs, localStorage syncing, and more.
publishDate: 'April 10 2025'
isPublished: true
tags:
  - React
  - JavaScript
  - useSyncExternalStore
  - Front-end Development
  - State Management
seo:
  image:
    src: https://res.cloudinary.com/dnmuyrcd7/image/upload/f_auto,q_auto/v1/Blog/bemskg1cumn1x9z07wym
    alt: 'React component interacting with external state using useSyncExternalStore'
---

Last month, I spent my time debugging a React application that was randomly displaying different values across components that should have been in sync. The culprit? We were directly subscribing to window events in multiple components, creating a mess of state inconsistencies. That experience led me down the rabbit hole of React's `useSyncExternalStore` hook—a tool I wish I'd known about much earlier.

Disclaimer: This is my personal experience, and other solutions exist. Research and evaluate different approaches, such as React Query or SWR for data fetching, before implementing any feature.

React excels at managing its own ecosystem of components and state, but real applications don't live in isolation. They need to communicate with browser APIs, third-party libraries, and sometimes even legacy code that's completely outside React's control. This is the gap that `useSyncExternalStore` was designed to bridge.

## The Problem: Real-World React Challenges

In a recent project, I had to work with a React app that needed to display real-time data from WebSockets while also respecting user preferences stored in localStorage. Our first implementation was a mess of useEffects, event listeners, and manual state synchronization.

Here's what we struggled with:

- **UI Inconsistencies:** Different parts of the app would show different data during the same render cycle—what the React team calls "tearing." I was seeing inconsistencies across components, which users definitely noticed.

- **Performance Bottlenecks:** We'd either update too frequently (causing unnecessary renders) or miss critical updates entirely. A developer on the team optimistically debounced an event listener, only to discover that key data updates were being delayed.

- **Subscription Management:** Ensuring that subscriptions to external data sources were properly managed (subscribed on mount, unsubscribed on unmount) proved challenging.

We needed a systematic approach to connect React to these external systems, which is exactly what `useSyncExternalStore` provides.

## How `useSyncExternalStore` Works: The Mechanics

When the React team released `useSyncExternalStore` as part of the Concurrent Features, I initially overlooked it. It wasn't until reading a debugging post-mortem that I realized its value.

At its core, the hook takes two essential functions:

- **`subscribe(callback)`:** Your subscription method that connects to the external data source. When I first implemented this, I kept forgetting that the callback must be called whenever the external data changes.

- **`getSnapshot()`:** A function that returns the current value from your external source. The key detail I missed in my first implementation: this needs to be fast and return referentially stable values when the data hasn't changed. Otherwise, you'll trigger renders unnecessarily.

![useSyncExternalStore architecture](https://res.cloudinary.com/dnmuyrcd7/image/upload/f_auto,q_auto/v1/Blog/useExternalstore/ka2mgxsndhlyswecb27q)

## useEffect vs. useSyncExternalStore: Why Make the Switch?

Before diving into examples, it's worth understanding why `useSyncExternalStore` is often superior to traditional `useEffect` approaches when dealing with external state. Having implemented both patterns in production, here's what I've observed:

### Traditional useEffect Approach

```javascript
function useWindowSizeWithEffect() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
```

### Issues with the useEffect Pattern

1.  **Race Conditions:** If the external source updates during React's rendering phase, you can end up with inconsistent UI. In our production app, this manifested as different components using different window sizes during the same render.

2.  **Subscription Timing Gaps:** There's a window between the initial render and when the effect runs where your component is disconnected from the external source. This caused flickering in our UI during page transitions.

3.  **Extra Renders:** With `useEffect`, any external update triggers a state update and then a render. With complex UIs, these cascading renders caused noticeable performance issues.

4.  **Difficult Synchronization:** Keeping multiple components in sync with the same external source required either prop drilling or context, adding complexity.

5.  **Not Concurrent Mode Safe:** When React implements time-slicing and other concurrent features, the `useEffect` pattern can lead to tearing—different parts of the UI reflecting different states.

![useEffect vs useSyncExternalStore](https://res.cloudinary.com/dnmuyrcd7/image/upload/f_auto,q_auto/v1/Blog/useExternalstore/uvmjtiolqx4etlsfcxmb)

### useSyncExternalStore Advantages

1.  **Consistency Guarantee:** React ensures all components see the same external state during a single render, eliminating tearing issues we had with event listeners.

2.  **No Timing Gaps:** Components are synchronized with the external source from the very first render, solving the flicker we experienced during transitions.

3.  **Reduced Render Overhead:** The hook optimizes renders by comparing snapshots, reducing the cascading render problem we faced with large component trees.

4.  **Concurrent Mode Ready:** Built specifically to work with React's upcoming features, future-proofing our codebase.

5.  **Server-Side Rendering Support:** With the optional server snapshot parameter, we could properly handle SSR, which our previous implementation couldn't do.

## Real-World Examples From My Projects

### 1. Responsive Layouts That Actually Work

I was working on an application that needed different layouts based on screen size. Our first attempt used media queries in CSS, but we needed more dynamic control based on precise breakpoints:

```javascript
function useWindowSize() {
  // Create a stable cache for storing the last value
  // This is crucial to prevent the "maximum update depth exceeded" error
  const cache = React.useRef({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  }).current;

  // The getSnapshot function that properly caches results
  const getSnapshot = () => {
    // For SSR or environments without window
    if (typeof window === 'undefined') {
      return cache;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;

    // Only create a new value if something changed
    if (width !== cache.width || height !== cache.height || isMobile !== cache.isMobile || isTablet !== cache.isTablet || isDesktop !== cache.isDesktop) {
      // Update cache with new values
      cache.width = width;
      cache.height = height;
      cache.isMobile = isMobile;
      cache.isTablet = isTablet;
      cache.isDesktop = isDesktop;
    }

    // Return the same object reference if nothing changed
    return cache;
  };

  return useSyncExternalStore(
    (callback) => {
      // Don't try to add listeners during SSR
      if (typeof window === 'undefined') {
        return () => {};
      }

      // Proper throttling implementation
      let lastExecTime = 0;
      const throttleInterval = 100;
      const throttledCallback = () => {
        const now = Date.now();
        if (now - lastExecTime >= throttleInterval) {
          lastExecTime = now;
          callback();
        }
      };

      window.addEventListener('resize', throttledCallback);
      return () => {
        window.removeEventListener('resize', throttledCallback);
      };
    },
    getSnapshot,
    // Server snapshot function
    () => cache
  );
}

function AppLayout() {
  const { isMobile, isTablet } = useWindowSize();

  // We realized during testing that we needed to be very explicit about
  // which layout to show, as there were edge cases where none would render
  if (isMobile) return <MobileLayout />;
  if (isTablet) return <TabletLayout />;
  return <DesktopLayout />;
}
```

This approach solved several real problems we had with our previous implementation:

1.  No more torn UI where half the components thought we were on mobile and half on desktop
2.  Predictable, controlled renders that weren't firing on every pixel change
3.  Proper cleanup that prevented potential memory leaks related to event listeners
4.  Avoiding the dreaded "maximum update depth exceeded" error by properly caching snapshot results

**Note on Throttling:** The `throttledCallback` in the above example is a true throttle implementation, ensuring the callback is executed at most once within the defined interval. The previous version incorrectly implemented a debounce.

### 2. localStorage Synchronization Across Tabs

I once had to build a multi-tab application where user preferences needed to stay in sync. If the user changed a setting in one tab, all other tabs needed to reflect it immediately. What seemed like a simple task turned into a nightmare until I found `useSyncExternalStore`:

```javascript
function useLocalStorage(key, initialValue) {
  // Use a cached value to maintain reference equality
  const cache = React.useRef(null);

  // Parse and stringify with error handling
  const getSnapshot = () => {
    // Handle SSR case
    if (typeof window === 'undefined') {
      return cache.current ?? initialValue;
    }

    try {
      // Try to get from localStorage
      const item = window.localStorage.getItem(key);
      const parsedItem = item ? JSON.parse(item) : initialValue;

      // Only update the cache if we have a new value
      if (cache.current === null || !isEqual(cache.current, parsedItem)) {
        cache.current = parsedItem;
      }

      return cache.current;
    } catch (error) {
      console.error(`Storage error for "${key}"`, error);
      // Fallback to cache or initial value on error
      if (cache.current === null) {
        cache.current = initialValue;
      }
      return cache.current;
    }
  };

  const subscribe = (callback) => {
    // SSR handling
    if (typeof window === 'undefined') {
      return () => {};
    }

    // Listen for changes in other tabs
    const handleStorageEvent = (e) => {
      if (e.key === key) {
        callback();
      }
    };

    // Listen for changes in current tab
    const handleCustomEvent = (e) => {
      if (e.detail?.key === key) {
        callback();
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('local-storage-update', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('local-storage-update', handleCustomEvent);
    };
  };

  const value = useSyncExternalStore(
    subscribe,
    getSnapshot,
    // Server snapshot
    () => initialValue
  );

  const setValue = (newValue) => {
    try {
      // Handle functional updates
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;

      // Update localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));

      // Update our cache
      cache.current = valueToStore;

      // Notify current tab about the change, include the new value
      window.dispatchEvent(
        new CustomEvent('local-storage-update', {
          detail: { key, value: valueToStore }
        })
      );
    } catch (error) {
      console.error(`Failed to update "${key}"`, error);
    }
  };

  return [value, setValue];
}

// Simple deep equality check for objects
function isEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => isEqual(a[key], b[key]));
}

function UserPreferencesPanel() {
  const [preferences, setPreferences] = useLocalStorage('user-preferences', {
    theme: 'light',
    fontSize: 'medium',
    notifications: true
  });

  return (
    <div className="preferences-panel">
      <h2>Your Settings</h2>
      <label>
        Theme:
        <select value={preferences.theme} onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </label>

      {/* More settings controls would go here */}

      <details>
        <summary>Debug Info</summary>
        <pre>{JSON.stringify(preferences, null, 2)}</pre>
      </details>
    </div>
  );
}
```

Learning points from my localStorage implementation:

1.  The `storage` event only triggers in _other_ tabs. Our first version didn't update the current tab until a refresh.
2.  Custom events were necessary to make the current tab update immediately.
3.  Error handling wasn't optional—in production, we encountered all sorts of edge cases with users who had browser extensions that interfered with localStorage.
4.  Properly implementing caching to prevent infinite render loops was critical.

**Important Considerations:**

- **Deep Equality:** The `isEqual` function provided is a basic implementation and doesn't handle circular references or different object types correctly. For more robust equality checks, consider using a library like Lodash's `isEqual` or implementing a visited objects `Map` to prevent infinite recursion.

- **Custom Events Data:** The `localStorage` example now dispatches a custom event that includes the updated value in the `detail` property. This avoids the need for other components to read directly from `localStorage`, improving performance.

- **Error Handling in `getSnapshot`:** The `getSnapshot` function includes error handling for `JSON.parse` to prevent issues if the stored data is corrupted. It falls back to the cached value or initial value to prevent the application from crashing.

## Common Pitfalls I've Encountered

After using `useSyncExternalStore` in multiple projects, I've collected a list of mistakes to avoid:

1.  **Forgetting to call the callback:** In my first implementation, I set up event listeners but forgot to actually call the callback when events occurred. The components never updated.

2.  **Creating new objects in getSnapshot:** This was the most insidious problem that led to infinite render loops. Every time React calls `getSnapshot`, you need to return the same object reference if the data hasn't actually changed.

```javascript
// BAD - creates a new object each time, causing infinite loops
const getSnapshot = () => ({ width: window.innerWidth });

// GOOD - uses stable object reference
const cache = { value: window.innerWidth };
const getSnapshot = () => {
  const current = window.innerWidth;
  if (current !== cache.value) {
    cache.value = current;
  }
  return cache.value;
};

// EVEN BETTER - complete deep comparison for complex objects
const cache = useRef({ data: initialData }).current;
const getSnapshot = () => {
  const newData = getExternalData();
  if (!isDeepEqual(cache.data, newData)) {
    cache.data = newData;
  }
  return cache;
};
```

3.  **Expensive computations in getSnapshot:** On a project, I initially did data filtering inside `getSnapshot`, causing major performance issues. I learned to keep `getSnapshot` lightweight and move computations elsewhere.

4.  **Ignoring server-side rendering:** Our first deployment broke in production because our `getSnapshot` function referenced `window`, which doesn't exist during SSR. We had to add a server snapshot:

```javascript
// Initial cache that's safe for SSR
const cache = useRef({
  width: 0,
  height: 0,
  isMobile: false,
  isTablet: false,
  isDesktop: true
}).current;

useSyncExternalStore(
  subscribe,
  // Client snapshot with safety check
  () => {
    if (typeof window === 'undefined') return cache;
    // Rest of logic here
  },
  // Server snapshot
  () => cache
);
```

5.  **Not handling cleanup properly:** In our throttled implementations, we initially forgot to clear timeouts when unmounting components, potentially leading to memory leaks.

## Conclusion

Real React apps need to work smoothly with things outside React's control—browser features, external libraries, and sometimes older code. After struggling with these connections, I've found useSyncExternalStore to be incredibly helpful.

I was skeptical at first, but seeing how it solved actual problems in our apps made me a believer. Now it's become our go-to solution when connecting React with external data sources.

If you remember just one thing: when you're about to use useEffect for subscribing to external events or data, consider trying useSyncExternalStore instead. It might save you hours of troubleshooting and keep your application consistent across components.

Just be careful to properly implement snapshot caching and use robust equality checks to avoid the "maximum update depth exceeded" error and other subtle issues that have tripped up so many developers—myself included!
