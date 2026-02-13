/**
 * UI Manager
 * Handles all UI interactions and screen transitions
 */

class UIManager {
    constructor() {
        this.currentScreen = 'loading';
        this.screens = {};
        this.modals = {};
        this.selectedCentury = '6';
        this.selectedFaction = 'byzantine';
        this.selectedScenario = SCENARIOS.building;
        this.selectedLeaderCard = null;
    }

    /**
     * Initialize UI
     */
    initialize() {
        // Cache screen elements
        this.screens = {
            loading: document.getElementById('loading-screen'),
            mainMenu: document.getElementById('main-menu'),
            leaderSelection: document.getElementById('leader-selection'),
            game: document.getElementById('game-screen')
        };

        this.modalOverlay = document.getElementById('modal-overlay');
        this.modalContent = document.getElementById('modal-content');
        this.notificationContainer = document.getElementById('notification-container');

        // Set up event listeners
        this.setupEventListeners();

        // Show main menu after loading
        setTimeout(() => {
            this.showScreen('mainMenu');
        }, 2000);
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Main menu buttons
        document.getElementById('btn-new-game')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.showLeaderSelection();
        });

        document.getElementById('btn-continue')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.continueGame();
        });

        document.getElementById('btn-load-game')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.showLoadGameModal();
        });

        document.getElementById('btn-settings')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.showSettingsModal();
        });

        document.getElementById('btn-about')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.showAboutModal();
        });

        // Leader selection
        document.getElementById('btn-back-from-leaders')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.showScreen('mainMenu');
        });

        // Century selection
        document.querySelectorAll('.century-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                audioManager.playUISound('click');
                this.switchCentury(e.target.dataset.century);
            });
        });

        // Faction selection
        document.querySelectorAll('.faction-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                audioManager.playUISound('click');
                this.switchFaction(e.target.dataset.faction);
            });
        });

        document.getElementById('btn-select-leader')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.startGame();
        });

        // Game screen buttons
        document.getElementById('btn-end-turn')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.endTurn();
        });

        document.getElementById('btn-save')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.showSaveGameModal();
        });

        document.getElementById('btn-menu')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.showGameMenu();
        });

        document.getElementById('btn-recruit')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.recruitAtSelectedCity();
        });

        document.getElementById('btn-build')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.buildInSelectedCity();
        });

        document.getElementById('btn-tech')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.researchTechnology();
        });

        // Close modal on overlay click
        this.modalOverlay?.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.closeModal();
            }
        });
    }

    /**
     * Show a specific screen
     */
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen?.classList.remove('active');
        });

        // Show requested screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }
    }

    /**
     * Show leader selection screen
     */
    showLeaderSelection() {
        this.showScreen('leaderSelection');
        this.populateCenturies();
        this.populateScenarios();
        this.switchCentury(this.selectedCentury);
    }

    populateScenarios() {
        const container = document.getElementById('scenario-tabs');
        if (!container) return;

        const scenarios = [
            {
                id: SCENARIOS.building,
                title: 'Building the Civilization',
                description: 'Start with one core town; local tribes around historic cities may join you or resist.'
            },
            {
                id: SCENARIOS.empire,
                title: 'Managing an Empire',
                description: 'Start with historically established towns, garrisons, and stronger economy.'
            }
        ];

        container.innerHTML = '';
        scenarios.forEach((scenario) => {
            const btn = document.createElement('button');
            btn.className = `scenario-tab ${this.selectedScenario === scenario.id ? 'active' : ''}`;
            btn.dataset.scenario = scenario.id;
            btn.title = scenario.description;
            btn.textContent = scenario.title;
            btn.addEventListener('click', () => this.switchScenario(scenario.id));
            container.appendChild(btn);
        });
    }

    switchScenario(scenarioId) {
        this.selectedScenario = scenarioId;
        document.querySelectorAll('.scenario-tab').forEach((tab) => {
            tab.classList.toggle('active', tab.dataset.scenario === scenarioId);
        });
    }

    /**
     * Populate century tabs
     */
    populateCenturies() {
        const container = document.querySelector('.century-tabs');
        if (!container) return;

        container.innerHTML = '';
        const centuries = getAvailableCenturies();

        centuries.forEach(c => {
            const btn = document.createElement('button');
            btn.className = `century-tab ${this.selectedCentury === c ? 'active' : ''}`;
            btn.dataset.century = c;

            // Add era symbol based on century
            const eraSymbol = c <= 7 ? '🏛' : (c <= 10 ? '⛪' : '🏰');
            btn.innerHTML = `${eraSymbol} ${c}th Century`;

            btn.addEventListener('click', (e) => this.switchCentury(c));
            container.appendChild(btn);
        });
    }

    /**
     * Switch century
     */
    switchCentury(century) {
        this.selectedCentury = century;

        // Update tabs
        document.querySelectorAll('.century-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.century === century);
        });

        this.populateFactions(century);
        const factions = getFactionsByCentury(century);
        if (factions.length > 0) {
            this.switchFaction(factions[0]);
        }
    }

    /**
     * Populate faction tabs
     */
    populateFactions(century) {
        const container = document.querySelector('.faction-tabs');
        if (!container) return;

        container.innerHTML = '';
        const factions = getFactionsByCentury(century);

        factions.forEach(f => {
            const btn = document.createElement('button');
            btn.className = `faction-tab ${this.selectedFaction === f ? 'active' : ''}`;
            btn.dataset.faction = f;

            const factionSymbol = getFactionSymbol(f);
            btn.innerHTML = `${factionSymbol} ${f.charAt(0).toUpperCase() + f.slice(1)}`;

            btn.addEventListener('click', (e) => this.switchFaction(f));
            container.appendChild(btn);
        });
    }

    /**
     * Switch faction
     */
    switchFaction(faction) {
        this.selectedFaction = faction;

        // Update tabs
        document.querySelectorAll('.faction-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.faction === faction);
        });

        this.populateLeaders(this.selectedCentury, faction);
    }

    /**
     * Populate leaders for selected century and faction
     */
    populateLeaders(century, faction) {
        const leadersGrid = document.getElementById('leaders-grid');
        if (!leadersGrid) return;

        leadersGrid.innerHTML = '';
        const leaders = getLeadersByCenturyAndFaction(century, faction);

        leaders.forEach(leader => {
            const card = this.createLeaderCard(leader);
            leadersGrid.appendChild(card);
        });
    }

    /**
     * Create leader card element
     */
    createLeaderCard(leader) {
        const card = document.createElement('div');
        card.className = 'leader-card';
        card.dataset.leaderId = leader.id;

        // Determine symbol based on faction
        const symbol = leader.faction ? getFactionSymbol(leader.faction) : (this.selectedFaction ? getFactionSymbol(this.selectedFaction) : BYZANTINE_SYMBOLS.crown);

        card.innerHTML = `
            <div class="leader-portrait">
                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;background:linear-gradient(135deg, var(--parchment-dark), var(--parchment));">
                    ${symbol}
                </div>
            </div>
            <h4>${leader.name}</h4>
            <p>${leader.title}</p>
            <small style="opacity:0.7;">${leader.years}</small>
        `;

        card.addEventListener('click', () => {
            audioManager.playUISound('select');
            this.selectLeader(leader);
        });

        return card;
    }

    /**
     * Select a leader
     */
    selectLeader(leader) {
        // Remove previous selection
        document.querySelectorAll('.leader-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Mark as selected
        const card = document.querySelector(`[data-leader-id="${leader.id}"]`);
        if (card) {
            card.classList.add('selected');
        }

        // Show leader details
        this.showLeaderDetails(leader);
    }

    /**
     * Show leader details panel
     */
    showLeaderDetails(leader) {
        const detailPanel = document.getElementById('leader-detail');
        if (!detailPanel) return;

        detailPanel.classList.add('active');

        // Update portrait
        const portrait = document.getElementById('leader-portrait-large');
        if (portrait) {
            portrait.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:6rem;">👑</div>';
        }

        // Update info
        document.getElementById('leader-name').textContent = leader.name;
        document.getElementById('leader-title').textContent = leader.title;
        document.getElementById('leader-years').textContent = leader.years;
        document.getElementById('leader-bio').textContent = leader.bio;

        // Update stats
        const statsDiv = document.getElementById('leader-stats');
        if (statsDiv) {
            statsDiv.innerHTML = `
                <div class="leader-stat">
                    <span class="leader-stat-label">Military</span>
                    <span class="leader-stat-value">${leader.stats.military}</span>
                </div>
                <div class="leader-stat">
                    <span class="leader-stat-label">Economy</span>
                    <span class="leader-stat-value">${leader.stats.economy}</span>
                </div>
                <div class="leader-stat">
                    <span class="leader-stat-label">Diplomacy</span>
                    <span class="leader-stat-value">${leader.stats.diplomacy}</span>
                </div>
            `;
        }

        // Update abilities
        const abilitiesDiv = document.getElementById('leader-abilities');
        if (abilitiesDiv) {
            abilitiesDiv.innerHTML = '<h4>Special Abilities</h4>';
            leader.abilities.forEach(ability => {
                const abilityEl = document.createElement('div');
                abilityEl.className = 'ability';
                abilityEl.innerHTML = `
                    <span class="ability-name">${ability.name}:</span>
                    <span>${ability.description}</span>
                `;
                abilitiesDiv.appendChild(abilityEl);
            });
        }

        this.selectedLeaderCard = leader;
    }

    /**
     * Switch era tab
     */
    switchEra(era) {
        this.currentEra = era;

        // Update tab styles
        document.querySelectorAll('.era-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.era === era) {
                tab.classList.add('active');
            }
        });

        // Populate leaders
        this.populateLeaders(era);

        // Hide detail panel
        document.getElementById('leader-detail')?.classList.remove('active');
    }

    /**
     * Start game with selected leader
     */
    startGame() {
        if (!this.selectedLeaderCard) {
            this.showNotification('Please select a leader', 'error');
            return;
        }

        this.showScreen('game');
        initializeGameMap();
        const success = gameState.initializeGame(
            this.selectedLeaderCard.id,
            this.selectedCentury,
            this.selectedFaction,
            this.selectedScenario
        );
        if (success) {
            this.initializeGameView();
            this.updateHUD();
            audioManager.playMusic('battle_theme');
            this.showNotification(
                `Scenario: ${this.selectedScenario === SCENARIOS.empire ? 'Managing an Empire' : 'Building the Civilization'}`,
                'info'
            );
        } else {
            this.showScreen('leaderSelection');
        }
    }

    /**
     * Continue last game
     */
    continueGame() {
        const result = storageManager.loadGame(0);
        if (result.success) {
            this.showScreen('game');
            initializeGameMap();
            gameMap?.markTerritoryDirty();
            this.initializeGameView();
            this.updateHUD();
            this.showNotification('Game loaded', 'success');
        } else {
            this.showNotification('No save game found', 'error');
        }
    }

    /**
     * End turn
     */
    async endTurn() {
        const result = await gameState.endTurn();
        this.updateHUD();
        gameMap?.render();

        // Auto-save
        if (storageManager.settings.autoSave) {
            storageManager.autoSave();
        }

        this.showNotification(
            `Turn ${result.turn} - Income: ${result.income.gold} gold, ${result.income.manpower} manpower (cities: ${result.cityProduction?.gold || 0}g/${result.cityProduction?.manpower || 0}m, upkeep ${result.upkeep || 0})`,
            'success'
        );
    }

    recruitAtSelectedCity() {
        if (!gameMap?.selectedTile) {
            this.showNotification('Select a city tile to recruit', 'error');
            return;
        }

        const tile = gameMap.getTile(gameMap.selectedTile.x, gameMap.selectedTile.y);
        if (!tile?.cityData || tile.owner !== 'player') {
            this.showNotification('Recruitment requires a player-owned city', 'error');
            return;
        }

        const recruitType = tile.cityData.infrastructure.industry >= 3 ? 'kavallarioi' : 'skutatoi';
        const spawnTile = this.findRecruitSpawnTile(tile);
        if (!spawnTile) {
            this.showNotification('No open adjacent tile for recruitment', 'error');
            return;
        }

        const unit = gameState.recruitUnit(recruitType, spawnTile);
        if (!unit) {
            this.showNotification(`Not enough resources to recruit ${recruitType}`, 'error');
            return;
        }

        this.updateHUD();
        gameMap.render();
        this.showNotification(`${unit.name} recruited at ${tile.cityData.name}`, 'success');
    }

    findRecruitSpawnTile(cityTile) {
        const offsets = [
            { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 },
            { x: 1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }
        ];

        for (const offset of offsets) {
            const x = cityTile.x + offset.x;
            const y = cityTile.y + offset.y;
            const mapTile = gameMap.getTile(x, y);
            if (!mapTile || mapTile.terrain === 'water') continue;

            const occupied = gameState.units.some(u => u.position.x === x && u.position.y === y);
            if (occupied) continue;
            return { x, y };
        }

        return null;
    }

    buildInSelectedCity() {
        if (!gameMap?.selectedTile) {
            this.showNotification('Select a city tile to build', 'error');
            return;
        }

        const tile = gameMap.getTile(gameMap.selectedTile.x, gameMap.selectedTile.y);
        if (!tile?.cityData || tile.owner !== 'player') {
            this.showNotification('Build actions require a player-owned city', 'error');
            return;
        }

        const infra = tile.cityData.infrastructure;
        const infraLevel = infra.roads + infra.agriculture + infra.industry;
        const buildCost = {
            gold: 80 + infraLevel * 25,
            manpower: 20 + infraLevel * 10
        };
        if (!gameState.spendResources(buildCost.gold, buildCost.manpower, 0)) {
            this.showNotification('Insufficient resources for city development', 'error');
            return;
        }

        const cycle = ['agriculture', 'industry', 'roads'];
        const target = cycle[(gameState.turn + tile.importance) % cycle.length];
        infra[target] = Math.min(infra[target] + 1, 5);
        tile.cityData.population = Math.min(tile.cityData.population + 1, 12);

        if (target === 'agriculture') tile.cityData.production.food += 1;
        if (target === 'industry') tile.cityData.production.industry += 1;
        if (target === 'roads') tile.cityData.production.gold += 1;

        if (!tile.cityData.wonder && tile.cityData.kind === 'capital' && infra.industry >= 4) {
            tile.cityData.wonder = 'Imperial Forum';
            tile.cityData.production.gold += 1;
        }

        this.updateHUD();
        gameMap.render();
        this.showNotification(
            `${tile.cityData.name}: improved ${target} (-${buildCost.gold}g/-${buildCost.manpower}m)`,
            'success'
        );
    }

    researchTechnology() {
        const cost = { gold: 220, prestige: 30 };
        if (!gameState.spendResources(cost.gold, 0, cost.prestige)) {
            this.showNotification('Not enough gold/prestige for research', 'error');
            return;
        }

        if (!gameState.player.techResearched.includes('logistics')) {
            gameState.player.techResearched.push('logistics');
            // Logistics boosts city output.
            gameMap?.getCityTiles('player').forEach(tile => {
                tile.cityData.production.food += 1;
                tile.cityData.production.industry += 1;
            });
        }

        this.updateHUD();
        gameMap?.render();
        this.showNotification('Technology researched: Imperial Logistics', 'success');
    }

    /**
     * Update HUD
     */
    updateHUD() {
        document.getElementById('resource-gold').textContent = gameState.player.resources.gold;
        document.getElementById('resource-manpower').textContent = gameState.player.resources.manpower;
        document.getElementById('resource-prestige').textContent = gameState.player.resources.prestige;
        document.getElementById('turn-number').textContent = gameState.turn;
    }

    /**
     * Show unit panel
     */
    showUnitPanel(unit) {
        const panel = document.getElementById('unit-panel');
        if (!panel) return;

        panel.classList.add('active');

        document.getElementById('selected-unit-name').textContent = unit.name;
        const portrait = document.getElementById('selected-unit-portrait');
        if (portrait) {
            const unitIcon = unit.type === 'cavalry' ? '🐎' : (unit.type === 'archer' ? '🏹' : '⚔️');
            portrait.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:2rem;color:#f4d03f;gap:0.6rem;">
                    <span>${unitIcon}</span>
                    <span style="font-size:1rem;opacity:0.9;">${unit.name}</span>
                </div>
            `;
        }
        document.getElementById('unit-health-value').textContent = `${unit.currentHealth}/${unit.stats.health}`;
        document.getElementById('unit-attack').textContent = unit.stats.attack;
        document.getElementById('unit-defense').textContent = unit.stats.defense;
        document.getElementById('unit-movement').textContent = `${unit.currentMovement}/${unit.stats.movement}`;

        const healthBar = document.getElementById('unit-health-bar');
        if (healthBar) {
            const healthPercent = (unit.currentHealth / unit.stats.health) * 100;
            healthBar.style.width = `${healthPercent}%`;
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        this.notificationContainer?.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Show game over screen
     */
    showGameOver(isVictory) {
        const title = isVictory ? 'Victory!' : 'Defeat!';
        const message = isVictory
            ? 'For the Glory of Constantinople! The Empire is secure.'
            : 'Constantinople has fallen. The legacy of Rome ends here.';
        const icon = isVictory ? '👑' : '🏚️';

        const content = `
            <div style="text-align:center;padding:2rem;">
                <div style="font-size:5rem;margin-bottom:1rem;">${icon}</div>
                <h2 style="font-size:3rem;margin-bottom:1rem;color:#D4AF37;">${title}</h2>
                <p style="font-size:1.2rem;margin-bottom:2rem;">${message}</p>
                <div style="display:flex;flex-direction:column;gap:1rem;">
                    <button class="menu-btn primary" onclick="location.reload()">New Campaign</button>
                    <button class="menu-btn" onclick="uiManager.returnToMainMenu()">Main Menu</button>
                </div>
            </div>
        `;

        this.showModal(content);
        audioManager.stopMusic();
        audioManager.playUISound(isVictory ? 'victory' : 'defeat');
    }

    /**
     * Show simplified combat result
     */
    showCombatResult(result) {
        const attacker = gameState.units.find(u => u.id === result.attacker.id);
        const defender = gameState.units.find(u => u.id === result.defender.id);

        const message = `${attacker?.name || 'Unit'} dealt ${result.attackerDamage} damage to ${defender?.name || 'Enemy'}. Target health: ${result.defender.health}`;
        this.showNotification(message, 'info');

        // Flash the screen if player was attacked
        if (defender?.owner === 'player') {
            document.body.classList.add('hit-shake');
            setTimeout(() => document.body.classList.remove('hit-shake'), 500);
        }
    }

    /**
     * Show modal
     */
    showModal(content) {
        if (this.modalContent) {
            this.modalContent.innerHTML = content;
        }
        this.modalOverlay?.classList.add('active');
    }

    /**
     * Close modal
     */
    closeModal() {
        this.modalOverlay?.classList.remove('active');
    }

    /**
     * Show save game modal
     */
    showSaveGameModal() {
        const slots = storageManager.getAllSaveSlots();
        let content = '<h2>Save Game</h2><div style="display:flex;flex-direction:column;gap:1rem;">';

        for (let i = 1; i <= 3; i++) {
            const slot = slots[i - 1];
            content += `
                <button class="menu-btn" onclick="uiManager.saveToSlot(${i})">
                    <span class="btn-text">Slot ${i}${slot ? ` - ${slot.playerName} (Turn ${slot.turn})` : ' - Empty'}</span>
                </button>
            `;
        }

        content += '</div>';
        this.showModal(content);
    }

    /**
     * Show load game modal
     */
    showLoadGameModal() {
        const slots = storageManager.getAllSaveSlots();
        let content = '<h2>Load Game</h2><div style="display:flex;flex-direction:column;gap:1rem;">';

        for (let i = 1; i <= 3; i++) {
            const slot = slots[i - 1];
            if (slot) {
                content += `
                    <button class="menu-btn" onclick="uiManager.loadFromSlot(${i})">
                        <span class="btn-text">Slot ${i} - ${slot.playerName} (Turn ${slot.turn})</span>
                    </button>
                `;
            }
        }

        content += '</div>';
        this.showModal(content);
    }

    /**
     * Show settings modal
     */
    showSettingsModal() {
        const settings = storageManager.loadSettings();
        const content = `
            <h2>Settings</h2>
            <div style="padding:2rem;">
                <div style="margin-bottom:1.5rem;">
                    <label style="display:block;margin-bottom:0.5rem;">Music Volume</label>
                    <input type="range" min="0" max="100" value="${settings.musicVolume * 100}" 
                           onchange="audioManager.setMusicVolume(this.value / 100)" style="width:100%;">
                </div>
                <div style="margin-bottom:1.5rem;">
                    <label style="display:block;margin-bottom:0.5rem;">SFX Volume</label>
                    <input type="range" min="0" max="100" value="${settings.sfxVolume * 100}" 
                           onchange="audioManager.setSFXVolume(this.value / 100)" style="width:100%;">
                </div>
                <button class="btn-primary" onclick="uiManager.closeModal()">Close</button>
            </div>
        `;
        this.showModal(content);
    }

    /**
     * Show about modal
     */
    showAboutModal() {
        const content = `
            <h2>About 500 A.D.</h2>
            <div style="padding:2rem;max-width:600px;">
                <p style="margin-bottom:1rem;">
                    A turn-based strategy game set in the Byzantine Empire (Eastern Roman Empire) 
                    from 500-1453 AD. Command legendary emperors and generals through pivotal moments 
                    in Byzantine history.
                </p>
                <p style="margin-bottom:1rem;">
                    <strong>Historical Accuracy:</strong> All leaders, units, and scenarios are based 
                    on actual Byzantine history.
                </p>
                <p style="margin-bottom:1.5rem;">
                    <strong>Version:</strong> ${window.APP_VERSION || '1.1.0'}
                </p>
                <button class="btn-primary" onclick="uiManager.closeModal()">Close</button>
            </div>
        `;
        this.showModal(content);
    }

    /**
     * Show game menu
     */
    showGameMenu() {
        const content = `
            <h2>Game Menu</h2>
            <div style="display:flex;flex-direction:column;gap:1rem;padding:1rem;">
                <button class="menu-btn" onclick="uiManager.closeModal()">Resume</button>
                <button class="menu-btn" onclick="uiManager.showSaveGameModal()">Save Game</button>
                <button class="menu-btn" onclick="uiManager.showSettingsModal()">Settings</button>
                <button class="menu-btn" onclick="uiManager.returnToMainMenu()">Main Menu</button>
            </div>
        `;
        this.showModal(content);
    }

    /**
     * Save to slot
     */
    saveToSlot(slotNumber) {
        const result = storageManager.saveGame(slotNumber);
        this.showNotification(result.message, result.success ? 'success' : 'error');
        this.closeModal();
    }

    /**
     * Load from slot
     */
    loadFromSlot(slotNumber) {
        const result = storageManager.loadGame(slotNumber);
        if (result.success) {
            this.showScreen('game');
            initializeGameMap();
            gameMap?.markTerritoryDirty();
            this.initializeGameView();
            this.updateHUD();
            this.showNotification('Game loaded', 'success');
        }
        this.closeModal();
    }

    initializeGameView() {
        // Ensure layout is visible before sizing canvases.
        requestAnimationFrame(() => {
            window.game?.handleResize();
            initializeMinimap();
            gameMap?.render();
        });
    }

    /**
     * Return to main menu
     */
    returnToMainMenu() {
        this.closeModal();
        this.showScreen('mainMenu');
        audioManager.stopMusic();
    }

    /**
     * Close unit panel
     */
    closeUnitPanel() {
        document.getElementById('unit-panel')?.classList.remove('active');
        gameState.selectedUnit = null;
        gameMap?.render();
    }
}

// Global UI manager instance
const uiManager = new UIManager();
window.uiManager = uiManager;
