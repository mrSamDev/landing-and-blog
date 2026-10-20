---
title: Using @defer in GraphQL
excerpt: 'A guide to incremental delivery in GraphQL with the @defer directive: syntax, payloads, client handling, requirements, and when not to use it.'
publishDate: 'Oct 21 2026'
tags:
  - GraphQL
  - Performance
  - Web Vitals
  - Apollo
---

`@defer` is a GraphQL directive that lets a server send part of a response immediately and stream the rest as it resolves. It is an incremental delivery feature, not a caching or query-planning one: the operation still declares everything the UI needs, and the transport decides when each fragment arrives.

It exists to solve one failure mode. With a conventional single-response request, the client waits for the whole operation before it sees a complete response, so one slow resolver sets the latency of the entire page. If recommendations take 3.5s and the hero takes 200ms, the browser gets nothing for 3.5s. `@defer` marks the slow fragments as optional-later so the fast data can ship first.

## Syntax

`@defer` decorates a fragment spread or an inline fragment. It can't be applied to a field.

```graphql
query ProductPage($id: ID!, $deferReviews: Boolean!) {
  product(id: $id) {
    ...ProductHero
    ...ProductReviews @defer(if: $deferReviews)
    ...ProductRecommendations @defer
  }
}
```

The `if:` argument takes a Boolean variable and disables deferral for that operation. It's the clean way to share a fragment across a page that should defer and a route that shouldn't, without duplicating the query.

A deferred fragment must still be part of a normal selection set. `@defer` changes arrival order, not the shape of the result: the client receives the same fields it would have received anyway, just in separate payloads.

## What the server sends

The initial response goes out over `multipart/mixed`, followed by incremental payloads, each carrying a `path` back into the response tree. Conceptually it looks like this:

```json
{ "data": { "product": { "id": "p_123", "name": "Espresso Machine" } }, "hasNext": true }
{ "incremental": [ { "path": ["product"], "data": { "reviews": [ ... ] } } ], "hasNext": true }
{ "incremental": [ { "path": ["product"], "data": { "recommendations": [ ... ] } } ], "hasNext": false }
```

`hasNext: false` closes the stream. Payloads arrive in completion order, not declaration order, so a fast deferred fragment can land before a slower one declared earlier in the query.

That snippet is an illustration, not a copy-pasteable wire format. A real response is a multipart body with boundaries and a `Content-Type` per part, and it stays chunked only if nothing in the network path waits for the last byte before forwarding. The incremental format itself is still not standardized: the current proposal announces deferred work up front in a `pending` array with ids, then matches each `incremental` payload back by that id, and closes sections with `completed`. Apollo Router and the GraphQL 17 alphas disagree on details. Don't hand-parse this.

Each incremental payload updates one part of the original response. The operation never becomes several operations. But a deferred fragment can fail after the initial payload is already on the wire, so errors arrive per-section instead of as one top-level `errors` array. That means partial data and partial errors share a page, and the client needs a boundary per deferred section, not one page-level catch.

## Client handling

The examples below assume Apollo Client 4.3 or later. Older versions differ on the details that matter here.

Apollo Client can do incremental delivery, but not by default. Its default handler (`NotImplementedHandler`) throws the moment it sees `@defer` or `@stream`, because the wire format isn't standardized yet. Pick a handler that matches your server:

```ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { Defer20220824Handler } from '@apollo/client/incremental';

const client = new ApolloClient({
  link: new HttpLink({ uri: '/graphql' }),
  cache: new InMemoryCache(),
  incrementalHandler: new Defer20220824Handler(),
});
```

`Defer20220824Handler` speaks the format Apollo Router emits. The GraphQL 17 alphas ship their own handlers. A mismatch shows up as a parse failure at runtime.

Deferred fragments are written to the normalized cache separately, so any component reading those fields re-renders when its payload lands.

```tsx
const { data, networkStatus } = useQuery<ProductPageQuery>(PRODUCT_PAGE_QUERY, {
  variables: { id, deferReviews: true },
});

const isStreaming = networkStatus === NetworkStatus.streaming;
const reviews = data?.product?.reviews;

if (!reviews) {
  return isStreaming ? <ReviewsSkeleton /> : <ReviewsUnavailable />;
}
return <ReviewList reviews={reviews} />;
```

With the handler configured, `loading` stays `true` until the stream closes. That covers a whole page but says nothing about which fragment is still outstanding.

For that, use `networkStatus === NetworkStatus.streaming`. It tells you the request is still in flight, regardless of how much data has arrived.

Do not use `dataState` for this. It is a type-narrowing signal about which fields are safe to read, not a transport signal. Apollo Client 4.3 changed when it reports `"streaming"`: mid-stream chunks can now come back as `"partial"` or even `"complete"`, because a payload can satisfy part of the query or merge with data already in the cache. Code that checked `dataState === "streaming"` to decide whether work was pending was relying on behavior that no longer holds.

Missing data is also not proof that a section is still loading. It can be `null`, dropped because of an error, or never requested. If you key a skeleton on absence alone, an errored fragment renders as though it were still in flight, forever.

For other clients, check that the transport actually supports `multipart/mixed`. `graphql-request`, `urql`, and hand-rolled `fetch` wrappers need incremental delivery explicitly enabled or they'll hang waiting for a single JSON body. Several of them will reject the `@defer` directive outright if the client schema doesn't declare it.

## Requirements

Server support is not universal. Apollo Router, Apollo Server, GraphQL Yoga, Mercurius, and Hot Chocolate implement incremental delivery; smaller servers and older gateway versions may ignore or reject `@defer`. Check the server's version before restructuring a page around it.

The network path matters just as much. Anything that buffers a response and waits for the last byte, including some CDNs, reverse proxies, ingress configs, and compression middleware, will turn the stream back into one serialized body and erase the benefit. If LCP doesn't move after adding `@defer`, test the origin directly before blaming the query.

## When to defer

The rule is one sentence: defer work that delays useful content, never work that determines what the user sees or how the page is laid out.

Everything else follows from it.

If a section is not on screen at first paint, the page is already complete without it. Below-the-fold sections, content behind a tab, panels that need an interaction, a secondary list that loads after the primary one: all of them can arrive late without the user noticing the gap.

If a resolver is genuinely expensive, deferring it moves first paint earlier. Personalization, third-party service calls, aggregation over large collections. The gain is proportional to the gap between the fast fields and the slow one, so a fragment that resolves in 20ms buys nothing and costs a round trip.

If a fragment decides the layout, deferring it is the one case where you can lose. A late price, primary image, or container size trades an LCP win for a layout shift, and CLS is the more expensive problem. Keep the hero, the price, and the main media in the initial response.

## `@stream`

`@stream` is the sibling directive for lists. Where `@defer` delays a whole fragment, `@stream` delivers list items as they resolve, one patch at a time.

```graphql
query Feed {
  posts @stream(initialCount: 3) {
    id
    title
  }
}
```

Use `@defer` for sections, `@stream` for lists. Both share the same incremental transport, so the server and proxy requirements are identical.

## Why not just a second query?

Worth asking, because a second query is the older answer to this problem. Split recommendations into their own operation and the hero renders fast without any new server feature. But now the page has two requests, two cache entries, two error states, and a client that has to know the second request is optional. A slow second query that fails silently is easy to ship and hard to notice.

`@defer` takes the other trade. One operation, one loading story, and the server decides when each fragment is ready. The cost is that server, client, and proxy all have to agree on a protocol that isn't fully settled.

It relocates the cache problem rather than removing it. Deferred payloads still have to merge into a consistent store, and a fragment that arrives out of order or fails after the initial payload is a case your cache and your components now have to handle. What you stop paying for is the client-side orchestration of a second request. That's the actual decision, and it's why the requirements section matters more than the syntax.

## The Bottom Line

Don't defer the hero. Don't defer a fragment that resolves faster than the extra payload is worth, which for most pages means anything in the low hundreds of milliseconds. Don't rely on it without confirming the server and the network path both pass streaming responses through.

When those hold, `@defer` can improve perceived performance without splitting one page into several client queries. The operation stays declarative, the components still read the same fields, and the browser paints as soon as the first payload lands.

It is not free work. The slow fragment still consumes backend resources, the operation still takes as long as it takes, and the server may do extra orchestration to emit payloads in order. What you buy is perceived speed and a simpler client, not a faster query.
