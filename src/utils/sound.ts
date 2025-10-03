// TODO: Implement sound player using the "howler" package
import { Howl } from "howler";

type SoundMap = {
    [alias: string]: Howl;
};

const sounds: SoundMap = {}; // sfx
const bgm: SoundMap = {}; // bfx

// save in localStorage
const SFX_VOLUME_KEY: string = "game_sfx_volume";
const BGM_VOLUME_KEY: string = "game_bgm_volume";

const savedSfxVolume: number = parseFloat(localStorage.getItem(SFX_VOLUME_KEY) || "1");
const savedBgmVolume: number = parseFloat(localStorage.getItem(BGM_VOLUME_KEY) || "1");

export const sound = {

    // SFX part
    addSfx: (alias: string, url: string): void => {
        if (sounds[alias]) {
            console.warn(`SFX Sound "${alias}" already exists`);
            return;
        }

        sounds[alias] = new Howl({
            src: [url],
            preload: true,
            volume: savedSfxVolume,
        });

        console.log(`Sound added: ${alias} from ${url}`);
    },
    
    playSfx: (alias: string): void => {
        const sfx = sounds[alias];
        if (!sfx) {
            console.warn(`SFX alias "${alias}" not found.`);
            return;
        }
        sfx.play();
        console.log(`Playing sound: ${alias}`);
    },

    stopSfx: (alias: string): void => {
        const sfx = sounds[alias];
        if (!sfx) return;
        sfx.stop();
    },

    setVolumeSfx: (volume: number): void => {
        Object.values(sounds).forEach(sfx => {
            if (sfx) {
                sfx.volume(volume);
            }
        });
        localStorage.setItem(SFX_VOLUME_KEY, volume.toString());
    },

    getVolumeSfx: (): number => {
        const first = Object.values(sounds)[0];
        return first ? first.volume() : savedSfxVolume; 
    },

    // BFX part
    addBgm: (alias: string, url: string): void => {
        if (bgm[alias]) {
            console.warn(`BGM Sound "${alias}" already exists`);
            return;
        }

        bgm[alias] = new Howl({
            src: [url],
            loop: true,
            preload: true,
            volume: savedBgmVolume,
        });

        console.log(`BGM added: ${alias} from ${url}`);
    },

    playBgm: (alias: string): void => {
        const track = bgm[alias];
        track.loop
        if (!track) {
            console.warn(`BGM alias "${alias}" not found.`);
            return;
        }
        track.play();
    },

    stopBgm: (alias: string): void => {
        const track = bgm[alias];
        if (!track) return;
        track.stop();
    },

    setBgmVolume: (volume: number): void => {
        Object.values(bgm).forEach(bfx => {
            if (bfx) {
                bfx.volume(volume);
            }
        });
        localStorage.setItem(BGM_VOLUME_KEY, volume.toString());
    },

    getVolumeBfx: (): number => {
        const first = Object.values(bgm)[0];
        return first ? first.volume() : savedBgmVolume; 
    },

};
