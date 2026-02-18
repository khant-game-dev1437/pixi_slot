import * as PIXI from 'pixi.js';
import { SlotMachine } from '../slots/SlotMachine';
import { AssetLoader } from '../utils/AssetLoader';
import { sound } from '../utils/sound';
import { SoundScreen } from './Sound/SoundScreen';

export class UI {
    public container: PIXI.Container;
    private app: PIXI.Application;
    private slotMachine: SlotMachine;
    private spinButton!: PIXI.Sprite;
    public soundUI!: SoundScreen;
    private soundButton!: PIXI.Sprite;

    constructor(app: PIXI.Application, slotMachine: SlotMachine) {
        this.app = app;
        this.slotMachine = slotMachine;
        this.soundUI = new SoundScreen(app);
        this.container = new PIXI.Container();

        this.createSpinButton();
        this.createSoundButton();
        sound.playBgm('bgm_slot');
    }

    private createSpinButton(): void {
        try {
            this.spinButton = new PIXI.Sprite(AssetLoader.getTexture('button_spin.png'));

            this.spinButton.anchor.set(0.5);
            this.spinButton.x = this.app.screen.width / 2;
            this.spinButton.y = this.app.screen.height - 130;
            this.spinButton.width = 150;
            this.spinButton.height = 80;
            console.log('spinBut', this.spinButton.y)
            this.spinButton.interactive = true;
            this.spinButton.cursor = 'pointer';

            this.spinButton.on('pointerdown', this.onSpinButtonClick.bind(this));
            this.spinButton.on('pointerover', this.onButtonOver.bind(this));
            this.spinButton.on('pointerout', this.onButtonOut.bind(this));

            this.container.addChild(this.spinButton);

            this.slotMachine.setSpinButton(this.spinButton);
           
        } catch (error) {
            console.error('Error creating spin button:', error);
        }
    }

    private createSoundButton(): void {
        try {
            this.soundButton = new PIXI.Sprite(AssetLoader.getTexture('yellow.png')); 
            this.soundButton.anchor.set(0.5);
            this.soundButton.x = this.app.screen.width / 2 - 150; 
            this.soundButton.y = this.app.screen.height - 130;
            this.soundButton.width = 150;
            this.soundButton.height = 80;
            
            this.soundButton.interactive = true;
            this.soundButton.cursor = 'pointer';

            const style = new PIXI.TextStyle({
                fontFamily: "Arial",
                fontSize: 22,
                fill: 0x000000,
                
                align: "center",
            });

            const title = new PIXI.Text("Sound", style);
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
        this.slotMachine.spin();
    }

    private onButtonOver(event: PIXI.FederatedPointerEvent): void {
        (event.currentTarget as PIXI.Sprite).scale.set(1.05);
    }

    private onButtonOut(event: PIXI.FederatedPointerEvent): void {
        (event.currentTarget as PIXI.Sprite).scale.set(1.0);
    }

    public showSoundUI() {
        if (!this.container.children.includes(this.soundUI)) {
            this.container.addChild(this.soundUI);
        }
        this.soundUI.position.set(0, 0);
        this.soundUI.visible = !this.soundUI.visible;
        console.log('Sound UI toggle ', this.soundUI.visible);
    }
}
