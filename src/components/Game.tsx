import { useEffect, useRef, useState, useCallback } from 'react';

interface GameState {
    ballX: number;
    ballY: number;
    ballSpeedX: number;
    ballSpeedY: number;
    paddleX: number;
    score: number;
    particles: Particle[];
    powerUps: PowerUp[];
    combo: number;
    paddleWidth: number;
    ballSize: number;
    isPaused: boolean;
    isGameOver: boolean;
}

interface Particle {
    x: number;
    y: number;
    speedX: number;
    speedY: number;
    life: number;
    color: string;
}

interface PowerUp {
    x: number;
    y: number;
    type: 'wider' | 'smaller' | 'faster' | 'slower';
    speed: number;
    color: string;
}

const POWER_UP_COLORS = {
    wider: '#22c55e',
    smaller: '#ef4444',
    faster: '#3b82f6',
    slower: '#a855f7'
};

const BASE_PADDLE_SPEED = 5;
const MOBILE_BREAKPOINT = 768;

const CanvasGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [highScore, setHighScore] = useState(0);
    const [speedMultiplier, setSpeedMultiplier] = useState(1);
    const [paddleSpeedMultiplier, setPaddleSpeedMultiplier] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const requestRef = useRef<number>();
    const keysPressed = useRef<Set<string>>(new Set());

    const gameState = useRef<GameState>({
        ballX: 350,
        ballY: 150,
        ballSpeedX: 5,
        ballSpeedY: 5,
        paddleX: 310,
        score: 0,
        particles: [],
        powerUps: [],
        combo: 1,
        paddleWidth: 80,
        ballSize: 10,
        isPaused: false,
        isGameOver: false
    });

    const resetGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        gameState.current = {
            ...gameState.current,
            ballX: canvas.width / 2,
            ballY: canvas.height / 2,
            ballSpeedX: 5 * speedMultiplier,
            ballSpeedY: 5 * speedMultiplier,
            paddleX: canvas.width / 2 - 40,
            score: 0,
            combo: 1,
            paddleWidth: 80,
            powerUps: [],
            isGameOver: false
        };
    }, [speedMultiplier]);

    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    const handleSpeedChange = (multiplier: number) => {
        setSpeedMultiplier(multiplier);
        const state = gameState.current;
        const direction = {
            x: Math.sign(state.ballSpeedX),
            y: Math.sign(state.ballSpeedY)
        };
        state.ballSpeedX = 5 * direction.x * multiplier;
        state.ballSpeedY = 5 * direction.y * multiplier;
    };

    const handlePaddleSpeedChange = (multiplier: number) => {
        setPaddleSpeedMultiplier(multiplier);
    };

    const createParticles = useCallback((x: number, y: number, count: number, color: string) => {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            gameState.current.particles.push({
                x,
                y,
                speedX: Math.cos(angle) * 3,
                speedY: Math.sin(angle) * 3,
                life: 1,
                color
            });
        }
    }, []);

    const spawnPowerUp = useCallback(() => {
        const types: Array<PowerUp['type']> = ['wider', 'smaller', 'faster', 'slower'];
        const type = types[Math.floor(Math.random() * types.length)];

        gameState.current.powerUps.push({
            x: Math.random() * (canvasRef.current?.width || 500 - 20) + 10,
            y: 0,
            type,
            speed: 2,
            color: POWER_UP_COLORS[type]
        });
    }, []);

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

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            keysPressed.current.add(e.code);
            if (e.code === 'Space') {
                if (gameState.current.isGameOver) {
                    resetGame();
                } else {
                    gameState.current.isPaused = !gameState.current.isPaused;
                }
            }
        },
        [resetGame]
    );

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        keysPressed.current.delete(e.code);
    }, []);

    const updatePaddlePosition = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || gameState.current.isPaused) return;

        const currentSpeed = BASE_PADDLE_SPEED * paddleSpeedMultiplier;

        if (keysPressed.current.has('ArrowLeft')) {
            gameState.current.paddleX -= currentSpeed;
        }
        if (keysPressed.current.has('ArrowRight')) {
            gameState.current.paddleX += currentSpeed;
        }

        const isPaddleHittingLeftWall = gameState.current.paddleX < 0;
        const isPaddleHittingRightWall = gameState.current.paddleX > canvas.width - gameState.current.paddleWidth;

        if (isPaddleHittingLeftWall) gameState.current.paddleX = 0;
        if (isPaddleHittingRightWall) gameState.current.paddleX = canvas.width - gameState.current.paddleWidth;
    }, [paddleSpeedMultiplier]);

    const updateGame = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const state = gameState.current;

        if (state.isPaused) {
            ctx.font = '30px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
            requestRef.current = requestAnimationFrame(updateGame);
            return;
        }

        if (state.isGameOver) {
            ctx.font = '30px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 30);
            ctx.font = '20px Arial';
            ctx.fillText('Press Space to Try Again', canvas.width / 2, canvas.height / 2 + 10);
            requestRef.current = requestAnimationFrame(updateGame);
            return;
        }

        updatePaddlePosition();

        state.ballX += state.ballSpeedX;
        state.ballY += state.ballSpeedY;

        const isBallHittingWall = state.ballX > canvas.width - state.ballSize || state.ballX < state.ballSize;
        const isBallHittingCeiling = state.ballY < state.ballSize;
        const isBallInPaddleZone = state.ballY > canvas.height - 30 - state.ballSize;
        const isBallAlignedWithPaddle = state.ballX > state.paddleX && state.ballX < state.paddleX + state.paddleWidth;
        const isBallHittingPaddle = isBallInPaddleZone && isBallAlignedWithPaddle;
        const isBallBelowPaddle = state.ballY > canvas.height;

        if (isBallHittingWall) {
            state.ballSpeedX = -state.ballSpeedX;
            createParticles(state.ballX, state.ballY, 8, '#60a5fa');
        }

        if (isBallHittingCeiling) {
            state.ballSpeedY = -state.ballSpeedY;
            createParticles(state.ballX, state.ballY, 8, '#60a5fa');
        }

        if (isBallHittingPaddle) {
            state.ballSpeedY = -state.ballSpeedY;
            state.score += 10 * state.combo;
            state.combo += 1;
            createParticles(state.ballX, state.ballY, 12, '#22c55e');

            const shouldSpawnPowerUp = Math.random() < 0.2;
            if (shouldSpawnPowerUp) {
                spawnPowerUp();
            }
        }

        if (isBallBelowPaddle) {
            if (state.score > highScore) {
                setHighScore(state.score);
            }
            state.isGameOver = true;
            createParticles(state.ballX, state.ballY, 20, '#ef4444');
        }

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

        state.powerUps = state.powerUps.filter((powerUp) => {
            powerUp.y += powerUp.speed;

            const isPowerUpInPaddleZone = powerUp.y > canvas.height - 30;
            const isPowerUpAlignedWithPaddle = powerUp.x > state.paddleX && powerUp.x < state.paddleX + state.paddleWidth;
            const isPowerUpCollected = isPowerUpInPaddleZone && isPowerUpAlignedWithPaddle;

            if (isPowerUpCollected) {
                applyPowerUp(powerUp.type);
                createParticles(powerUp.x, powerUp.y, 15, powerUp.color);
                return false;
            }

            ctx.beginPath();
            ctx.arc(powerUp.x, powerUp.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = powerUp.color;
            ctx.fill();

            return powerUp.y < canvas.height;
        });

        ctx.beginPath();
        ctx.arc(state.ballX, state.ballY, state.ballSize, 0, Math.PI * 2);
        ctx.fillStyle = '#60a5fa';
        ctx.fill();

        ctx.fillStyle = '#4a5568';
        ctx.fillRect(state.paddleX, canvas.height - 20, state.paddleWidth, 10);

        ctx.font = '24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${state.score}`, 8, 26);
        ctx.fillText(`High Score: ${highScore}`, 8, 56);

        if (state.combo > 1) {
            ctx.textAlign = 'right';
            ctx.fillStyle = '#22c55e';
            ctx.fillText(`Combo x${state.combo}`, canvas.width - 8, 26);
        }

        requestRef.current = requestAnimationFrame(updateGame);
    }, [createParticles, spawnPowerUp, applyPowerUp, highScore, updatePaddlePosition]);

    useEffect(() => {
        if (!isMobile) {
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
            requestRef.current = requestAnimationFrame(updateGame);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [handleKeyDown, handleKeyUp, updateGame, isMobile]);

    if (isMobile) {
        return (
            <div className=" bg-main flex items-center justify-center p-4">
                <div className="bg-muted rounded-lg shadow-md p-6 text-center">
                    <h1 className="text-2xl font-bold text-main font-serif mb-4">Desktop Only Game</h1>
                    <p className="text-main">Please open this game on a desktop device for the best experience.</p>
                    <p className="text-main mt-2">The game requires keyboard controls to play.</p>
                </div>
            </div>
        );
    }
    return (
        <div className="bg-main flex flex-col items-center justify-center p-4">
            <div className="bg-muted rounded-lg shadow-md p-6 w-full max-w-3xl border border-main/10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-main font-serif">Paddle Game</h1>
                    <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                            <span className="text-main text-sm">Ball Speed:</span>
                            {[1, 1.5, 2, 2.5, 3].map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => handleSpeedChange(speed)}
                                    className={`px-3 py-1 rounded border ${
                                        speedMultiplier === speed
                                            ? 'bg-main text-zinc-100 border-main'
                                            : 'bg-muted text-main border-main/20 hover:border-main/40'
                                    }`}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="text-main text-sm">Paddle Speed:</span>
                            {[1, 1.5, 2, 2.5, 3].map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => handlePaddleSpeedChange(speed)}
                                    className={`px-3 py-1 rounded border ${
                                        paddleSpeedMultiplier === speed
                                            ? 'bg-main text-zinc-100 border-main'
                                            : 'bg-muted text-main border-main/20 hover:border-main/40'
                                    }`}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-main rounded-lg overflow-hidden border border-main/10">
                    <canvas ref={canvasRef} width={700} height={300} className="w-full" />
                </div>

                <div className="mt-4 space-y-2 text-center text-main prose prose-sijo">
                    <p>Use left and right arrow keys to move the paddle</p>
                    <p>Press Space to pause/resume or try again after game over</p>
                </div>
            </div>
        </div>
    );
};

export default CanvasGame;
