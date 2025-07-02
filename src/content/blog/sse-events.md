---
title: Server-Sent Events - A Simpler Way to Push Updates to Your Web App
excerpt: Exploring SSE as a lightweight alternative to WebSockets for real-time server-to-client communication, with practical examples and implementation tips
publishDate: 'Jul 02 2025'
isPublished: true
tags:
  - JavaScript
  - Server-Sent Events
  - Real-time Web
  - Web Development
  - Frontend
seo:
  image:
    src: https://res.cloudinary.com/dnmuyrcd7/image/upload/f_auto,q_auto/v1/Blog/s69jwwumjobewujuqg1i
    alt: 'Server-Sent Events implementation diagram'
---

While working on a web-based terminal for server logs, I needed a way to stream updates in real-time. After experimenting with WebSockets, I stumbled upon Server-Sent Events (SSE) and was surprised by how simple and effective it was for this use case. Back in 2021, SSE didn't support Bearer tokens in headers, and even now, most browsers still don't. Polyfills can help, though I'm not sure if that's changed since 2022. What I discovered is that SSE's simplicity makes it perfect for pushing updates from the server to the client without the complexity of WebSockets.

SSE shines when the server needs to send data to the client, but the client rarely needs to respond. Think live notifications, sports scores, or refreshing a carousel. It's lightweight, efficient, and built on standard HTTP, so it plays well with existing infrastructure. The catch? It's unidirectional, so if you need two-way communication, WebSockets are the way to go.

### When I Reach for SSE

I use SSE when my data flows primarily server-to-client. The pattern becomes clear when you look at specific scenarios:

Live notifications where I'm updating a badge count or pushing alerts. Sports scores or stock prices that need constant updates. Refreshing content like signaling a carousel to load new items. Server logs or monitoring data streaming to a dashboard.

The key insight I've learned: if your data flow is primarily server-to-client, SSE is often simpler and more efficient than WebSockets. Just to send some logs unidirectionally, WebSockets would be overkill. You're establishing a full-duplex connection when you only need half of it, consuming unnecessary server resources in the process.

### Why SSE is Underappreciated

SSE seems to get overlooked in favor of WebSockets, but it's significantly less resource-heavy. WebSockets maintain a persistent TCP connection with full bidirectional capabilities, which means more memory usage and connection overhead on the server. For simple one-way data streaming, that's like using a fire hose when you need a garden sprinkler.

SSE uses regular HTTP connections and leverages the browser's built-in reconnection logic. The server doesn't need to manage complex connection states or handle ping/pong frames. This translates to lower memory usage and simpler server-side code.

### Getting Started: The Basics

The client-side setup is straightforward. The `EventSource` listens for messages from the server and updates the UI:

```javascript
const eventSource = new EventSource('/events');

eventSource.onmessage = (event) => {
  console.log('Received event:', event.data);
  document.getElementById('data-display').textContent = event.data;
};

eventSource.onerror = (error) => {
  console.error('EventSource failed:', error);
  eventSource.close();
};

eventSource.onopen = () => {
  console.log('SSE connection opened');
};
```

On the server side, you'll need to set three key headers. `Content-Type: text/event-stream` is essential to let the browser know it's dealing with an SSE stream, while `Cache-Control: no-cache` and `Connection: keep-alive` ensure the connection stays open and responsive. Both Express and Hono handle this well, though Hono's lightweight nature makes it particularly good for SSE implementations.

### Implementation Examples

Here's how I typically set up SSE servers in both Express and Hono:

**Express Server:**

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let counter = 0;

  const intervalId = setInterval(() => {
    const data = `data: Hello from server! Counter: ${counter}\n\n`;
    res.write(data);
    counter++;
  }, 1000);

  req.on('close', () => {
    clearInterval(intervalId);
    console.log('Client disconnected');
    res.end();
  });
});

app.listen(port, () => {
  console.log(`SSE server listening at http://localhost:${port}`);
});
```

**Hono Server:**

```javascript
import { Hono } from 'hono';

const app = new Hono();
const port = 3000;

app.get('/events', (c) => {
  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');

  let counter = 0;
  const intervalId = setInterval(() => {
    const data = `data: Hello from server! Counter: ${counter}\n\n`;
    c.write(data);
    counter++;
  }, 1000);

  c.req.raw.on('close', () => {
    clearInterval(intervalId);
    console.log('Client disconnected');
    c.close();
  });

  return c.body(null);
});

app.listen({ port: port }, () => {
  console.log(`Hono SSE server listening at http://localhost:${port}`);
});
```

The main difference lies in the API style—Hono's syntax feels more streamlined, while Express remains a reliable choice for developers who prefer its established patterns.

### What I've Built with SSE

Real-time notification badges work particularly well. The server sends the count, and the client updates the display:

```javascript
eventSource.onmessage = (event) => {
  const notificationCount = parseInt(event.data);
  document.getElementById('notification-badge').textContent = notificationCount;
};
```

Server sends: `data: 12\n\n`

Another approach I've used is signaling the client to refresh a carousel when new content is available:

```javascript
eventSource.onmessage = (event) => {
  if (event.data === 'refresh-carousel') {
    console.log('Refreshing carousel content');
    refreshCarousel();
  }
};
```

Server sends: `data: refresh-carousel\n\n`

Live sports scores are another natural fit. The server sends JSON data, and the client updates the scoreboard:

```javascript
eventSource.onmessage = (event) => {
  const scoreData = JSON.parse(event.data);
  document.getElementById('team-a-score').textContent = scoreData.teamA;
  document.getElementById('team-b-score').textContent = scoreData.teamB;
};
```

Server sends: `data: {"teamA": 24, "teamB": 21}\n\n`

### The Authentication Challenge

This is where I encountered a significant challenge in 2021, and unfortunately, it remains unresolved in 2025. The standard `EventSource` API doesn't let you set custom headers like `Authorization: Bearer <token>`. Passing the token in the URL is a security risk. Polyfills can help, but they're not always reliable.

In my log streaming project, I ended up using session cookies for authentication since the application was already using them for other endpoints. This approach worked because I controlled both the client and server, but it's not ideal for all scenarios.

For projects requiring token-based authentication, you can try a polyfill approach:

```javascript
const eventSource = new EventSourcePolyfill('/events', {
  headers: {
    Authorization: 'Bearer <your-token>'
  }
});
```

This allows custom headers, but polyfills may not work in all environments. Testing across your target browsers is essential.

### Things I've Learned the Hard Way

Memory management becomes critical with SSE. The `req.on('close')` event on the server is crucial—use it to clear intervals and free resources when clients disconnect. Without proper cleanup, you risk memory leaks that can cause performance issues in production. My log streaming server taught me this lesson when it started consuming excessive memory after a few hours of use.

Browser compatibility requires attention. SSE support is generally good in modern browsers, but I've encountered issues with older versions of Internet Explorer and some mobile browsers. Testing across your target browsers is non-negotiable.

Connection reliability matters more than you might expect. SSE connections can drop for various reasons—network issues, server restarts, or users closing tabs. The browser will attempt to reconnect automatically, but implementing your own retry logic gives you better control:

```javascript
let retryCount = 0;
const maxRetries = 5;

eventSource.onerror = (error) => {
  console.error('EventSource failed:', error);
  if (retryCount < maxRetries) {
    retryCount++;
    setTimeout(() => {
      eventSource = new EventSource('/events');
    }, 1000 * retryCount);
  } else {
    console.error('Max retries reached. Giving up.');
    eventSource.close();
  }
};
```

Resource consumption scales with concurrent connections, but SSE handles this more gracefully than WebSockets. The simpler connection model means less overhead per client, making it more suitable for applications with many concurrent users receiving updates.

### Why I Keep Using SSE

In my experience, SSE's simplicity has been a major advantage for projects with one-way data flow. It's less resource-heavy than WebSockets while still providing real-time updates. The authentication limitations are frustrating, but they're not dealbreakers for most use cases.

SSE deserves more recognition in the real-time web development space. When you need to push updates from server to client without the complexity and overhead of WebSockets, SSE consistently delivers reliable results with minimal server resources. For streaming server logs, updating dashboards, or pushing notifications, it's often the more sensible choice that developers overlook in favor of more complex solutions.
