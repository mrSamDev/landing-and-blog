export type PowerUpType = 'wider' | 'smaller' | 'faster' | 'slower';

export type ParticleEventType = 'WALL_COLLISION' | 'CEILING_COLLISION' | 'PADDLE_COLLISION' | 'GAME_OVER' | 'POWER_UP_COLLECT';

export interface Particle {
    x: number;
    y: number;
    speedX: number;
    speedY: number;
    life: number;
    color: string;
}

export interface PowerUp {
    x: number;
    y: number;
    type: PowerUpType;
    speed: number;
    color: string;
}

export interface ParticleColors {
    WALL_COLLISION: string;
    CEILING_COLLISION: string;
    PADDLE_COLLISION: string;
    GAME_OVER: string;
    POWER_UPS: {
        COLLECT: Record<PowerUpType, string>;
    };
}

export interface ParticleCounts extends Record<ParticleEventType, number> {}

export interface GameState {
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
