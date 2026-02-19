import * as PIXI from 'pixi.js';
import 'pixi-spine';
import { Reel } from './Reel';
import { sound } from '../utils/sound';
import { AssetLoader } from '../utils/AssetLoader';
import { Spine } from "pixi-spine";
import gsap from 'gsap';


const REEL_COUNT = 6;
const SYMBOLS_PER_REEL = 5;

const SYMBOL_SIZE = 100;
const REEL_HEIGHT = SYMBOL_SIZE;
const REEL_SPACING = 10;
let remainingSymbols = [20, 20, 20, 40];
let runnings = [false, false, false, false, false, false];
export enum Music{
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

export class SlotMachine {
    public container: PIXI.Container;
    private reelsContainer: PIXI.Container;
    private reels: Reel[] = [];
    private app: PIXI.Application;
    private spinButton: PIXI.Sprite | null = null;
    private frameSpine: Spine | null = null;
    private winAnimation: Spine | null = null;
    

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.reelsContainer = new PIXI.Container();

        // Center based on the background rect: origin (-20, -200), size (bgWidth, bgHeight)
        const bgWidth = REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1);
        const bgHeight = SYMBOL_SIZE * SYMBOLS_PER_REEL;
        this.container.x = this.app.screen.width / 2 - (bgWidth / 2 - 20);
        this.container.y = this.app.screen.height / 2 - (bgHeight / 2 - 200);

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

        //this.initSpineAnimations();
        
    }

    private createBackground(): void {
        try {
            const background = new PIXI.Graphics();
            background.beginFill(0x000000, 0.5);
            background.drawRect(
                -20,
                -200,
                REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1),
                SYMBOL_SIZE * SYMBOLS_PER_REEL
                
            );
            background.endFill();
            this.container.addChild(background);
        } catch (error) {
            console.error('Error creating background:', error);
        }
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
        remainingSymbols = [13, 15, 22, 26, 30, 35];
        
        // Play spin sound
        sound.playSfx('Reel spin');

        // Disable spin button
        if (this.spinButton) {
            this.spinButton.texture = AssetLoader.getTexture('button_spin_disabled.png');
            this.spinButton.interactive = false;
        }

        for (let i = 0; i < this.reels.length; i++) {
            const r = this.reels[i];
            r.resetCounter();
            r.reelResult = [1,2,1,2,1];
            
            runnings[i] = true;
            this.nextSymbol(r, i);
        }
    }

    nextSymbol(r: any, i: number) {
        gsap.to(r, {
            duration: 0.09, // 90ms
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
        this.checkWin();
    }

    private checkWin(): void {
        // Simple win check - just for demonstration
        const randomWin = Math.random() < 0.5; // 50% chance of winning

        if (randomWin) {
            sound.playSfx('win');
            console.log('Winner!');

            if (this.winAnimation) {
                
                 this.winAnimation.visible = true;
                if (this.winAnimation.state.hasAnimation('start')) {
                    const anim = this.winAnimation.state.setAnimation(0, 'start', false);

                    anim.listener = {
                        complete: (trackEntry) => {
                            if(trackEntry.animationEnd) { // if anim is ended.
                                console.log('Animtion is done.');
                                if (this.spinButton) {
                                    this.spinButton.texture = AssetLoader.getTexture('button_spin.png');
                                    this.spinButton.interactive = true;
                                }
                            }
                        }
                    };
                }
            }
        } else {
            if (this.spinButton) {
                this.spinButton.texture = AssetLoader.getTexture('button_spin.png');
                this.spinButton.interactive = true;
            }
        }
    }

    public setSpinButton(button: PIXI.Sprite): void {
        this.spinButton = button;
    }

    private initSpineAnimations(): void {
        try {
            // Background rect: origin (-20, -200), matches createBackground()
            const bgWidth = REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1) + 40;
            const bgHeight = SYMBOL_SIZE * SYMBOLS_PER_REEL;
            const bgCenterX = bgWidth / 2 - 20;
            const bgCenterY = bgHeight / 2 - 200;

            const frameSpineData = AssetLoader.getSpine('base-feature-frame.json');
            if (frameSpineData) {
                this.frameSpine = new Spine(frameSpineData.spineData);

                // Pivot to center so width/height stretch equally from the middle
                const bounds = this.frameSpine.getLocalBounds();
                this.frameSpine.pivot.set(
                    bounds.x + bounds.width / 2,
                    bounds.y + bounds.height / 2
                );

                this.frameSpine.x = bgCenterX;
                this.frameSpine.y = bgCenterY;
                this.frameSpine.width = bgWidth;
                this.frameSpine.height = bgHeight + 20;

                if (this.frameSpine.state.hasAnimation('idle')) {
                    this.frameSpine.state.setAnimation(0, 'idle', true);
                }

                this.container.addChild(this.frameSpine);
            }

            const winSpineData = AssetLoader.getSpine('big-boom-h.json');
            if (winSpineData) {
                this.winAnimation = new Spine(winSpineData.spineData);

                this.winAnimation.x = bgCenterX;
                this.winAnimation.y = bgCenterY;
                this.winAnimation.visible = false;

                this.container.addChild(this.winAnimation);
            }
        } catch (error) {
            console.error('Error initializing spine animations:', error);
        }
    }

    
}
