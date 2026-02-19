import * as PIXI from 'pixi.js';
import 'pixi-spine';
import { Reel } from './Reel';
import { sound } from '../utils/sound';
import { AssetLoader } from '../utils/AssetLoader';
import { Spine } from "pixi-spine";
import gsap from 'gsap';
import { IScreen } from '../screens/IScreen';
import { SoundScreen } from '../ui/Sound/SoundScreen';
import { ScreenManager } from '../screens/ScreenManager';


const REEL_COUNT = 5;
const SYMBOLS_PER_REEL = 5;

const SYMBOL_SIZE = 100;
const REEL_HEIGHT = SYMBOL_SIZE;
const REEL_SPACING = 10;
let remainingSymbols = [20, 20, 20, 40, 40];
let runnings = [false, false, false, false, false];
export enum Music {
    backgroundMucic,
    sfxMusic
}

const SYMBOL_TEXTURES = [
    'symbol1.png',
    'symbol2.png',
    'symbol3.png',
    'symbol4.png',
    'symbol5.png',
];

export class SlotMachine implements IScreen {
    public container: PIXI.Container;
    private reelsContainer: PIXI.Container;
    private reels: Reel[] = [];
    private app: PIXI.Application;
    private spinButton: PIXI.Sprite | null = null;
    private soundButton: PIXI.Sprite | null = null;
    private soundUI: SoundScreen;
    private frameSpine: Spine | null = null;
    private winAnimation: Spine | null = null;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.reelsContainer = new PIXI.Container();
        this.soundUI = new SoundScreen(app);

        // Center based on the background rect: origin (-20, -200), size (bgWidth, bgHeight)
        const bgWidth = REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1);
        const bgHeight = SYMBOL_SIZE * SYMBOLS_PER_REEL;
        this.container.x = this.app.screen.width / 2 - (bgWidth / 2 - 20);
        this.container.y = this.app.screen.height / 2 - 100;

        this.createBackground();

        // Apply mask to reelsContainer so symbols are clipped to the background area
        const mask = new PIXI.Graphics();
        mask.beginFill(0xffffff);
        mask.drawRect(
            -20,
            -200,
            REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1) + 40,
            SYMBOL_SIZE * SYMBOLS_PER_REEL
        );
        mask.endFill();
        this.reelsContainer.mask = mask;
        this.reelsContainer.addChild(mask);
        this.container.addChild(this.reelsContainer);

        this.createReels();
        this.createSpinButton();
        this.createSoundButton();

        sound.playBgm('bgm_slot');
    }

    private createBackground(): void {
        try {
            const reelFrame = new PIXI.Sprite(AssetLoader.getTexture('Neccessary/reelFrame.png'));
            reelFrame.anchor.set(0.5);
            reelFrame.x = (REEL_COUNT * SYMBOL_SIZE) / 2;
            reelFrame.y = -175 + (SYMBOLS_PER_REEL * SYMBOL_SIZE) / 2;
            reelFrame.width = (SYMBOL_SIZE) * REEL_COUNT + SYMBOL_SIZE * 2;
            reelFrame.height = SYMBOL_SIZE * SYMBOLS_PER_REEL + SYMBOL_SIZE * 4;
            this.container.addChild(reelFrame);
        } catch (error) {
            console.error('Error creating background:', error);
        }
    }

    private createSpinButton(): void {
        try {
            this.spinButton = new PIXI.Sprite(AssetLoader.getTexture('button_spin.png'));
            this.spinButton.anchor.set(0.5);
            this.spinButton.x = this.app.screen.width / 2 - this.container.x;
            this.spinButton.y = this.app.screen.height - 130 - this.container.y;
            this.spinButton.width = 150;
            this.spinButton.height = 80;
            this.spinButton.interactive = true;
            this.spinButton.cursor = 'pointer';

            this.spinButton.on('pointerdown', this.onSpinButtonClick.bind(this));
            this.spinButton.on('pointerover', this.onButtonOver.bind(this));
            this.spinButton.on('pointerout', this.onButtonOut.bind(this));

            this.container.addChild(this.spinButton);
        } catch (error) {
            console.error('Error creating spin button:', error);
        }
    }

    private createSoundButton(): void {
        try {
            this.soundButton = new PIXI.Sprite(AssetLoader.getTexture('yellow.png'));
            this.soundButton.anchor.set(0.5);
            this.soundButton.x = this.app.screen.width / 2 - 150 - this.container.x;
            this.soundButton.y = this.app.screen.height - 130 - this.container.y;
            this.soundButton.width = 150;
            this.soundButton.height = 80;
            this.soundButton.interactive = true;
            this.soundButton.cursor = 'pointer';

            const style = new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 22,
                fill: 0x000000,
                align: 'center',
            });

            const title = new PIXI.Text('Sound', style);
            title.anchor.set(0.5);
            title.x = this.soundButton.width / 2 - 75;
            title.y = this.soundButton.height / 2 - 50;
            this.soundButton.addChild(title);

            this.soundButton.on('pointerover', this.onButtonOver.bind(this));
            this.soundButton.on('pointerout', this.onButtonOut.bind(this));
            this.soundButton.on('pointerdown', () => this.showSoundUI());

            this.container.addChild(this.soundButton);
        } catch (error) {
            console.error('Error creating sound button:', error);
        }
    }

    private onSpinButtonClick(): void {
        sound.playSfx('Spin button');
        this.spin();
    }

    private onButtonOver(event: PIXI.FederatedPointerEvent): void {
        (event.currentTarget as PIXI.Sprite).scale.set(1.05);
    }

    private onButtonOut(event: PIXI.FederatedPointerEvent): void {
        (event.currentTarget as PIXI.Sprite).scale.set(1.0);
    }

    private showSoundUI(): void {
         ScreenManager.getInstance().show('SoundScreen')
    }

    private createReels(): void {
        for (let i = 0; i < REEL_COUNT; i++) {
            const reel = new Reel(SYMBOLS_PER_REEL, SYMBOL_SIZE);
            if (i % 2 == 0) {
                reel.reelResult = [0, 0, 0, 0, 0];
            } else {
                reel.reelResult = [0, 1, 2, 3, 4];
            }
            reel.container.y = -200;
            reel.container.x = i * SYMBOL_SIZE;
            this.reelsContainer.addChild(reel.container);
            this.reels.push(reel);
        }
    }

    public update(delta: number): void {
        for (let i = 0; i < this.reels.length; i++) {
            const r = this.reels[i];

            const totalHeight = r.symbols.length * SYMBOL_SIZE;

            for (let j = 0; j < r.symbols.length; j++) {
                const s = r.symbols[j];
                const prevY = s.y;

                s.y = ((r.position + j) * SYMBOL_SIZE) % totalHeight;
                if (s.y < 0) s.y += totalHeight;
                if (prevY > SYMBOL_SIZE && s.y < SYMBOL_SIZE) {

                    remainingSymbols[i]--;

                    if (remainingSymbols[i] > 5) {
                        const textureName = SYMBOL_TEXTURES[Math.floor(Math.random() * SYMBOL_TEXTURES.length)];
                        s.texture = PIXI.Texture.from(`assets/images/${textureName}`);
                    } else {
                        const result: number[] = r.reelResult;
                        let resultCount: number = r.resultCount;

                        if (resultCount < result.length) {
                            console.log('result j ', resultCount);
                            const textureName: string = SYMBOL_TEXTURES[result[result.length - 1 - resultCount]];
                            s.texture = PIXI.Texture.from(`assets/images/${textureName}`);
                            r.resultCount++;
                        }
                    }
                }
            }
        }
    }

    public spin(): void {
        if (runnings[this.reels.length - 1]) return;
        remainingSymbols = [13, 15, 22, 26, 30];

        sound.playSfx('Reel spin');

        if (this.spinButton) {
            this.spinButton.texture = AssetLoader.getTexture('button_spin_disabled.png');
            this.spinButton.interactive = false;
        }

        for (let i = 0; i < this.reels.length; i++) {
            const r = this.reels[i];
            r.resetCounter();
            r.reelResult = [1, 2, 1, 2, 1];

            runnings[i] = true;
            this.nextSymbol(r, i);
        }
    }

    nextSymbol(r: any, i: number) {
        gsap.to(r, {
            duration: 0.09,
            position: r.position + 1,
            ease: "none",
            onComplete: () => {
                if (remainingSymbols[i] > 1) {
                    this.nextSymbol(r, i);
                } else if (remainingSymbols[i] == 1) {
                    this.snapReel(r, i);
                }
            }
        });
    }

    snapReel(r: any, i: number) {
        gsap.to(r, {
            duration: 0.09,
            position: r.position - 1,
            ease: 'none',
            onComplete: () => {
                runnings[i] = false;
                if (i == REEL_COUNT - 1) {
                    sound.stopSfx('Reel spin', Music.sfxMusic);
                    this.stopSpin();
                }
            }
        });
    }

    private stopSpin(): void {
        if (this.spinButton) {
            this.spinButton.texture = AssetLoader.getTexture('button_spin.png');
            this.spinButton.interactive = true;
        }
    }

    public show(): void { this.container.visible = true; }
    public hide(): void { this.container.visible = false; }
    public isVisible(): boolean { return this.container.visible; }
}
