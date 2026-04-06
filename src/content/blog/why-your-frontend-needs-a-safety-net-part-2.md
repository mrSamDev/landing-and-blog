---
title: Why Your Frontend Needs a Safety Net - Part 2
excerpt: TanStack Query is a powerful tool. Used without discipline, it quietly makes your backend hate you.
publishDate: 'April 6 2026'
tags:
  - Guide
  - JavaScript
  - TypeScript
  - Programming
  - Architecture
  - React
  - TanStack Query
  - Performance
  - Web Development
isFeatured: true
seo:
  image:
    src: 'https://res.cloudinary.com/dnmuyrcd7/image/upload/v1733818933/fypxxcxg6vwf7ssjrcwf.jpg'
    alt: JavaScript code on a computer screen
---

In [Part 1](https://www.sijosam.in/blog/why-your-frontend-needs-a-safety-net/), I showed why raw API data flowing through your components causes slow rot. The fix was a transformer layer that gives you one place to absorb API changes. But once that's in place, a different problem creeps in, and this one hides until production.

I started leaning hard on TanStack Query. It cleaned up so much boilerplate that I assumed I was done thinking about data. That assumption cost me — redundant network requests, unnecessary API pressure, and a backend that started degrading before anyone noticed.

---

## When Convenience Scales Poorly

TanStack Query has a clean mental model: client state handles UI, server state handles API data. That split is correct. The trouble starts when you treat the cache as something the library manages for you.

A typical mutation flow looks fine on paper: perform an action, invalidate related queries, let the system refetch. At small scale, this works. Under moderate load — dozens of concurrent users, high-frequency writes — one user action can trigger multiple mutations, each firing its own invalidations, each kicking off its own refetches. Multiply that across concurrent users and your backend starts sweating before your users notice anything.

---

## Over-Invalidation

Invalidation is eager consistency: "I don't know exactly what changed, so refetch anything that might have changed." It's safe. It's also expensive.

Here's a concrete example. A user completes an action that touches their stats, their activity feed, and a global counter:

```typescript
const mutation = useMutation({
  mutationFn: completeAction,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['user'] });
    queryClient.invalidateQueries({ queryKey: ['activity'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
    queryClient.invalidateQueries({ queryKey: ['counters'] });
  }
});
```

Four network requests per user action, every time. The UI looks responsive. Your API metrics tell a different story.

---

## What Actually Works Better

Before you reach for `invalidateQueries`, ask one question: do you already know the new state?

If your mutation returns the updated resource, use it. Update the cache directly and skip the refetch entirely.

```typescript
const mutation = useMutation({
  mutationFn: updateUser,
  onSuccess: (updatedUser) => {
    queryClient.setQueryData(['user', updatedUser.id], updatedUser);
    // No invalidation. No refetch. Done.
  }
});
```

The mental model shift:

```
// Default pattern — N requests per action
user action → mutation → invalidateQueries × 4 → refetch × 4

// Disciplined pattern — 1 request per action
user action → mutation → setQueryData (done)
```

Under real load, that difference compounds fast.

When you do need multiple cache updates, be deliberate. Update what you know directly, and only invalidate what you can't predict.

```typescript
const mutation = useMutation({
  mutationFn: completeAction,
  onSuccess: (result) => {
    queryClient.setQueryData(['user', 'stats'], result.stats);
    queryClient.setQueryData(['user', 'activity'], result.activity);

    // Only invalidate what you genuinely can't derive
    queryClient.invalidateQueries({ queryKey: ['counters'] });
  }
});
```

Flat query keys force you to choose between invalidating everything or nothing. Hierarchical keys let you be precise.

```typescript
// Flat: one key, no control
queryClient.invalidateQueries({ queryKey: ['user'] });

// Hierarchical: invalidate at the right level
const userKeys = {
  all: ['user'] as const,
  activity: () => ['user', 'activity'] as const,
  stats: () => ['user', 'stats'] as const
};

// Invalidates stats without touching profile or activity data
queryClient.invalidateQueries({ queryKey: userKeys.stats() });
```

Setting `staleTime` is the simplest lever most teams skip. By default, every query is considered stale immediately — any refocus or remount triggers a refetch. Raise it to match how often your data actually changes:

```typescript
const { data } = useQuery({
  queryKey: ['user', 'stats'],
  queryFn: fetchUserStats,
  staleTime: 30_000 // treat data as fresh for 30 seconds
});
```

That alone can eliminate a significant share of redundant fetches without touching your invalidation logic.

---

## The Optimistic Update Problem

An optimistic update lets the UI reflect a change before the server confirms it. The intent is good: faster perceived response. The implementation is where things go wrong.

Here's what a correct optimistic update actually looks like:

```typescript
const mutation = useMutation({
  mutationFn: (newTodo: string) =>
    fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ text: newTodo })
    }),
  onMutate: async (newTodo) => {
    // Cancel in-flight queries so they don't overwrite the optimistic update
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    // Snapshot current state for rollback
    const previousTodos = queryClient.getQueryData(['todos']);

    // Manually update the cache
    queryClient.setQueryData(['todos'], (old: string[]) => [...old, newTodo]);

    return { previousTodos };
  },
  onError: (_err, _newTodo, context) => {
    queryClient.setQueryData(['todos'], context?.previousTodos);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  }
});
```

Three of those lines (`cancelQueries`, `getQueryData`, `setQueryData`) have no type binding between the query key `['todos']` and the data they operate on. You're asserting the shape yourself. If `old` is actually a `string[]` but you treat it as `Todo[]`, nothing complains until runtime.

It gets worse over time. Say the API changes and the endpoint starts returning objects instead of plain strings. Every optimistic update that touches this key is now wrong. Silently, confidently wrong. TypeScript can't help because there's no structural link between the key and the data type. You end up doing a manual audit of every `setQueryData` call, hoping you didn't miss one.

You've also reimplemented server logic on the client. To do this correctly you have to predict the final server state, merge it with existing cached data, and handle rollback on failure. That's not a UI concern. That's domain logic now living in two places, one of which has no compiler backing it.

The TanStack team is aware of this. [TanStack DB](https://tanstack.com/db/latest/docs/overview) takes a different approach, replacing string query keys with typed collections where optimistic state is managed structurally, not manually. It's still in beta, and I haven't put it under real load yet, but at least trying to address the right problem.

---

## A More Stable Approach

Think of it as a decision hierarchy:

| Strategy            | Use Case                                       |
| ------------------- | ---------------------------------------------- |
| Direct cache update | Mutation returns the full updated resource     |
| Optimistic update   | Simple, predictable UI feedback (toggle, like) |
| Invalidation        | You genuinely don't know what changed          |

Optimistic updates aren't bad, they're overused. Keep them for cases where the outcome is trivially predictable. For anything with complex state or branching logic, wait for the server response and update the cache from that.

Centralize your cache write logic, too. When it's spread across hooks, every refactor is a chance to miss one.

---

TanStack Query isn't the problem. It's powerful precisely because it doesn't make decisions for you. The mistake is assuming it will. Measure request count per user action, treat invalidation as a cost you're choosing to pay, and design your APIs to return enough data to update caches directly. Systems that hold up under load aren't built from clever tricks; they're built from small, deliberate choices made consistently.
