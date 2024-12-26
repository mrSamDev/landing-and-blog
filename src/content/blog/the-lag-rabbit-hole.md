---
title: Understanding Frame Rate Control & The Lag Rabbit Hole - A Journey with My Canvas Game
excerpt: A deep dive into frame rate control and performance optimization in a Canvas-based paddle game, featuring solutions to common timing issues and lag problems.
publishDate: 'Dec 26 2024'
tags:
  - Paddle-Game
  - TypeScript
  - Programming
  - Performance
  - React
seo:
  image:
    src: https://res.cloudinary.com/dnmuyrcd7/image/upload/f_auto,q_auto/v1/Blog/w6cokjywcqdfvoauicue
    alt: Frame Rate Control in Canvas Games
---

This is my second blog post about building a canvas-based paddle game, and oh boy, did I go deep into the lag rabbit hole this time. If you're interested in how this project started, check out my first article at [sijosam.in/blog/paddle-game](https://sijosam.in/blog/paddle-game).

You can try the game at [mrsamdev-paddle-game.netlify.app](https://mrsamdev-paddle-game.netlify.app/) and find the source code on [GitHub](https://github.com/mrSamDev/sam-paddle-game).

## The Lag Nightmare Begins

When my brother tested the game and sent me footage, I watched in horror as the ball glitched across the screen, randomly materializing in different locations like some quantum physics experiment gone wrong.

But wait, it gets better. I try it on my ancient backup laptop, and now the ball looks drunk - sometimes crawling like a snail, other times zooming off like it's had ten espressos. The input lag is so bad it feels like I'm playing paddle game through a YouTube livestream from Mars.

## Down the Frame Timing Rabbit Hole

After couple of days of debugging after hours from my job, I found the culprit. Here's the embarrassingly simple line that was causing all this chaos:

```typescript
// Simplified example showing just the problematic part
const delta: number = 1;  // Oh you innocent little line of doom
```

This one-liner meant the game had no concept of real time passing. The ball would zip across the screen on my brother's gaming PC and crawl along on my backup laptop. Each device was essentially running its own version of the game at wildly different speeds.

## The Fix That Took Way Too Long to Figure Out

After diving into what felt like every game dev forum in existence and practically living in Mozilla's documentation, I finally got my head around proper frame timing. Here's what actually worked:

```typescript
// Showing relevant types and game loop logic
interface GameState {
    ballX: number;
    ballY: number;
    ballSpeedX: number;
    ballSpeedY: number;
}

// Rest of the game state and refs omitted for brevity...

const FRAME_TIME = 16.67; // Targeting 60 FPS

const updateGame = useCallback(() => {
    const currentTime: number = performance.now();
    let elapsed: number = currentTime - lastFrameTimeRef.current;
    
    // Cap the elapsed time because physics going crazy is no fun
    elapsed = Math.min(elapsed, FRAME_TIME * 3);
    
    if (elapsed < FRAME_TIME) {
        requestRef.current = requestAnimationFrame(updateGame);
        return;
    }

    const delta: number = elapsed / FRAME_TIME;
    
    // Now movement actually makes sense
    state.ballX += state.ballSpeedX * delta;
    state.ballY += state.ballSpeedY * delta;
    
    lastFrameTimeRef.current = currentTime - (elapsed % FRAME_TIME);
    requestRef.current = requestAnimationFrame(updateGame);
}, []);

// Additional game logic and component code omitted...
```

This journey was... educational, to say the least. Here's what I tried before getting it right:

1. First attempt: No elapsed time cap. This was fun - the ball would disappear for a second, then suddenly YEET itself across the screen if you so much as sneezed near the tab.

2. Second try: Two-frame cap. Better, but still had issues. Ever seen a ball stutter-step like it's learning to dance? I have.

3. Final version: Three-frame cap. Finally, the sweet spot between "actually playable" and "won't completely lose its mind if Windows decides it's update time."

I also went down this weird rabbit hole trying to smooth out the delta time using exponential moving averages. Spoiler alert: Made everything feel like playing through jelly. Cool math though!

## The Results (Finally!)

The game runs smoothly now across different devices and browsers. When performance dips occur, the game slows down gracefully instead of becoming erratic. The ball movement stays consistent and predictable, making the game actually playable regardless of the device's capabilities.

There's still a small amount of input lag - an inherent challenge with browser-based games - but the experience is much more stable and enjoyable than our starting point.

## What's Next?

I've moved the game to its own repo and I'm currently:
- Implementing a test suite using vitest as there is nothing else better
- Building a backend with Hono on Deno Deploy (because why not add more moving parts?)
- Setting up a Turso database for leaderboards
- Wrestling with Deno's testing tools
- Trying to make the security actually, you know, secure

The whole Hono/Turso/Deno stack is interesting, and Hono's been surprisingly chill to work with.

*If you've had your own adventures in lag-land, I'd love to hear about them. Misery loves company, right?*