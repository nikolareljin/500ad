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
        this.turnProcessingOverlay = document.getElementById('turn-processing-overlay');

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

        document.getElementById('btn-attack-unit')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.attackWithSelectedUnit();
        });

        document.getElementById('btn-fortify-unit')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.fortifySelectedUnit();
        });

        window.addEventListener('resize', () => {
            this.positionUnitPanel();
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
            // For battles, use: battle_theme
            // For ambient music, use: 500ad_ambient
            audioManager.playMusic('500ad_ambient');
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
        const slotInfo = storageManager.getSaveSlotInfo(0);
        if (!slotInfo) {
            this.showNotification('No save game found', 'error');
            return;
        }

        this.showScreen('game');
        initializeGameMap();
        const result = storageManager.loadGame(0);
        if (result.success) {
            gameMap?.markTerritoryDirty();
            this.initializeGameView();
            this.updateHUD();
            this.showNotification('Game loaded', 'success');
        } else {
            this.showScreen('mainMenu');
            this.showNotification(result.message || 'No save game found', 'error');
        }
    }

    /**
     * End turn
     */
    async endTurn() {
        this.showTurnProcessing(true);
        try {
            const result = await gameState.endTurn();
            if (!result) {
                this.showNotification('Turn did not complete', 'error');
                return;
            }
            if (result.paused) {
                this.showNotification('Please wait, turn is already processing', 'info');
                return;
            }
            this.updateHUD();
            gameMap?.requestRender();

            // Auto-save
            if (storageManager.settings.autoSave) {
                storageManager.autoSave();
            }

            this.showNotification(
                `Turn ${result.turn} - Income: ${result.income.gold} gold, ${result.income.manpower} manpower (cities: ${result.cityProduction?.gold || 0}g/${result.cityProduction?.manpower || 0}m, upkeep ${result.upkeep || 0})`,
                'success'
            );
        } finally {
            this.showTurnProcessing(false);
        }
    }

    showTurnProcessing(visible) {
        if (!this.turnProcessingOverlay) return;
        this.turnProcessingOverlay.classList.toggle('active', Boolean(visible));
        this.turnProcessingOverlay.setAttribute('aria-hidden', visible ? 'false' : 'true');
        const endTurnBtn = document.getElementById('btn-end-turn');
        if (endTurnBtn) {
            endTurnBtn.disabled = Boolean(visible);
        }
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

        const choices = gameState.getRecruitableUnitTypes(tile)
            .map((unitId) => {
                const unit = getUnitById(unitId);
                return {
                    id: unitId,
                    title: `${unit?.name || unitId}`,
                    subtitle: unit ? `${unit.cost.gold}g / ${unit.cost.manpower}m` : ''
                };
            });

        this.showChoiceModal(
            `Recruit at ${tile.cityData.name}`,
            choices,
            (unitId) => {
                const spawnTile = this.findRecruitSpawnTile(tile, unitId);
                if (!spawnTile) {
                    const unit = getUnitById(unitId);
                    const isNaval = unit?.type === 'naval' || unit?.category === 'transport';
                    this.showNotification(
                        isNaval ? 'No valid adjacent water tile for naval recruitment' : 'No open adjacent land tile for recruitment',
                        'error'
                    );
                    return;
                }
                const unit = gameState.recruitUnit(unitId, spawnTile);
                if (!unit) {
                    this.showNotification('Cannot recruit that unit here (requirements or resources missing)', 'error');
                    return;
                }
                this.updateHUD();
                gameMap.requestRender();
                this.showNotification(`${unit.name} recruited at ${tile.cityData.name}`, 'success');
            }
        );
    }

    findRecruitSpawnTile(cityTile, unitId) {
        const unitType = getUnitById(unitId);
        if (!unitType) return null;
        const wantsWater = unitType.type === 'naval' || unitType.category === 'transport' || unitType.bonuses?.waterTraversal;
        const offsets = [
            { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 },
            { x: 1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }
        ];

        for (const offset of offsets) {
            const x = cityTile.x + offset.x;
            const y = cityTile.y + offset.y;
            const mapTile = gameMap.getTile(x, y);
            if (!mapTile) continue;
            if (wantsWater && mapTile.terrain !== 'water') continue;
            if (!wantsWater && mapTile.terrain === 'water') continue;

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
        const isPlayerControlled = tile && (tile.owner === 'player' || gameMap.getTerritoryOwnerAt(tile.x, tile.y) === 'player');
        if (!isPlayerControlled) {
            this.showNotification('Build actions require a player-owned tile', 'error');
            return;
        }
        if (!tile.owner) tile.owner = 'player';

        const choices = Object.entries(BUILD_ACTIONS).map(([actionId, action]) => ({
            id: actionId,
            title: action.name,
            subtitle: `${action.gold}g / ${action.manpower}m / ${action.prestige || 0}p`
        }));

        this.showChoiceModal(
            `Build in ${tile.cityData?.name || `Tile ${tile.x},${tile.y}`}`,
            choices,
            (actionId) => {
                const result = gameState.applyCityBuildAction(tile, actionId);
                if (!result.success) {
                    this.showNotification(result.message || 'Build failed', 'error');
                    return;
                }
                this.updateHUD();
                gameMap.requestRender();
                this.showNotification(`${tile.cityData?.name || `Tile ${tile.x},${tile.y}`}: ${result.actionName}`, 'success');
            }
        );
    }

    researchTechnology() {
        const available = gameState.getAvailableTechnologies();
        if (available.length === 0) {
            this.showNotification('No technologies currently available', 'info');
            return;
        }

        const choices = available.map((tech) => ({
            id: tech.id,
            title: tech.name,
            subtitle: `${tech.cost.gold}g / ${tech.cost.prestige}p`
        }));

        this.showChoiceModal(
            'Research Technology',
            choices,
            (techId) => {
                const result = gameState.researchTechnology(techId);
                if (!result.success) {
                    this.showNotification(result.message || 'Research failed', 'error');
                    return;
                }
                this.updateHUD();
                gameMap?.requestRender();
                this.showNotification(`Technology researched: ${result.name}`, 'success');
            }
        );
    }

    showChoiceModal(title, options, onSelect) {
        const items = options.map((option) => `
            <button class="menu-btn choice-btn" data-choice="${option.id}">
                <span class="btn-text">${option.title}</span>
                <small style="display:block;opacity:0.75;margin-top:0.2rem;">${option.subtitle || ''}</small>
            </button>
        `).join('');

        const content = `
            <h2>${title}</h2>
            <div style="display:flex;flex-direction:column;gap:0.75rem;max-height:65vh;overflow:auto;">
                ${items}
            </div>
            <div style="margin-top:1rem;">
                <button class="menu-btn" id="btn-close-choice">Close</button>
            </div>
        `;

        this.showModal(content);
        this.modalContent?.querySelectorAll('.choice-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-choice');
                this.closeModal();
                onSelect(id);
            });
        });
        this.modalContent?.querySelector('#btn-close-choice')?.addEventListener('click', () => this.closeModal());
    }

    attackWithSelectedUnit() {
        const selected = gameState.selectedUnit;
        if (!selected || selected.owner !== 'player') {
            this.showNotification('Select one of your units first', 'error');
            return;
        }
        if (selected.currentMovement <= 0) {
            this.showNotification(`${selected.name} has no movement remaining this turn`, 'error');
            return;
        }
        if (!gameMap?.selectedTile) {
            this.showNotification('Select a target tile', 'error');
            return;
        }
        const target = gameState.units.find(u =>
            u.owner !== 'player' &&
            u.position.x === gameMap.selectedTile.x &&
            u.position.y === gameMap.selectedTile.y
        );
        if (!target) {
            this.showNotification('No enemy unit on selected tile', 'error');
            return;
        }

        const terrain = gameMap.getTile(target.position.x, target.position.y)?.terrain || 'plains';
        const result = executeBattle(selected.id, target.id, terrain, terrain === 'city' ? 'siege' : 'field', {
            attemptRetreat: true,
            retreatSide: 'defender'
        });
        if (!result.success) {
            this.showNotification(result.message || 'Attack failed', 'error');
            return;
        }

        selected.currentMovement = 0;
        this.showCombatResult(result);
        this.updateHUD();
        gameMap.requestRender();
    }

    fortifySelectedUnit() {
        const selected = gameState.selectedUnit;
        if (!selected || selected.owner !== 'player') {
            this.showNotification('Select one of your units first', 'error');
            return;
        }
        const result = gameState.fortifyUnit(selected.id);
        if (!result?.success) {
            this.showNotification(result?.message || 'Cannot fortify here', 'error');
            return;
        }
        this.showNotification(result.message, 'success');
        this.showUnitPanel(selected);
        this.updateHUD();
        gameMap.requestRender();
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
        this.positionUnitPanel();

        document.getElementById('selected-unit-name').textContent = unit.name;
        const portrait = document.getElementById('selected-unit-portrait');
        if (portrait) {
            let unitIcon = '⚔️';
            if (unit.type === 'cavalry') unitIcon = '🐎';
            if (unit.type === 'naval' || unit.category === 'transport') unitIcon = '⛵';
            if (unit.category === 'ranged') unitIcon = '🏹';
            if (unit.category === 'siege') unitIcon = '🛡️';
            if (unit.category === 'intel') unitIcon = '🕵️';
            if (unit.category === 'support') unitIcon = '⛪';
            if (unit.category === 'economic') unitIcon = '🐪';
            portrait.textContent = '';
            const container = document.createElement('div');
            container.className = 'unit-portrait-content';

            const iconSpan = document.createElement('span');
            iconSpan.className = 'unit-portrait-icon';
            iconSpan.textContent = unitIcon;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'unit-portrait-name';
            nameSpan.textContent = unit.name;

            container.appendChild(iconSpan);
            container.appendChild(nameSpan);
            portrait.appendChild(container);
        }
        document.getElementById('unit-health-value').textContent = `${unit.currentHealth}/${unit.stats.health}`;
        document.getElementById('unit-attack').textContent = unit.stats.attack;
        document.getElementById('unit-defense').textContent = unit.stats.defense;
        document.getElementById('unit-movement').textContent = `${unit.currentMovement.toFixed(1)}/${unit.stats.movement}`;

        const healthBar = document.getElementById('unit-health-bar');
        if (healthBar) {
            const healthPercent = (unit.currentHealth / unit.stats.health) * 100;
            healthBar.style.width = `${healthPercent}%`;
        }

        // Add special action buttons
        this.updateUnitActionButtons(unit);
    }

    positionUnitPanel() {
        const panel = document.getElementById('unit-panel');
        if (!panel) return;

        // Mobile layout pins the panel to the bottom via CSS.
        if (window.matchMedia('(max-width: 768px)').matches) {
            panel.style.top = '';
            panel.style.maxHeight = '';
            return;
        }

        const hud = document.querySelector('.game-hud');
        const gameScreen = document.getElementById('game-screen');
        if (!hud || !gameScreen) return;

        const hudRect = hud.getBoundingClientRect();
        const screenRect = gameScreen.getBoundingClientRect();
        const topOffset = Math.ceil(hudRect.bottom - screenRect.top + 8);
        const bottomMargin = 88;
        const maxHeight = Math.max(220, Math.floor(window.innerHeight - topOffset - bottomMargin));

        panel.style.top = `${topOffset}px`;
        panel.style.maxHeight = `${maxHeight}px`;
    }

    /**
     * Update unit action buttons based on capabilities
     */
    updateUnitActionButtons(unit) {
        const container = document.querySelector('.unit-actions');
        if (!container) return;

        // Clear existing custom buttons (everything except move/attack/fortify if they are static)
        // For simplicity, let's just rebuild the whole set
        container.innerHTML = '';

        const moveBtn = document.createElement('button');
        moveBtn.className = 'action-btn';
        moveBtn.id = 'btn-move-unit';
        moveBtn.textContent = 'Move';
        moveBtn.onclick = () => {
            this.showNotification('Select a destination tile to move this unit.', 'info');
        };
        container.appendChild(moveBtn);

        const attackBtn = document.createElement('button');
        attackBtn.className = 'action-btn';
        attackBtn.id = 'btn-attack-unit';
        attackBtn.textContent = 'Attack';
        attackBtn.onclick = () => this.attackWithSelectedUnit();
        container.appendChild(attackBtn);

        const fortBtn = document.createElement('button');
        fortBtn.className = 'action-btn';
        fortBtn.id = 'btn-fortify-unit';
        fortBtn.textContent = 'Fortify';
        fortBtn.onclick = () => this.fortifySelectedUnit();
        container.appendChild(fortBtn);

        // Engineer special actions
        if (unit.typeId === 'civil_engineers') {
            const buildRoadBtn = document.createElement('button');
            buildRoadBtn.className = 'action-btn';
            buildRoadBtn.textContent = 'Build Road';
            buildRoadBtn.onclick = () => {
                const result = gameState.applyUnitBuildAction(unit, 'build_road');
                if (result.success) {
                    this.showNotification('Road construction started', 'success');
                    this.updateHUD();
                } else {
                    this.showNotification(result.message, 'error');
                }
            };
            container.appendChild(buildRoadBtn);

            const automateBtn = document.createElement('button');
            automateBtn.className = `action-btn ${unit.automated ? 'active' : ''}`;
            automateBtn.textContent = unit.automated ? 'Automated: ON' : 'Automate';
            automateBtn.onclick = () => {
                unit.automated = !unit.automated;
                automateBtn.textContent = unit.automated ? 'Automated: ON' : 'Automate';
                automateBtn.classList.toggle('active', unit.automated);
                this.showNotification(unit.automated ? 'Engineer automation enabled' : 'Engineer automation disabled', 'info');
            };
            container.appendChild(automateBtn);
        }

        // Transport unit actions
        if (unit.bonuses?.transportCapacity && unit.carryingUnits && unit.carryingUnits.length > 0) {
            const unloadBtn = document.createElement('button');
            unloadBtn.className = 'action-btn';
            unloadBtn.textContent = `Unload (${unit.carryingUnits.length})`;
            unloadBtn.onclick = () => {
                const result = gameState.unloadUnits(unit.id);
                if (result.success) {
                    this.updateUnitActionButtons(unit);
                } else {
                    this.showNotification(result.message, 'error');
                }
            };
            container.appendChild(unloadBtn);
        }

        // Destination cancel button
        if (unit.destination) {
            const cancelDestBtn = document.createElement('button');
            cancelDestBtn.className = 'action-btn danger';
            cancelDestBtn.textContent = 'Cancel Route';
            cancelDestBtn.onclick = () => {
                unit.destination = null;
                this.showNotification('Route cancelled', 'info');
                this.updateUnitActionButtons(unit);
            };
            container.appendChild(cancelDestBtn);
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
    showGameOver(isVictory, customMessage = '') {
        const title = isVictory ? 'Victory!' : 'Defeat!';
        const defaultMessage = isVictory
            ? 'For the Glory of Constantinople! The Empire is secure.'
            : 'Constantinople has fallen. The legacy of Rome ends here.';
        const message = customMessage || defaultMessage;
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
        if (gameMap) {
            gameMap.focusOnBattleUnits(attacker, defender);
            const highlighted = [];
            if (attacker && attacker.currentHealth < attacker.stats.health) highlighted.push(attacker.id);
            if (defender && defender.currentHealth < defender.stats.health) highlighted.push(defender.id);
            gameMap.setBattleHealthHighlights(highlighted, 3500);
        }
        const battlePosition = defender?.position || attacker?.position;
        let locationText = '';
        if (battlePosition && gameMap) {
            let nearestTown = null;
            let nearestDistance = Number.POSITIVE_INFINITY;
            const cityTiles = gameMap.getCityTiles() || [];
            cityTiles.forEach((tile) => {
                const distance = Math.abs(tile.x - battlePosition.x) + Math.abs(tile.y - battlePosition.y);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestTown = tile.cityData?.name || tile.name || null;
                }
            });
            if (nearestTown && Number.isFinite(nearestDistance) && nearestDistance <= 8) {
                locationText = ` near ${nearestTown}`;
            }
        }

        const message = `${attacker?.name || 'Unit'} dealt ${result.attackerDamage} damage to ${defender?.name || 'Enemy'}${locationText}. Target health: ${result.defender.health}`;
        this.showNotification(message, 'info');

        // Flash the screen if player was attacked
        if (defender?.owner === 'player') {
            document.body.classList.add('hit-shake');
            setTimeout(() => document.body.classList.remove('hit-shake'), 500);
        }

        gameMap?.requestRender();
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
                    <strong>Version:</strong> ${window.APP_VERSION || 'dev'}
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
        const slotInfo = storageManager.getSaveSlotInfo(slotNumber);
        if (!slotInfo) {
            this.showNotification('No save data found', 'error');
            this.closeModal();
            return;
        }

        this.showScreen('game');
        initializeGameMap();
        const result = storageManager.loadGame(slotNumber);
        if (result.success) {
            gameMap?.markTerritoryDirty();
            this.initializeGameView();
            this.updateHUD();
            this.showNotification('Game loaded', 'success');
        } else {
            this.showScreen('mainMenu');
            this.showNotification(result.message, 'error');
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
