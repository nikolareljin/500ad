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
        // Context label of the most recent in-flight playMusic() call; used
        // by setContext() so an ambient restore can supersede a combat switch
        // that hasn't finished its async asset check yet (and vice versa).
        this.pendingContext = null;
        // Promise of an in-flight initialize() call so concurrent callers
        // (e.g. the global click handler + a playMusic() trigger on the same
        // gesture) share the same work instead of racing.
        this._initPromise = null;
    }

    /**
     * Initialize audio system (requires user interaction)
     */
    initialize() {
        if (this.initialized) return Promise.resolve();
        if (this._initPromise) return this._initPromise;
        this._initPromise = (async () => {
            try {
                // Create audio context
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

                // Load settings. Use ?? so a persisted 0 (user-muted) is honored
                // instead of being treated as missing by ||.
                const settings = storageManager.loadSettings();
                this.musicVolume = settings.musicVolume ?? 0.5;
                this.sfxVolume = settings.sfxVolume ?? 0.7;

                this.initialized = true;
                console.log('Audio system initialized');
            } catch (error) {
                console.error('Failed to initialize audio:', error);
            } finally {
                // Allow a retry on the next call if init failed midway.
                if (!this.initialized) this._initPromise = null;
            }
        })();
        return this._initPromise;
    }

    /**
     * Play background music
     */
    async canLoadAsset(path) {
        if (!path) return false;
        if (this.assetAvailability.has(path)) {
            return this.assetAvailability.get(path);
        }
        // file:// runs typically can't issue CORS-clean HEAD preflights, so
        // skip the check entirely and let the <audio> element try to load
        // the source directly.
        if (typeof location !== 'undefined' && location.protocol === 'file:') {
            return true;
        }
        try {
            const response = await fetch(path, { method: 'HEAD', cache: 'no-store' });
            // 405 Method Not Allowed means this host doesn't support HEAD;
            // fall through to <audio> loading rather than treating the asset
            // as missing.
            if (response.status === 405) {
                return true;
            }
            const ok = response.ok;
            // Cache only definitive outcomes (2xx ok or 404 missing). Other
            // status codes can be transient (5xx, 3xx redirects we didn't
            // follow), so don't poison the cache with a one-off failure.
            if (ok || response.status === 404) {
                this.assetAvailability.set(path, ok);
            }
            return ok;
        } catch (error) {
            // Transport-level error (network, CORS, etc.) — don't cache it as
            // "missing"; let <audio> try the load and surface its own error.
            console.log('Audio asset HEAD check failed (will retry on next call):', path, error);
            return true;
        }
    }

    async playMusic(trackName, loop = true) {
        if (!this.initialized) {
            // Await initialization so persisted volume settings are applied
            // before we create the <audio> element; a missing await would let
            // playback start with default volumes on the first call.
            await this.initialize();
            if (!this.initialized) return;
        }

        // Reserve a token for this call up front. Any concurrent playMusic()
        // or stopMusic() will bump the counter past this value and supersede
        // us; we must check the token before mutating any playback state so a
        // stale older request can't clobber state owned by a newer one.
        const requestToken = ++this.musicRequestToken;
        // Publish the in-flight context label so setContext() can supersede
        // this call if a different context is requested before it commits.
        this.pendingContext = MUSIC_TRACK_CONTEXTS[trackName] || null;

        const src = `assets/audio/music/${trackName}.mp3`;
        const canLoad = await this.canLoadAsset(src);

        // A newer request has won — bail without touching playback state.
        if (requestToken !== this.musicRequestToken) {
            return;
        }

        if (!canLoad) {
            console.log(`Music file not available: ${src}`);
            // Keep the previously-playing track running (we deliberately
            // delayed pausing it until canLoad succeeded). Only clear
            // currentContext so a subsequent setContext() call retries
            // instead of being suppressed by stale state.
            this.currentContext = null;
            this.pendingContext = null;
            return;
        }

        // Confirmed loadable: now stop the previous track and switch.
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }

        console.log(`Playing music: ${trackName}`);
        const audio = new Audio();
        audio.volume = this.musicVolume;
        audio.loop = loop;
        audio.src = src;

        this.currentMusic = audio;
        this.currentContext = MUSIC_TRACK_CONTEXTS[trackName] || null;
        this.pendingContext = null;

        // Play with promise handling for mobile
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Audio play prevented:', error);
                // Autoplay/permission rejection leaves the element paused.
                // Clear currentContext (only if we're still the active
                // request) so a subsequent setContext() can retry instead
                // of being suppressed by an apparently-active context.
                if (
                    requestToken === this.musicRequestToken &&
                    this.currentMusic === audio
                ) {
                    this.currentContext = null;
                }
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
        // If a different-context switch is mid-flight, never short-circuit:
        // playMusic() bumps musicRequestToken, which is what cancels the
        // stale in-flight request before it can commit late.
        const inflightDiffers = this.pendingContext !== null
            && this.pendingContext !== contextName;
        // Otherwise no-op when the requested context is already active AND
        // the track is actually playing. A paused element (autoplay-blocked,
        // pause from another flow, or interrupted load) must not suppress
        // the restart — otherwise the manager can get stuck thinking a
        // track is active while nothing is audible.
        if (
            !inflightDiffers &&
            this.currentContext === contextName &&
            this.currentMusic &&
            !this.currentMusic.paused
        ) {
            return;
        }
        // playMusic() updates this.currentContext via MUSIC_TRACK_CONTEXTS.
        this.playMusic(track);
    }

    /**
     * Stop music
     */
    stopMusic() {
        this.musicRequestToken++;
        // Clear context (and any in-flight switch) so the next setContext()
        // call won't be incorrectly suppressed by stale state.
        this.currentContext = null;
        this.pendingContext = null;
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
