import * as PIXI from 'pixi.js';

export enum ScreenLayer {
    GAME  = 0,  // Always visible - slot machine, background
    UI    = 1,  // UI screens - registered, show/hide as needed
    POPUP = 2,  // Topmost - popups, modals, overlays
}

export interface IScreen {
    container: PIXI.Container;
    show(): void;
    hide(): void;
    isVisible(): boolean;
}
