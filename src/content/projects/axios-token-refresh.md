---
title: Axios Token Refresh
description: A robust Axios plugin that handles token refresh logic automatically when API calls fail due to authentication issues.
publishDate: 'April 03 2025'
tags:
  - Guide
  - Authentication
  - JavaScript
  - Programming
seo:
  image:
    src: https://res.cloudinary.com/dnmuyrcd7/image/upload/v1733839719/Blog/canvas.png
    alt: Axios Token Refresh Plugin
---

![npm version](https://img.shields.io/npm/v/@mrsamdev/axios-token-refresh.svg)

## What Is It?

Axios Token Refresh [(`@mrsamdev/axios-token-refresh`)](https://www.npmjs.com/package/@mrsamdev/axios-token-refresh) is a lightweight plugin for Axios that automatically handles authentication token management in web applications. It's like a security guard that manages your digital access passes to web services.

## The Problem It Solves

In modern web applications, API requests typically require access tokens that expire after a certain period for security reasons. Without proper token management:

- Users see errors when tokens expire
- Applications may force users to log in again
- Developers need to write complex logic to handle token refreshing

## Key Features

- 🔄 **Automatic token refresh** when API calls return 401 errors
- ⏱️ **Smart request queueing** during token refresh
- 🔁 **Automatic retry** of queued requests after successful refresh
- 🔧 **Customizable refresh conditions**
- 📊 **Status change notifications**
- ⏰ **Configurable timeout** (default: 10 seconds)
- 🔑 **Customizable auth header formatting**
- 📦 **Supports ESM and CommonJS**
- 🔒 **TypeScript support** with full type definitions

## Installation

```bash
# Using npm
npm install @mrsamdev/axios-token-refresh

# Using yarn
yarn add @mrsamdev/axios-token-refresh

# Using pnpm
pnpm add @mrsamdev/axios-token-refresh
```

## Basic Implementation

```javascript
import axios from 'axios';
import { createRefreshTokenPlugin } from '@mrsamdev/axios-token-refresh';

// Create an axios instance
const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configure the refresh token plugin
const refreshPlugin = createRefreshTokenPlugin({
  // Function to refresh the token
  refreshTokenFn: async () => {
    const response = await axios.post('https://api.example.com/refresh-token', {
      refresh_token: localStorage.getItem('refreshToken')
    });

    const newToken = response.data.access_token;
    localStorage.setItem('token', newToken);

    return newToken;
  },

  // Function to get the current token
  getAuthToken: () => localStorage.getItem('token'),

  // Optional configurations
  shouldRefreshToken: (error) => error.response && error.response.status === 401,
  onStatusChange: (status, error) => {
    console.log(`Token refresh status: ${status}`);
    if (error) console.error('Token refresh error:', error);
  }
});

// Apply the plugin to your axios instance
refreshPlugin(apiClient);

// Now use apiClient for all API calls
export default apiClient;
```

## Advanced Configuration Options

| Option                | Type                                  | Required | Default               | Description                                       |
| --------------------- | ------------------------------------- | -------- | --------------------- | ------------------------------------------------- |
| `refreshTokenFn`      | `() => Promise<string \| null>`       | Yes      | -                     | Function that refreshes and returns the new token |
| `getAuthToken`        | `() => string \| null`                | Yes      | -                     | Function that returns the current auth token      |
| `shouldRefreshToken`  | `(error, originalRequest) => boolean` | No       | Checks for 401 status | Determines if token refresh should be triggered   |
| `onStatusChange`      | `(status, error?) => void`            | No       | Console log           | Callback for refresh status updates               |
| `authHeaderFormatter` | `(token) => string`                   | No       | `Bearer ${token}`     | Formats the authorization header                  |
| `refreshTimeout`      | `number`                              | No       | `10000` (10s)         | Timeout for refresh operations                    |

## Custom Refresh Triggers Example

```javascript
shouldRefreshToken: (error) => {
  return (
    // Refresh on 401 Unauthorized
    (error.response && error.response.status === 401) ||
    // Refresh on specific error message
    error.response?.data?.error === 'token_expired' ||
    // Refresh on network errors when token exists
    (error.message === 'Network Error' && localStorage.getItem('token'))
  );
};
```

## How It Works Under The Hood

1. When an API call fails, the interceptor checks if the error meets your criteria for token refresh
2. If refresh is needed, it queues the failed request and starts the refresh process
3. During refresh, any new requests are also queued automatically
4. Once the token is refreshed, all queued requests are retried with the new token
5. If refresh fails or times out, all queued requests are rejected with detailed error information

This flow happens invisibly to users, creating a seamless experience even when tokens expire.

## TypeScript Support

```typescript
import axios, { AxiosError } from 'axios';
import { createRefreshTokenPlugin, RefreshTokenPluginOptions } from '@mrsamdev/axios-token-refresh';

const options: RefreshTokenPluginOptions = {
  refreshTokenFn: async () => {
    // Implementation with full type checking
    return 'new-token';
  },
  getAuthToken: () => localStorage.getItem('token'),
  shouldRefreshToken: (error: AxiosError) => {
    return !!error.response && error.response.status === 401;
  }
};

const refreshPlugin = createRefreshTokenPlugin(options);
```

## Compatibility

Compatible with Axios v0.21.0 and above.

## Project Links

1. NPM: https://www.npmjs.com/package/@mrsamdev/axios-token-refresh
2. Source Code: https://github.com/mrSamDev/axios-token-refresh

## License

MIT License
