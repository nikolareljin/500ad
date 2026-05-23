/**
 * Audio Manager
 * Background music and sound effects system
 */

// Maps a music-context label to the track that represents it.
const MUSIC_CONTEXT_TRACKS = {
    combat: 'battle_theme',
    ambient: '500ad_ambient'
};
// Inverse lookup: derive the context a track belongs to (if any).
const MUSIC_TRACK_CONTEXTS = Object.entries(MUSIC_CONTEXT_TRACKS)
    .reduce((acc, [ctx, track]) => { acc[track] = ctx; return acc; }, {});

class AudioManager {
    constructor() {
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.currentMusic = null;
        this.currentContext = null;
        this.sounds = {};
        this.musicTracks = {};
        this.initialized = false;
        this.audioContext = null;
        this.assetAvailability = new Map();
        this.musicRequestToken = 0;
    }

    /**
     * Initialize audio system (requires user interaction)
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Load settings
            const settings = storageManager.loadSettings();
            this.musicVolume = settings.musicVolume || 0.5;
            this.sfxVolume = settings.sfxVolume || 0.7;

            this.initialized = true;
            console.log('Audio system initialized');
        } catch (error) {
            console.error('Failed to initialize audio:', error);
        }
    }

    /**
     * Play background music
     */
    async canLoadAsset(path) {
        if (!path) return false;
        if (this.assetAvailability.has(path)) {
            return this.assetAvailability.get(path);
        }
        try {
            const response = await fetch(path, { method: 'HEAD', cache: 'no-store' });
            const ok = response.ok;
            this.assetAvailability.set(path, ok);
            return ok;
        } catch (error) {
            console.log('Audio asset check failed:', path, error);
            this.assetAvailability.set(path, false);
            return false;
        }
    }

    async playMusic(trackName, loop = true) {
        if (!this.initialized) {
            this.initialize();
        }

        // Stop current music
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }

        // For now, we'll use a placeholder
        // In production, you would load actual audio files
        console.log(`Playing music: ${trackName}`);

        // Create audio element (placeholder)
        const audio = new Audio();
        audio.volume = this.musicVolume;
        audio.loop = loop;

        const src = `assets/audio/music/${trackName}.mp3`;
        const requestToken = ++this.musicRequestToken;
        const canLoad = await this.canLoadAsset(src);
        if (!canLoad) {
            console.log(`Music file not available: ${src}`);
            if (this.currentMusic === audio) this.currentMusic = null;
            return;
        }

        if (requestToken !== this.musicRequestToken) {
            return;
        }

        audio.src = src;

        this.currentMusic = audio;
        // Commit context only once the track is confirmed loadable and is
        // still the most recently requested one — setting it earlier would
        // leave a stale context if the asset check failed or a newer call
        // superseded this one, causing later setContext() calls to no-op.
        this.currentContext = MUSIC_TRACK_CONTEXTS[trackName] || null;

        // Play with promise handling for mobile
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Audio play prevented:', error);
            });
        }
    }

    /**
     * Play sound effect
     */
    playSound(soundName) {
        // SFX assets not yet available — intentional no-op.
        // Uncomment and wire src when assets/audio/sfx/${soundName}.mp3 files exist.
    }

    /**
     * Switch music context (ambient or combat).
     * Only triggers a track change when the context actually changes.
     */
    setContext(contextName) {
        const track = MUSIC_CONTEXT_TRACKS[contextName];
        if (!track) return;
        if (this.currentContext === contextName) return;
        // playMusic() updates this.currentContext via MUSIC_TRACK_CONTEXTS.
        this.playMusic(track);
    }

    /**
     * Stop music
     */
    stopMusic() {
        this.musicRequestToken++;
        // Clear context so the next setContext() call won't be incorrectly
        // suppressed by a stale value.
        this.currentContext = null;
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
    }

    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }

        // Save to settings
        storageManager.saveSettings({ musicVolume: this.musicVolume });
    }

    /**
     * Set SFX volume
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        storageManager.saveSettings({ sfxVolume: this.sfxVolume });
    }

    /**
     * Mute all audio
     */
    muteAll() {
        this.setMusicVolume(0);
        this.setSFXVolume(0);
    }

    /**
     * Unmute all audio
     */
    unmuteAll() {
        this.setMusicVolume(0.5);
        this.setSFXVolume(0.7);
    }

    /**
     * Play UI sound
     */
    playUISound(action) {
        const sounds = {
            click: 'ui_click',
            hover: 'ui_hover',
            select: 'ui_select',
            error: 'ui_error',
            success: 'ui_success'
        };

        if (sounds[action]) {
            this.playSound(sounds[action]);
        }
    }

    /**
     * Play combat sound
     */
    playCombatSound(type) {
        const sounds = {
            sword: 'combat_sword',
            arrow: 'combat_arrow',
            cavalry: 'combat_cavalry',
            victory: 'combat_victory',
            defeat: 'combat_defeat'
        };

        if (sounds[type]) {
            this.playSound(sounds[type]);
        }
    }
}

// Global audio manager instance
const audioManager = new AudioManager();

// Initialize audio on first user interaction
document.addEventListener('click', () => {
    audioManager.initialize();
}, { once: true });

document.addEventListener('touchstart', () => {
    audioManager.initialize();
}, { once: true });
