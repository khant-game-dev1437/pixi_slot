import * as PIXI from 'pixi.js';
import { SlotMachine } from './slots/SlotMachine';
import { AssetLoader } from './utils/AssetLoader';
import { ScreenManager } from './screens/ScreenManager';
import { ScreenLayer } from './screens/IScreen';
import { SoundScreen } from './ui/Sound/SoundScreen';
import { HUDScreen } from './ui/HUDScreen';
import { ScreenNames } from './constants/ScreenNames';

export class Game {
    private app: PIXI.Application;
    private screenManager!: ScreenManager;
    private slotMachine!: SlotMachine;
    private assetLoader: AssetLoader;
    private soundScreen!: SoundScreen;
    private hudScreen!: HUDScreen;

    private static readonly DESIGN_WIDTH = 800;
    private static readonly DESIGN_HEIGHT = 1280;

    constructor() {
        this.app = new PIXI.Application({
            width: Game.DESIGN_WIDTH,
            height: Game.DESIGN_HEIGHT,
            backgroundColor: 0x1099bb,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(this.app.view as HTMLCanvasElement);

            gameContainer.addEventListener('click', () => {
                this.toggleFullscreen(gameContainer);
            });
        }

        this.assetLoader = new AssetLoader();

        this.init = this.init.bind(this);
        this.resize = this.resize.bind(this);

        window.addEventListener('resize', () => {
            this.resize();
        });

        window.addEventListener('orientationchange', () => {
            setTimeout(this.resize, 200);
        });

        this.resize();
    }

    private toggleFullscreen(element: HTMLElement): void {
        // if (!document.fullscreenElement) {
        //     element.requestFullscreen().catch((err) => {
        //         console.error(`Error attempting to enable fullscreen: ${err.message}`);
        //     });
        // }
    }

    public async init(): Promise<void> {
        try {
            await this.assetLoader.loadAssets();

            this.screenManager = new ScreenManager(this.app.stage);

            this.slotMachine = new SlotMachine(this.app);
            this.screenManager.addGame(this.slotMachine);

            this.hudScreen = new HUDScreen(this.app);
            this.screenManager.addGame(this.hudScreen);

            this.soundScreen = new SoundScreen(this.app);
            this.screenManager.registerScreen(ScreenNames.SOUND_SCREEN, this.soundScreen);

            this.resize(); // Call this after all UI creation finished. If not, it wont be responsive

            this.app.ticker.add(this.update.bind(this));

            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Error initializing game:', error);
        }
    }

    private update(delta: number): void {
        if (this.slotMachine) {
            this.slotMachine.update(delta);
        }
    }

    private resize(): void {
        if (!this.app) return;

        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) return;

        const w = gameContainer.clientWidth || window.innerWidth;
        const h = gameContainer.clientHeight || window.innerHeight;

        // Scale the canvas via CSS to fit viewport while maintaining aspect ratio
        const scale = Math.min(w / Game.DESIGN_WIDTH, h / Game.DESIGN_HEIGHT);
        const scaledW = Math.floor(Game.DESIGN_WIDTH * scale);
        const scaledH = Math.floor(Game.DESIGN_HEIGHT * scale);

        const canvas = this.app.view as HTMLCanvasElement;
        canvas.style.width = `${scaledW}px`;
        canvas.style.height = `${scaledH}px`;
        canvas.style.position = 'absolute';
        canvas.style.left = `${Math.floor((w - scaledW) / 2)}px`;
        canvas.style.top = `${Math.floor((h - scaledH) / 2)}px`;
    }
}
