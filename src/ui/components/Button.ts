import * as PIXI from 'pixi.js';
import { AssetLoader } from '../../utils/AssetLoader';

interface ButtonOptions {
    texture: string;
    text?: string;
    width: number;
    height: number;
    fontSize?: number;
    fontColor?: number;
}

export class Button extends PIXI.Container {
    private bg: PIXI.Sprite;
    private label: PIXI.Text | null = null;

    constructor(options: ButtonOptions) {
        super();

        this.bg = new PIXI.Sprite(AssetLoader.getTexture(options.texture));
        this.bg.anchor.set(0.5);
        this.bg.width = options.width;
        this.bg.height = options.height;
        this.addChild(this.bg);

        if (options.text) {
            this.label = new PIXI.Text(options.text, new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: options.fontSize ?? 24,
                fill: options.fontColor ?? 0xffffff,
                fontWeight: 'bold',
            }));
            this.label.anchor.set(0.5);
            this.addChild(this.label);
        }

        this.interactive = true;
        this.cursor = 'pointer';
    }

    public onClick(fn: () => void): this {
        this.on('pointerdown', fn);
        return this;
    }

    public onHover(over: () => void, out: () => void): this {
        this.on('pointerover', over);
        this.on('pointerout', out);
        return this;
    }

    public setTexture(texture: string): void {
        this.bg.texture = AssetLoader.getTexture(texture);
    }

    public setText(text: string): void {
        if (this.label) this.label.text = text;
    }

    public disable(): void {
        this.interactive = false;
        this.alpha = 0.5;
    }

    public enable(): void {
        this.interactive = true;
        this.alpha = 1;
    }
}
