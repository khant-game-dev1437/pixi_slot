import * as PIXI from 'pixi.js';

const SYMBOL_TEXTURES = [
    'symbol1.png',
    'symbol2.png',
    'symbol3.png',
    'symbol4.png',
    'symbol5.png',
];

export class Reel {
    public container: PIXI.Container;
    public symbols: any[];
    private symbolSize: number;
    private symbolCount: number;
    public position: number = 0;
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
}
