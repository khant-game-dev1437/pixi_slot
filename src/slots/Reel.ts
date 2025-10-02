import * as PIXI from 'pixi.js';
import { AssetLoader } from '../utils/AssetLoader';

const SYMBOL_TEXTURES = [
    'symbol1.png',
    'symbol2.png',
    'symbol3.png',
    'symbol4.png',
    'symbol5.png',
];

const SPIN_SPEED = 50; // Pixels per frame
const SLOWDOWN_RATE = 0.95; // Rate at which the reel slows down

export class Reel {
    public container: PIXI.Container;
    public symbols: any[];
    private symbolSize: number;
    private symbolCount: number;
    private speed: number = 0;
    private isSpinning: boolean = false;
    public position: number = 0;
    public previousPosition: number = 0;
    public reelResult: any;
    public resultCount: number = 0;

    constructor(symbolCount: number, symbolSize: number) {
        this.container = new PIXI.Container();
        this.symbols = [];
        this.symbolSize = symbolSize;
        this.symbolCount = symbolCount;

        this.createSymbols();
    }

    public resetCounter() {
        this.resultCount = 0;
    }
    
    private createSymbols(): void {
        // Create symbols for the reel, arranged horizontally
        for (let i = 0; i < this.symbolCount; i++) {
            const symbol = this.createRandomSymbol(true);
            symbol.x = i * this.symbolSize; // arrange horizontally
            symbol.y = 0;
            this.container.addChild(symbol);
            this.symbols.push(symbol);
        }
    }

    private createRandomSymbol(random: boolean, index: number = -1): any {
        // TODO:Get a random symbol texture
        let textureName;
        if(random) {
            textureName = SYMBOL_TEXTURES[Math.floor(Math.random() * SYMBOL_TEXTURES.length)];
        } else {
            textureName = SYMBOL_TEXTURES[index]; // Generate desired symbol
        }
        
        const texture = PIXI.Texture.from(`assets/images/${textureName}`);
        if(!random && index != -1) {
            return texture;
        }
        // TODO:Create a sprite with the texture
        const sprite = new PIXI.Sprite(texture);
        sprite.width = this.symbolSize;
        sprite.height = this.symbolSize;
        return sprite;
    }

    public update(delta: number): void {
        
    }

    private snapToGrid(): void {
        // TODO: Snap symbols to horizontal grid positions
        for (let i = 0; i < this.symbols.length; i++) {
            const targetX = i * this.symbolSize;
            this.symbols[i].x = targetX;
        }
    }

    public startSpin(): void {
        this.isSpinning = true;
        this.speed = SPIN_SPEED;
    }

    public stopSpin(): void {
        this.isSpinning = false;
        // The reel will gradually slow down in the update method
    }
}
