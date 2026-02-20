import { Container } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { IScreen } from '../screens/IScreen';
import { AssetLoader } from '../utils/AssetLoader';
import { InfoPanel } from './components/InfoPanel';

const FRAME_TEXTURE = 'Neccessary/Game UI/desktop/Frame.png';

export class HUDScreen extends Container implements IScreen {
    public container: PIXI.Container = this;
    private app: PIXI.Application;
    public marqueeTxt!: PIXI.Text;

    private balancePanel!: InfoPanel;
    private winPanel!: InfoPanel;
    private betPanel!: InfoPanel;

    constructor(app: PIXI.Application) {
        super();
        this.app = app;
        this.eventMode = 'passive';       // pass all pointer events through
        
        this.createButtonsAndTexts();
    }

    createButtonsAndTexts() {
        // Marquee background + text
        const marquePH = new PIXI.Sprite(AssetLoader.getTexture(FRAME_TEXTURE));
        marquePH.anchor.set(0.5);
        marquePH.x = this.app.screen.width / 2;
        marquePH.y = 910;
        marquePH.width = 480;
        marquePH.height = 70;
        this.addChild(marquePH);

        this.marqueeTxt = new PIXI.Text('Hello', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
        }));
        this.marqueeTxt.anchor.set(0.5);
        this.marqueeTxt.x = marquePH.x;
        this.marqueeTxt.y = marquePH.y;
        this.addChild(this.marqueeTxt);

        // Info panels
        this.balancePanel = new InfoPanel({ texture: FRAME_TEXTURE, label: 'BALANCE', value: '10000.00', width: 250, height: 70 });
        this.balancePanel.x = 150;
        this.balancePanel.y = 990;
        this.addChild(this.balancePanel);

        this.winPanel = new InfoPanel({ texture: FRAME_TEXTURE, label: 'WIN', value: '0.00', width: 250, height: 70 });
        this.winPanel.x = this.app.screen.width / 2;
        this.winPanel.y = 990;
        this.addChild(this.winPanel);

        this.betPanel = new InfoPanel({ texture: FRAME_TEXTURE, label: 'BET', value: '1.00', width: 250, height: 70 });
        this.betPanel.x = this.app.screen.width - 150;
        this.betPanel.y = 990;
        this.addChild(this.betPanel);
        
        const Path = 'Neccessary/Game UI/desktop';
        const reduceBet = new InfoPanel({ texture: Path + '/Arrow_L_Idle.png', label: '', value: '', width: 80, height: 80 });
        reduceBet.x = this.app.screen.width - 240;
        reduceBet.y = 990;  
        reduceBet.interactive = true;
        this.addChild(reduceBet);
        reduceBet.on('pointerover', ()=> reduceBet.setTexture(Path+ '/Arrow_L_Hover.png'))
        reduceBet.on('pointerout', ()=> reduceBet.setTexture(Path+ '/Arrow_L_Idle.png'))
        reduceBet.on('pointerdown', ()=> reduceBet.setTexture(Path+ '/Arrow_L_Pressed.png'))
        reduceBet.on('pointerup', ()=> reduceBet.setTexture(Path+ '/Arrow_L_Idle.png'))

        const increaseBet = new InfoPanel({ texture: Path + '/Arrow_R_Idle.png', label: '', value: '', width: 80, height: 80 });
        increaseBet.x = this.app.screen.width - 50;
        increaseBet.y = 990;
        increaseBet.interactive = true;
        this.addChild(increaseBet);
        increaseBet.on('pointerover', ()=> increaseBet.setTexture(Path+ '/Arrow_R_Hover.png'))
        increaseBet.on('pointerout', ()=> increaseBet.setTexture(Path+ '/Arrow_R_Idle.png'))
        increaseBet.on('pointerdown', ()=> increaseBet.setTexture(Path+ '/Arrow_R_Pressed.png'))
        increaseBet.on('pointerup', ()=> increaseBet.setTexture(Path+ '/Arrow_R_Idle.png'))

     
    }

    public show(): void { this.visible = true; }
    public hide(): void { this.visible = false; }
    public isVisible(): boolean { return this.visible; }
}
