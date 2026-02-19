import * as PIXI from 'pixi.js';
import { IScreen, ScreenLayer } from './IScreen';

export class ScreenManager {
    private static instance: ScreenManager;

    public static getInstance(): ScreenManager {
        return ScreenManager.instance;
    }

    private gameLayer:  PIXI.Container = new PIXI.Container();
    private uiLayer:    PIXI.Container = new PIXI.Container();
    private popupLayer: PIXI.Container = new PIXI.Container();

    private registry: Map<string, IScreen> = new Map();

    constructor(stage: PIXI.Container) {
        ScreenManager.instance = this;
        // Order matters: game → ui → popup (lowest to highest)
        stage.addChild(this.gameLayer);
        stage.addChild(this.uiLayer);
        stage.addChild(this.popupLayer);
    }

    // Add the game — always visible, never hidden
    public addGame(screen: IScreen): void {
        this.gameLayer.addChild(screen.container);
        screen.show();
    }

    // Register a UI screen — added to UI container, hidden by default
    public registerScreen(name: string, screen: IScreen): void {
        this.registry.set(name, screen);
        this.uiLayer.addChild(screen.container);
        screen.hide();
    }

    // Register a popup — added to Popup container, hidden by default
    public registerPopup(name: string, screen: IScreen): void {
        this.registry.set(name, screen);
        this.popupLayer.addChild(screen.container);
        screen.hide();
    }

    public show(name: string): void {
        this.registry.get(name)?.show();
    }

    public hide(name: string): void {
        this.registry.get(name)?.hide();
    }

    public toggle(name: string): void {
        const screen = this.registry.get(name);
        if (!screen) return;
        screen.isVisible() ? screen.hide() : screen.show();
    }

    public hideAllScreens(): void {
        this.uiLayer.children.forEach(c => c.visible = false);
    }

    public hideAllPopups(): void {
        this.popupLayer.children.forEach(c => c.visible = false);
    }

    public getLayer(layer: ScreenLayer): PIXI.Container {
        if (layer === ScreenLayer.GAME)  return this.gameLayer;
        if (layer === ScreenLayer.UI)    return this.uiLayer;
        return this.popupLayer;
    }
}
