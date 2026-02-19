import { Container, Graphics } from "pixi.js";
import * as PIXI from "pixi.js";
import { sound } from "../../utils/sound";
import { IScreen } from "../../screens/IScreen";

export class SoundScreen extends Container implements IScreen {
    public container: PIXI.Container = this; // satisfies IScreen — this class IS the container
    private app: PIXI.Application;

    // BFX slider
    private bfxSlider!: Graphics;
    private bfxHandle!: Graphics;
    private bfxValue: number = 0;

    // SFX slider
    private sfxSlider!: Graphics;
    private sfxHandle!: Graphics;
    private sfxValue: number = 0;

    private min: number = 0;
    private max: number = 100;
    private sliderWidth: number = 350;
    private draggingHandle: Graphics | null = null;

    constructor(app: PIXI.Application) {
        super();
        this.app = app;

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onDrag = this.onDrag.bind(this);

        this.createSoundUI();
    }
    
    createSoundUI() {
        const soundContainer = new Container();
        this.addChild(soundContainer);

        const panelW = 480;
        const panelH = 280;
        const panelX = (this.app.screen.width - panelW) / 2;
        const panelY = (this.app.screen.height - panelH) / 2;

        // Dim background — tap outside panel to close
        const overlay = new Graphics();
        overlay.beginFill(0x000000, 0.5);
        overlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        overlay.endFill();
        overlay.eventMode = "static";
        overlay.on("pointerdown", () => { this.visible = false; });
        soundContainer.addChild(overlay);

        // Compact panel
        const panel = new Graphics();
        panel.beginFill(0x008000, 0.95);
        panel.drawRoundedRect(panelX, panelY, panelW, panelH, 12);
        panel.endFill();
        soundContainer.addChild(panel);

        // Style
        const style = new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: 28,
            fill: 0xffffff,
            fontWeight: "bold",
            align: "center",
        });

        // Title
        const title = new PIXI.Text("Sound Setting", style);
        title.anchor.set(0.5);
        title.x = this.app.screen.width / 2;
        title.y = panelY + 38;
        soundContainer.addChild(title);

        // BGM Label
        const bfxTxt = new PIXI.Text("BGM", style);
        bfxTxt.anchor.set(0, 0.5);
        bfxTxt.x = panelX + 20;
        bfxTxt.y = panelY + 110;
        soundContainer.addChild(bfxTxt);

        // SFX Label
        const sfxTxt = new PIXI.Text("SFX", style);
        sfxTxt.anchor.set(0, 0.5);
        sfxTxt.x = panelX + 20;
        sfxTxt.y = panelY + 190;
        soundContainer.addChild(sfxTxt);

        // BGM Slider
        this.bfxSlider = this.createSlider(panelX + 90, panelY + 110);
        soundContainer.addChild(this.bfxSlider);
        this.bfxHandle = this.createHandle(this.bfxSlider);

        let bfxVol: number = parseFloat(localStorage.getItem('game_bgm_volume') || "1");
        this.bfxValue = Math.round(bfxVol * 100);
        this.bfxHandle.x = bfxVol * this.sliderWidth;

        // SFX Slider
        this.sfxSlider = this.createSlider(panelX + 90, panelY + 190);
        soundContainer.addChild(this.sfxSlider);
        this.sfxHandle = this.createHandle(this.sfxSlider);

        // First time set slider handle to let user see real val
        let sfxVol: number = parseFloat(localStorage.getItem('game_sfx_volume') || "1");
        this.sfxValue = Math.round(sfxVol * 100);
        this.sfxHandle.x = sfxVol * this.sliderWidth;

        // Make stage interactive
        this.app.stage.hitArea = this.app.screen;
    }

    // Create slider bar
    createSlider(x: number, y: number): Graphics {
        const trackHeight = 10;

        const slider = new Graphics();

        // Invisible wider hit area for easier tapping
        slider.beginFill(0x000000, 0.001);
        slider.drawRect(-20, -25, this.sliderWidth + 40, 50);
        slider.endFill();

        // Visible track
        slider.beginFill(0x272d37);
        slider.drawRoundedRect(0, -trackHeight / 2, this.sliderWidth, trackHeight, trackHeight / 2);
        slider.endFill();

        slider.position.set(x, y);
        slider.eventMode = "static";
        slider.cursor = "pointer";

        // Tap on track to jump handle to that position
        slider.on("pointerdown", (e: any) => {
            const localX = slider.toLocal(e.global).x;
            const handle = slider === this.bfxSlider ? this.bfxHandle : this.sfxHandle;
            handle.x = Math.max(0, Math.min(localX, this.sliderWidth));
            this.onDragStart(handle, slider);
            this.onDrag(e);
        });

        return slider;
    }

    // Create handle
    createHandle(slider: Graphics): Graphics {
        const handle = new Graphics();

        // Invisible larger hit area for touch
        handle.beginFill(0x000000, 0.001);
        handle.drawCircle(0, 0, 30);
        handle.endFill();

        // Visible handle
        handle.beginFill(0xffffff);
        handle.drawCircle(0, 0, 14);
        handle.endFill();

        handle.y = 0;
        handle.x = 0;
        handle.eventMode = "static";
        handle.cursor = "pointer";

        handle.on("pointerdown", (e: any) => {
            e.stopPropagation();
            this.onDragStart(handle, slider);
        })
            .on("pointerup", this.onDragEnd)
            .on("pointerupoutside", this.onDragEnd);

        slider.addChild(handle);
        return handle;
    }

    // Start dragging
    onDragStart(handle: Graphics, slider: Graphics) {
        this.draggingHandle = handle;
        this.app.stage.eventMode = "static";
        this.app.stage.on("pointermove", this.onDrag);
    }

    // Stop dragging
    onDragEnd = () => {
        this.draggingHandle = null;
        this.app.stage.eventMode = "auto";
        this.app.stage.off("pointermove", this.onDrag);
    };

    // Drag logic
    onDrag = (e: any) => {
        if (!this.draggingHandle) return;

        const slider: Graphics = this.draggingHandle.parent as Graphics;
        const localX: number = slider.toLocal(e.global).x;

        // clamp handle not ot out of the slider
        this.draggingHandle.x = Math.max(0, Math.min(localX, this.sliderWidth));

        // normalized 0 - 100
        const t = this.draggingHandle.x / this.sliderWidth;
        const value = this.min + t * (this.max - this.min);

        if (this.draggingHandle === this.bfxHandle) {
            this.bfxValue = Math.round(value);

            sound.setBgmVolume(this.bfxValue / 100) // set bfx vol
            console.log("BFX Value:", this.bfxValue);
        } else if (this.draggingHandle === this.sfxHandle) {
            this.sfxValue = Math.round(value);

            sound.setVolumeSfx(this.sfxValue / 100) // set sfx vol.
            console.log("SFX Value:", this.sfxValue);
        }
    };


    public show(): void { this.visible = true; }
    public hide(): void { this.visible = false; }
    public isVisible(): boolean { return this.visible; }
}
