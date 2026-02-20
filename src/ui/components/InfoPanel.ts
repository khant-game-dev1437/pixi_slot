import * as PIXI from 'pixi.js';
import { AssetLoader } from '../../utils/AssetLoader';

interface InfoPanelOptions {
    texture: string;
    label: string;
    value: string;
    width: number;
    height: number;
}

export class InfoPanel extends PIXI.Container {
    private valueTxt: PIXI.Text;
    private bgTexture: PIXI.Sprite;

    constructor(options: InfoPanelOptions) {
        super();
        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.bgTexture = new PIXI.Sprite(AssetLoader.getTexture(options.texture));
        this.bgTexture.anchor.set(0.5);
        this.bgTexture.width = options.width;
        this.bgTexture.height = options.height;
        this.addChild(this.bgTexture);

        const style = new PIXI.TextStyle({ fontFamily: 'Arial', fontSize: 15, fill: 0xffffff });

        const label = new PIXI.Text(options.label, style);
        label.anchor.set(0.5);
        label.y = -12;
        this.addChild(label);

        this.valueTxt = new PIXI.Text(options.value, style);
        this.valueTxt.anchor.set(0.5);
        this.valueTxt.y = 10;
        this.addChild(this.valueTxt);
    }

    // Call this to update the displayed value
    public setValue(value: string): void {
        this.valueTxt.text = value;
    }

    public setTexture(path: string): void {
        this.bgTexture.texture = AssetLoader.getTexture(path);
    }
}
