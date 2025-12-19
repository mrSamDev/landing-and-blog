import Snowflake, { type SnowflakeConfig, defaultConfig } from './snow-flake';

const TARGET_FRAME_TIME = 1000 / 60; // 60fps

export interface SnowfallCanvasConfig extends SnowflakeConfig {
    /**
     * The number of snowflakes to be rendered.
     *
     * The default value is 150.
     */
    snowflakeCount: number;
}

export class SnowfallCanvas {
    private lastUpdate = Date.now();
    private snowflakes: Snowflake[] = [];
    private config: SnowfallCanvasConfig;
    private ctx: CanvasRenderingContext2D | null;
    private canvas: HTMLCanvasElement;
    private animationFrame: number | undefined;

    constructor(canvas: HTMLCanvasElement, config: Partial<SnowfallCanvasConfig> = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = {
            snowflakeCount: 150,
            ...defaultConfig,
            ...config
        };
        this.snowflakes = Snowflake.createSnowflakes(canvas, this.config.snowflakeCount, config);
        this.play();
    }

    /**
     * Updates the config used for the snowfall animation, if the number of snowflakes
     * has changed then this will create new or remove existing snowflakes gracefully
     * to retain the position of as many existing snowflakes as possible.
     */
    updateConfig(config: Partial<SnowfallCanvasConfig>): void {
        this.config = { ...this.config, ...config };
        const sizeDifference = this.config.snowflakeCount - this.snowflakes.length;

        if (sizeDifference > 0) {
            this.snowflakes = [...this.snowflakes, ...Snowflake.createSnowflakes(this.canvas, sizeDifference, config)];
        }

        if (sizeDifference < 0) {
            this.snowflakes = this.snowflakes.slice(0, this.config.snowflakeCount);
        }

        for (const snowflake of this.snowflakes) {
            snowflake.updateConfig(this.config);
        }
    }

    /**
     * Updates the location of each snowflake based on the number of frames passed then
     * clears the canvas and draws each snowflake.
     */
    private render(framesPassed = 1): void {
        const { ctx, canvas, snowflakes } = this;

        if (!ctx || !canvas) return;

        const { offsetWidth, offsetHeight } = canvas;

        // Update the position of each snowflake
        for (const snowflake of snowflakes) {
            snowflake.update(offsetWidth, offsetHeight, framesPassed);
        }

        // Render the snowflakes
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, offsetWidth, offsetHeight);

        // If using images, draw each image individually
        if (this.config.images && this.config.images.length > 0) {
            for (const snowflake of snowflakes) {
                snowflake.drawImage(ctx);
            }
            return;
        }

        // Not using images
        // If 3D rotation is enabled, draw each circle individually with transform
        if (this.config.enable3DRotation) {
            for (const snowflake of snowflakes) {
                snowflake.drawCircle3D(ctx, this.config.color!);
            }
        } else {
            // Draw circles in a single path for better performance
            ctx.beginPath();
            for (const snowflake of snowflakes) {
                snowflake.drawCircle(ctx);
            }
            ctx.fillStyle = this.config.color!;
            ctx.fill();
        }
    }

    /**
     * The animation loop, will calculate the time since the last render and update
     * the position of the snowflakes appropriately before queueing another frame.
     */
    private loop = (): void => {
        // Update based on time passed so that a slow frame rate won't slow down the snowflake
        const now = Date.now();
        const msPassed = now - this.lastUpdate;
        this.lastUpdate = now;

        // Frames that would have passed if running at 60 fps
        const framesPassed = msPassed / TARGET_FRAME_TIME;

        this.render(framesPassed);
        this.animationFrame = requestAnimationFrame(this.loop);
    };

    /** Start the animation playing. */
    play(): void {
        this.loop();
    }

    /** Pause the animation. */
    pause(): void {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = undefined;
        }
    }

    /** Destroy the animation and clean up resources. */
    destroy(): void {
        this.pause();
    }
}

export default SnowfallCanvas;
