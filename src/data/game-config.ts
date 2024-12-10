import type { ParticleCounts } from '../types/paddle-game';

export const COLORS = {
    BACKGROUND: '#1a1a1a',
    TEXT: 'white',
    BALL: '#60a5fa',
    PADDLE: '#4a5568',
    WALL_COLLISION_PARTICLE: '#60a5fa',
    PADDLE_COLLISION_PARTICLE: '#22c55e',
    GAME_OVER_PARTICLE: '#ef4444',
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
    },
    POWER_UPS: {
        wider: '#22c55e',
        smaller: '#ef4444',
        faster: '#3b82f6',
        slower: '#a855f7'
    }
};

export const CONTROLS = {
    PAUSE: 'Space',
    MOVE_LEFT: 'ArrowLeft',
    MOVE_RIGHT: 'ArrowRight'
};

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
    SPEED_MULTIPLIERS: {
        POWER_UP_FASTER: 1.2,
        POWER_UP_SLOWER: 0.8,
        PADDLE_WIDER: 1.5,
        PADDLE_SMALLER: 0.75
    },
    SCORE_INCREMENT: 10
};

export const FONTS = {
    PRIMARY: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    SIZES: {
        LARGE: '30px',
        MEDIUM: '20px'
    }
};

export const PARTICLE_SETTINGS = {
    COUNTS: {
        WALL_COLLISION: 8,
        CEILING_COLLISION: 8,
        PADDLE_COLLISION: 12,
        GAME_OVER: 20,
        POWER_UP_COLLECT: 15
    } as ParticleCounts,
    SPEED: 3,
    INITIAL_LIFE: 1,
    DECAY_RATE: 0.02,
    SIZE_MULTIPLIER: 3
};
