import { Container, Graphics } from "pixi.js";
import * as PIXI from "pixi.js";
import { sound } from "../../utils/sound";

export class SoundScreen extends Container {
    private app: PIXI.Application;

    // BFX slider
    private bfxSlider!: Graphics;
    private bfxHandle!: Graphics;
    private bfxValue: number = 0;

    // SFX slider
    private sfxSlider!: Graphics;
    private sfxHandle!: Graphics;
    private sfxValue: number = 0;

    private min = 0;
    private max = 100;
    private sliderWidth: number = 320;
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

        // Overlay
        const overlay = new Graphics();
        overlay.beginFill(0x008000, 0.9);
        overlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height - 100);
        overlay.endFill();
        overlay.eventMode = "static";
        soundContainer.addChild(overlay);

        // Style
        const style = new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: 48,
            fill: 0xffffff,
            fontWeight: "bold",
            align: "center",
        });

        // Title
        const title = new PIXI.Text("Sound Setting", style);
        title.anchor.set(0.5);
        title.x = this.app.screen.width / 2;
        title.y = 100;
        soundContainer.addChild(title);

        // BFX Label
        const bfxTxt = new PIXI.Text("BFX", style);
        bfxTxt.anchor.set(0.5);
        bfxTxt.x = this.app.screen.width / 2 - 400;
        bfxTxt.y = this.app.screen.height / 2 - 200;
        soundContainer.addChild(bfxTxt);

        // SFX Label
        const sfxTxt = new PIXI.Text("SFX", style);
        sfxTxt.anchor.set(0.5);
        sfxTxt.x = this.app.screen.width / 2 - 400;
        sfxTxt.y = this.app.screen.height / 2 + 100;
        soundContainer.addChild(sfxTxt);

        // BFX Slider
        this.bfxSlider = this.createSlider(
            this.app.screen.width / 2 - 300,
            this.app.screen.height / 2 - 200
        );
        this.bfxHandle = this.createHandle(this.bfxSlider);
        soundContainer.addChild(this.bfxSlider);

        let bfxVol = parseFloat(localStorage.getItem('game_bgm_volume') || "1");
        this.bfxValue = Math.round(bfxVol * 100);
        this.bfxHandle.x = bfxVol * this.sliderWidth;

        // SFX Slider
        this.sfxSlider = this.createSlider(
            this.app.screen.width / 2 - 300,
            this.app.screen.height / 2 + 100
        );
        this.sfxHandle = this.createHandle(this.sfxSlider);
        soundContainer.addChild(this.sfxSlider);

        // First time set slider handle to let user see real val
         let sfxVol = parseFloat(localStorage.getItem('game_sfx_volume') || "1");
        this.sfxValue = Math.round(sfxVol * 100);
        this.sfxHandle.x = sfxVol * this.sliderWidth;

        // Make stage interactive
        this.app.stage.hitArea = this.app.screen;
    }

    // Create slider bar
    createSlider(x: number, y: number): Graphics {
        const slider = new Graphics();
        slider.beginFill(0x272d37);
        slider.drawRect(0, 0, this.sliderWidth, 4);
        slider.endFill();
        slider.position.set(x, y);
        return slider;
    }

    // Create handle
    createHandle(slider: Graphics): Graphics {
        const handle = new Graphics();
        handle.beginFill(0xffffff);
        handle.drawCircle(0, 0, 8);
        handle.endFill();
        handle.y = slider.height / 2;
        handle.x = 0;
        handle.eventMode = "static";
        handle.cursor = "pointer";

        handle.on("pointerdown", () => this.onDragStart(handle, slider))
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

        const slider = this.draggingHandle.parent as Graphics;
        const localX = slider.toLocal(e.global).x;

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
}
