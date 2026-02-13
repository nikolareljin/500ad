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

class StorageManager {
    constructor() {
        this.settings = this.loadSettings();
    }

    /**
     * Save game to a specific slot
     */
    saveGame(slotNumber = 0) {
        try {
            const saveData = {
                ...gameState.serialize(),
                slotNumber,
                savedAt: new Date().toISOString(),
                playerName: gameState.selectedLeader?.name || 'Unknown',
                turn: gameState.turn
            };

            const key = slotNumber === 0 ? STORAGE_KEYS.AUTO_SAVE : STORAGE_KEYS[`SAVE_SLOT_${slotNumber}`];
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
            const key = slotNumber === 0 ? STORAGE_KEYS.AUTO_SAVE : STORAGE_KEYS[`SAVE_SLOT_${slotNumber}`];
            const saveDataStr = localStorage.getItem(key);

            if (!saveDataStr) {
                return { success: false, message: 'No save data found' };
            }

            const saveData = JSON.parse(saveDataStr);
            const success = gameState.deserialize(saveData);

            if (success) {
                return { success: true, message: 'Game loaded successfully', data: saveData };
            } else {
                return { success: false, message: 'Failed to load save data' };
            }
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
            const key = slotNumber === 0 ? STORAGE_KEYS.AUTO_SAVE : STORAGE_KEYS[`SAVE_SLOT_${slotNumber}`];
            const saveDataStr = localStorage.getItem(key);

            if (!saveDataStr) return null;

            const saveData = JSON.parse(saveDataStr);
            return {
                slotNumber,
                playerName: saveData.playerName,
                turn: saveData.turn,
                savedAt: saveData.savedAt,
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
        const key = STORAGE_KEYS[`SAVE_SLOT_${slotNumber}`];
        const saveDataStr = localStorage.getItem(key);

        if (!saveDataStr) return null;

        return saveDataStr;
    }

    /**
     * Import save data from JSON
     */
    importSave(jsonData, slotNumber) {
        try {
            const saveData = JSON.parse(jsonData);
            const key = STORAGE_KEYS[`SAVE_SLOT_${slotNumber}`];
            localStorage.setItem(key, jsonData);
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
