---
title: Paddle Game Adventures - Implementing a Canvas Game in React
excerpt: Learn how to build a classic paddle game using React and the Canvas API. We'll cover game loops, collision detection, particle effects, and power-ups while exploring fundamental game development concepts.
publishDate: 'Dec 6 2024'
tags:
  - Guide
  - Game
  - JavaScript
  - Programming
seo:
  image:
    src: https://res.cloudinary.com/example/paddle-game.jpg
    alt: React Canvas Paddle Game Development
---

The world of canvas and React Three Fiber has always been a mystery to me, as I never really tried my hand at it myself. Coming from a React background, I figured before diving into the complexities of WebGL and Three.js, I should start with something simpler - the good old Canvas API. As I started reading about the exciting WebGPU improvements coming to browsers and the possibilities with Three.js, my curiosity was piqued. But I thought, why not start with the basics? Let's call it Paddle Game (to avoid any copyright violations, of course).

TLDR: There are a ton of issues, but the basic example is functioning and available on my site, along with the source code. Consider this my first step before diving into the world of WebGL and React Three Fiber!

## The Journey Begins

Let's dive into how I built this game, starting with the core configurations and types. I'll share the actual code I used, bugs and all, because sometimes the messy parts are where we learn the most!

### Core Game Configuration

First, here's how I set up the game constants. I used TypeScript to keep things type-safe (and to help catch my inevitable mistakes):

```typescript
export const GAME_SETTINGS = {
  BASE_PADDLE_SPEED: 5,
  INITIAL_BALL_SPEED: 5,
  INITIAL_PADDLE_WIDTH: 80,
  INITIAL_BALL_SIZE: 10,
  POWER_UP_DURATION: 5000,
  POWER_UP_SPAWN_CHANCE: 0.2,
  MOBILE_BREAKPOINT: 768,
  CANVAS: {
    WIDTH: 700,
    HEIGHT: 300
  },
  PADDLE_SIZE_LIMITS: {
    MIN: 40,
    MAX: 150
  },
  SCORE_INCREMENT: 10
};

export const COLORS = {
  BACKGROUND: '#1a1a1a',
  TEXT: 'white',
  BALL: '#60a5fa',
  PADDLE: '#4a5568',
  PARTICLES: {
    WALL_COLLISION: '#60a5fa',
    CEILING_COLLISION: '#60a5fa',
    PADDLE_COLLISION: '#22c55e',
    GAME_OVER: '#ef4444',
    POWER_UPS: {
      COLLECT: {
        wider: '#22c55e',
        smaller: '#ef4444',
        faster: '#3b82f6',
        slower: '#a855f7'
      }
    }
  }
};
```

### Game State Management

Here's where things get interesting. I used React's useRef hook to manage the game state without causing unnecessary re-renders. The TypeScript interfaces help keep everything organized:

```typescript
interface GameState {
  ballX: number;
  ballY: number;
  ballSpeedX: number;
  ballSpeedY: number;
  paddleX: number;
  score: number;
  particles: Particle[];
  powerUps: PowerUp[];
  paddleWidth: number;
  ballSize: number;
  isPaused: boolean;
  isGameOver: boolean;
}

const gameState = useRef<GameState>({
  ballX: GAME_SETTINGS.CANVAS.WIDTH / 2,
  ballY: GAME_SETTINGS.CANVAS.HEIGHT / 2,
  ballSpeedX: GAME_SETTINGS.INITIAL_BALL_SPEED,
  ballSpeedY: GAME_SETTINGS.INITIAL_BALL_SPEED,
  paddleX: GAME_SETTINGS.CANVAS.WIDTH / 2 - GAME_SETTINGS.INITIAL_PADDLE_WIDTH / 2,
  score: 0,
  particles: [],
  powerUps: [],
  paddleWidth: GAME_SETTINGS.INITIAL_PADDLE_WIDTH,
  ballSize: GAME_SETTINGS.INITIAL_BALL_SIZE,
  isPaused: false,
  isGameOver: false
});
```

### The Fun Part: Particle Effects

One of the things I'm most proud of (even though it's not perfect) is the particle system. Here's how I implemented it:

```typescript
const createParticles = useCallback((x: number, y: number, type: ParticleEventType, powerUpType?: PowerUpType) => {
  const count = PARTICLE_SETTINGS.COUNTS[type];
  let color: string;

  if (type === 'POWER_UP_COLLECT' && powerUpType) {
    color = COLORS.PARTICLES.POWER_UPS.COLLECT[powerUpType];
  } else {
    color = COLORS.PARTICLES[type as keyof Omit<ParticleColors, 'POWER_UPS'>];
  }

  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    particles.push({
      x,
      y,
      speedX: Math.cos(angle) * PARTICLE_SETTINGS.SPEED,
      speedY: Math.sin(angle) * PARTICLE_SETTINGS.SPEED,
      life: PARTICLE_SETTINGS.INITIAL_LIFE,
      color
    });
  }

  gameState.current.particles.push(...particles);
}, []);
```

### Power-Ups: Adding Some Spice

To make the game more interesting, I added power-ups that affect the paddle size and ball speed:

```typescript
const applyPowerUp = useCallback(
  (type: PowerUp['type']) => {
    const state = gameState.current;
    switch (type) {
      case 'wider':
        state.paddleWidth = Math.min(state.paddleWidth * 1.5, 150);
        break;
      case 'smaller':
        state.paddleWidth = Math.max(state.paddleWidth * 0.75, 40);
        break;
      case 'faster':
        state.ballSpeedX *= 1.2;
        state.ballSpeedY *= 1.2;
        break;
      case 'slower':
        state.ballSpeedX *= 0.8;
        state.ballSpeedY *= 0.8;
        break;
    }

    // Reset power-up after 5 seconds
    setTimeout(() => {
      if (type === 'wider' || type === 'smaller') {
        state.paddleWidth = 80;
      } else if (type === 'faster' || type === 'slower') {
        state.ballSpeedX = state.ballSpeedX > 0 ? 5 * speedMultiplier : -5 * speedMultiplier;
        state.ballSpeedY = state.ballSpeedY > 0 ? 5 * speedMultiplier : -5 * speedMultiplier;
      }
    }, 5000);
  },
  [speedMultiplier]
);
```

### The Main Game Loop

Here's where most of the magic (and bugs) happens. The updateGame function handles rendering and game logic:

```typescript
const updateGame = useCallback(() => {
  const canvas = canvasRef.current;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = COLORS.BACKGROUND;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const state = gameState.current;

  if (state.isPaused || state.isGameOver) {
    // Handle pause/game over states
    ctx.font = state.isGameOver ? '30px Arial' : `${FONTS.SIZES.LARGE} ${FONTS.PRIMARY}`;
    ctx.fillStyle = COLORS.TEXT;
    ctx.textAlign = 'center';
    ctx.fillText(state.isGameOver ? 'Game Over' : 'PAUSED', canvas.width / 2, canvas.height / 2);
    requestRef.current = requestAnimationFrame(updateGame);
    return;
  }

  // Update game elements and handle collisions
  updatePaddlePosition();
  state.ballX += state.ballSpeedX;
  state.ballY += state.ballSpeedY;

  // Collision detection and handling
  const isBallHittingWall = state.ballX > canvas.width - state.ballSize || state.ballX < state.ballSize;
  const isBallHittingCeiling = state.ballY < state.ballSize;
  const isBallInPaddleZone = state.ballY > canvas.height - 30 - state.ballSize;
  const isBallAlignedWithPaddle = state.ballX > state.paddleX && state.ballX < state.paddleX + state.paddleWidth;
  const isBallHittingPaddle = isBallInPaddleZone && isBallAlignedWithPaddle;

  // Handle collisions and create particles
  if (isBallHittingWall) {
    state.ballSpeedX = -state.ballSpeedX;
    createParticles(state.ballX, state.ballY, 'WALL_COLLISION');
  }

  if (isBallHittingPaddle) {
    state.ballSpeedY = -state.ballSpeedY;
    state.score += GAME_SETTINGS.SCORE_INCREMENT;
    setCurrentScore(state.score);
    createParticles(state.ballX, state.ballY, 'PADDLE_COLLISION');

    // Chance to spawn power-up on paddle hit
    if (Math.random() < 0.2) {
      spawnPowerUp();
    }
  }

  // Update and render particles
  state.particles = state.particles.filter((particle) => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    particle.life -= 0.02;

    if (particle.life > 0) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.life * 3, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life;
      ctx.fill();
      ctx.globalAlpha = 1;
      return true;
    }
    return false;
  });

  // Draw game elements
  ctx.beginPath();
  ctx.arc(state.ballX, state.ballY, state.ballSize, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.BALL;
  ctx.fill();

  ctx.fillStyle = COLORS.PADDLE;
  ctx.fillRect(state.paddleX, canvas.height - 20, state.paddleWidth, 10);

  requestRef.current = requestAnimationFrame(updateGame);
}, [createParticles, spawnPowerUp, updatePaddlePosition]);
```

## Current Issues and Future Improvements

1. The requestAnimationFrame handling could be better - sometimes the ball speed gets a bit weird
2. Collision detection isn't perfect - occasionally the ball can slip under the paddle
3. The particle system could be more optimized

But you know what? It's working, it's playable, and most importantly, it was a great learning experience. I'm viewing this as my first step into the world of canvas-based games, and I'm excited to keep improving it.

## What's Next?

I'm planning to:

Fix the current bugs (especially those pesky collision issues)
Add proper frame-rate independent movement
Implement a proper particle pool for better performance
Maybe add some sound effects (once I figure out the Web Audio API!)

The source code is available in [my blog's codebase](https://github.com/mrSamDev/landing-and-blog/blob/main/src/components/PaddleGame.tsx), and you can try the game right here on the site. This has been a great learning experience diving into Canvas game development, and I'm excited to explore more advanced topics like WebGL and Three.js in the future.
Remember, sometimes the best way to learn is to just start building, even if it's not perfect at first. Happy coding!
