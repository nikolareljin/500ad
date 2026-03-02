/**
 * Storage System
 * LocalStorage-based save/load functionality
 */

const STORAGE_KEYS = {
    SAVE_SLOT_1: 'byzantine_save_slot_1',
    SAVE_SLOT_2: 'byzantine_save_slot_2',
    SAVE_SLOT_3: 'byzantine_save_slot_3',
    AUTO_SAVE: 'byzantine_auto_save',
    SETTINGS: 'byzantine_settings'
};

const SAVE_SCHEMA_VERSION = 1;

class StorageManager {
    constructor() {
        this.settings = this.loadSettings();
    }

    normalizeSlotNumber(slotNumber) {
        const parsed = Number(slotNumber);
        if (!Number.isInteger(parsed) || parsed < 0 || parsed > 3) {
            return null;
        }
        return parsed;
    }

    getSlotKey(slotNumber) {
        return slotNumber === 0
            ? STORAGE_KEYS.AUTO_SAVE
            : STORAGE_KEYS[`SAVE_SLOT_${slotNumber}`];
    }

    buildSaveEnvelope(payload, slotNumber) {
        return {
            schemaVersion: SAVE_SCHEMA_VERSION,
            format: 'json',
            metadata: {
                slotNumber,
                savedAt: new Date().toISOString(),
                playerName: gameState.selectedLeader?.name || 'Unknown',
                turn: gameState.turn
            },
            data: payload
        };
    }

    normalizeSaveEnvelope(raw, slotNumber) {
        if (!raw || typeof raw !== 'object') {
            return null;
        }

        // Native schema v1 envelope.
        if (raw.schemaVersion === SAVE_SCHEMA_VERSION && raw.data && typeof raw.data === 'object') {
            const metadata = raw.metadata && typeof raw.metadata === 'object' ? raw.metadata : {};
            return {
                envelope: {
                    schemaVersion: SAVE_SCHEMA_VERSION,
                    format: 'json',
                    metadata: {
                        slotNumber,
                        savedAt: metadata.savedAt || new Date().toISOString(),
                        playerName: metadata.playerName || (raw.data.selectedLeader?.name || 'Unknown'),
                        turn: Number.isFinite(metadata.turn) ? metadata.turn : raw.data.turn
                    },
                    data: raw.data
                },
                payload: raw.data
            };
        }

        // Legacy flat save shape from previous versions.
        if (raw.version && raw.player && Array.isArray(raw.units)) {
            const payload = { ...raw };
            const envelope = {
                schemaVersion: SAVE_SCHEMA_VERSION,
                format: 'json',
                metadata: {
                    slotNumber,
                    savedAt: raw.savedAt || new Date().toISOString(),
                    playerName: raw.playerName || raw.selectedLeader?.name || 'Unknown',
                    turn: Number.isFinite(raw.turn) ? raw.turn : 1
                },
                data: payload
            };
            return { envelope, payload };
        }

        return null;
    }

    /**
     * Save game to a specific slot
     */
    saveGame(slotNumber = 0) {
        try {
            const normalizedSlot = this.normalizeSlotNumber(slotNumber);
            if (normalizedSlot === null) {
                return { success: false, message: 'Invalid save slot number' };
            }
            const payload = gameState.serialize();
            const saveData = this.buildSaveEnvelope(payload, normalizedSlot);
            const key = this.getSlotKey(normalizedSlot);
            localStorage.setItem(key, JSON.stringify(saveData));

            return { success: true, message: 'Game saved successfully' };
        } catch (error) {
            console.error('Save failed:', error);
            return { success: false, message: 'Failed to save game' };
        }
    }

    /**
     * Load game from a specific slot
     */
    loadGame(slotNumber = 0) {
        try {
            const normalizedSlot = this.normalizeSlotNumber(slotNumber);
            if (normalizedSlot === null) {
                return { success: false, message: 'Invalid save slot number' };
            }
            const key = this.getSlotKey(normalizedSlot);
            const saveDataStr = localStorage.getItem(key);

            if (!saveDataStr) {
                return { success: false, message: 'No save data found' };
            }

            const saveData = JSON.parse(saveDataStr);
            const normalized = this.normalizeSaveEnvelope(saveData, normalizedSlot);
            if (!normalized) {
                return { success: false, message: 'Invalid or unsupported save data format' };
            }
            const success = gameState.deserialize(normalized.payload);
            if (!success) {
                return { success: false, message: 'Failed to load save data' };
            }

            // Rewrite saves into current envelope format for forward compatibility.
            localStorage.setItem(key, JSON.stringify(normalized.envelope));
            return { success: true, message: 'Game loaded successfully', data: normalized.envelope };
        } catch (error) {
            console.error('Load failed:', error);
            return { success: false, message: 'Failed to load game' };
        }
    }

    /**
     * Get save slot metadata
     */
    getSaveSlotInfo(slotNumber) {
        try {
            const normalizedSlot = this.normalizeSlotNumber(slotNumber);
            if (normalizedSlot === null) return null;
            const key = this.getSlotKey(normalizedSlot);
            const saveDataStr = localStorage.getItem(key);

            if (!saveDataStr) return null;

            const saveData = JSON.parse(saveDataStr);
            const normalized = this.normalizeSaveEnvelope(saveData, normalizedSlot);
            if (!normalized) return null;
            const metadata = normalized.envelope.metadata || {};
            return {
                slotNumber: normalizedSlot,
                playerName: metadata.playerName,
                turn: metadata.turn,
                savedAt: metadata.savedAt,
                exists: true
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Get all save slots
     */
    getAllSaveSlots() {
        return [
            this.getSaveSlotInfo(1),
            this.getSaveSlotInfo(2),
            this.getSaveSlotInfo(3)
        ];
    }

    /**
     * Delete a save slot
     */
    deleteSave(slotNumber) {
        try {
            const key = STORAGE_KEYS[`SAVE_SLOT_${slotNumber}`];
            localStorage.removeItem(key);
            return { success: true, message: 'Save deleted' };
        } catch (error) {
            return { success: false, message: 'Failed to delete save' };
        }
    }

    /**
     * Auto-save game
     */
    autoSave() {
        return this.saveGame(0);
    }

    /**
     * Export save data as JSON
     */
    exportSave(slotNumber) {
        try {
            const normalizedSlot = this.normalizeSlotNumber(slotNumber);
            if (normalizedSlot === null || normalizedSlot === 0) return null;
            const key = this.getSlotKey(normalizedSlot);
            const saveDataStr = localStorage.getItem(key);
            if (!saveDataStr) return null;
            const saveData = JSON.parse(saveDataStr);
            const normalized = this.normalizeSaveEnvelope(saveData, normalizedSlot);
            if (!normalized) return null;
            return JSON.stringify(normalized.envelope);
        } catch (error) {
            return null;
        }
    }

    /**
     * Import save data from JSON
     */
    importSave(jsonData, slotNumber) {
        try {
            const normalizedSlot = this.normalizeSlotNumber(slotNumber);
            if (normalizedSlot === null || normalizedSlot === 0) {
                return { success: false, message: 'Invalid save slot number' };
            }
            const saveData = JSON.parse(jsonData);
            const normalized = this.normalizeSaveEnvelope(saveData, normalizedSlot);
            if (!normalized) {
                return { success: false, message: 'Invalid or unsupported save data' };
            }
            const key = this.getSlotKey(normalizedSlot);
            localStorage.setItem(key, JSON.stringify(normalized.envelope));
            return { success: true, message: 'Save imported successfully' };
        } catch (error) {
            return { success: false, message: 'Invalid save data' };
        }
    }

    /**
     * Save settings
     */
    saveSettings(settings) {
        try {
            this.settings = { ...this.settings, ...settings };
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    }

    /**
     * Load settings
     */
    loadSettings() {
        try {
            const settingsStr = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (settingsStr) {
                return JSON.parse(settingsStr);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }

        // Default settings
        return {
            musicVolume: 0.5,
            sfxVolume: 0.7,
            autoSave: true,
            difficulty: 'normal'
        };
    }

    /**
     * Clear all data
     */
    clearAllData() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return { success: true, message: 'All data cleared' };
        } catch (error) {
            return { success: false, message: 'Failed to clear data' };
        }
    }
}

// Global storage manager instance
const storageManager = new StorageManager();
