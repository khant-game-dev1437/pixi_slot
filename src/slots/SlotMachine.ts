import * as PIXI from 'pixi.js';
import 'pixi-spine';
import { Reel } from './Reel';
import { sound } from '../utils/sound';
import { AssetLoader } from '../utils/AssetLoader';
import { Spine } from "pixi-spine";
import gsap from 'gsap';


const REEL_COUNT = 4;
const SYMBOLS_PER_REEL = 6;

const SYMBOL_SIZE = 150;
const REEL_HEIGHT = SYMBOL_SIZE;
const REEL_SPACING = 10;
let remainingSymbols = [20, 20, 20, 20];
let runnings = [false, false, false, false];

const SYMBOL_TEXTURES = [
    'symbol1.png',
    'symbol2.png',
    'symbol3.png',
    'symbol4.png',
    'symbol5.png',
    'symbol5.png',
];

export class SlotMachine {
    public container: PIXI.Container;
    private reels: Reel[] = [];
    private app: PIXI.Application;
    private spinButton: PIXI.Sprite | null = null;
    private frameSpine: Spine | null = null;
    private winAnimation: Spine | null = null;
    

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        
        // Center the slot machine
        this.container.x = this.app.screen.width / 2 - ((SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2);
        this.container.y = this.app.screen.height / 2 - ((REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)) / 2);

        this.createBackground();

        this.createReels();

        this.initSpineAnimations();
        
    }

    private createBackground(): void {
        try {
            const background = new PIXI.Graphics();
            background.beginFill(0x000000, 0.5);
            background.drawRect(
                -20,
                -20,
                SYMBOL_SIZE * SYMBOLS_PER_REEL + 40, // Width now based on symbols per reel
                REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1) + 40 // Height based on reel count
            );
            background.endFill();
            this.container.addChild(background);
        } catch (error) {
            console.error('Error creating background:', error);
        }
    }

    private createReels(): void {
        // Create each reel
        for (let i = 0; i < REEL_COUNT; i++) {
            const reel = new Reel(SYMBOLS_PER_REEL, SYMBOL_SIZE);
            if (i % 2 == 0) { // bind server result in here.
                reel.reelResult = [0, 1, 2, 3, 4, 5]
            } else {
                reel.reelResult = [5, 4, 3, 2, 1, 0]
            }
            reel.container.y = i * (REEL_HEIGHT + REEL_SPACING);
            this.container.addChild(reel.container);
            this.reels.push(reel);
        }
    }

    public update(delta: number): void {
        for (let i = 0; i < this.reels.length; i++) {
            const r = this.reels[i];
          
            const totalWidth = r.symbols.length * SYMBOL_SIZE;

            for (let j = 0; j < r.symbols.length; j++) {
                const s = r.symbols[j];
                const prevX = s.x;

                s.x = ((r.position + j) * SYMBOL_SIZE) % totalWidth;
                if (s.x < 0) s.x += totalWidth;
                if (s.x > SYMBOL_SIZE && prevX < SYMBOL_SIZE) {
                    
                    remainingSymbols[i]--; 
                    
                    if (remainingSymbols[i] > 5) {
                        const textureName = SYMBOL_TEXTURES[Math.floor(Math.random() * SYMBOL_TEXTURES.length)];
                        s.texture = PIXI.Texture.from(`assets/images/${textureName}`);
                    } else {
                        
                        const result: number[] = r.reelResult;
                        let resultCount: number = r.resultCount;

                        console.log('result j ', resultCount)
                        const textureName : string = SYMBOL_TEXTURES[result[resultCount]]
                        s.texture = PIXI.Texture.from(`assets/images/${textureName}`);
                        r.resultCount++;
                    }
                }

            }
        }
    }

    public spin(): void {
        if (runnings[this.reels.length - 1]) return;
        remainingSymbols = [13, 15, 22, 25];

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
            runnings[i] = true;
            this.nextSymbol(r, i);
        }
    }

    nextSymbol(r: any, i: number) {
        gsap.to(r, {
            duration: 0.09, // 90ms
            position: r.position - 1,
            ease: "none",
            onComplete: () => {
                
                if (remainingSymbols[i] >  1) {
                    this.nextSymbol(r, i);
                } else if (remainingSymbols[i] == 1) {
                    this.snapReel(r, i);
                }
            }
        });
    }

    snapReel(r: any, i: number) {
        gsap.to(r, {
            duration: 0.09, // 400ms
            position: r.position - 1,
            ease: 'none',
            onComplete: () => {
                runnings[i] = false;
                if(i == REEL_COUNT - 1) { // means finished spinning for all reels
                    sound.stopSfx('Reel spin')
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
                // TODO: Play the win animation found in "big-boom-h" spine
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
            const frameSpineData = AssetLoader.getSpine('base-feature-frame.json');
            if (frameSpineData) {
                this.frameSpine = new Spine(frameSpineData.spineData);

                this.frameSpine.y = (REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)) / 2;
                this.frameSpine.x = (SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2;

                if (this.frameSpine.state.hasAnimation('idle')) {
                    this.frameSpine.state.setAnimation(0, 'idle', true);
                }

                this.container.addChild(this.frameSpine);
            }

            const winSpineData = AssetLoader.getSpine('big-boom-h.json');
            if (winSpineData) {
                this.winAnimation = new Spine(winSpineData.spineData);

                this.winAnimation.x = (REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)) / 2;
                this.winAnimation.y = (SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2;

                this.winAnimation.visible = false;

                this.container.addChild(this.winAnimation);
            }
        } catch (error) {
            console.error('Error initializing spine animations:', error);
        }
    }

    
}
