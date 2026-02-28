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
        this.selectedScenario = SCENARIOS.empire;
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

        document.getElementById('btn-diplomacy')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.manageDiplomacy();
        });

        document.getElementById('btn-quests')?.addEventListener('click', () => {
            audioManager.playUISound('click');
            this.showQuestLogModal();
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
        this.clearLeaderSelection();
        this.populateCenturies();
        this.populateScenarios();
        this.switchCentury(this.selectedCentury);
    }

    clearLeaderSelection() {
        this.selectedLeaderCard = null;
        document.querySelectorAll('.leader-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById('leader-detail')?.classList.remove('active');
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
        this.clearLeaderSelection();

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
        this.clearLeaderSelection();

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
        const portraitPath = this.getLeaderPortraitPath(leader);
        const portraitHtml = portraitPath
            ? `<img src="${portraitPath}" alt="${leader.name}" loading="lazy" onerror="this.remove(); this.parentElement.classList.add('leader-portrait-fallback'); this.parentElement.innerHTML='${symbol}';">`
            : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;background:linear-gradient(135deg, var(--parchment-dark), var(--parchment));">
                    ${symbol}
                </div>`;

        card.innerHTML = `
            <div class="leader-portrait">
                ${portraitHtml}
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
            portrait.classList.remove('leader-portrait-fallback');
            const symbol = leader.faction ? getFactionSymbol(leader.faction) : (this.selectedFaction ? getFactionSymbol(this.selectedFaction) : BYZANTINE_SYMBOLS.crown);
            const portraitPath = this.getLeaderPortraitPath(leader);
            if (portraitPath) {
                portrait.innerHTML = `<img src="${portraitPath}" alt="${leader.name}" onerror="this.remove(); this.parentElement.classList.add('leader-portrait-fallback'); this.parentElement.innerHTML='${symbol}';">`;
            } else {
                portrait.classList.add('leader-portrait-fallback');
                portrait.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:6rem;">${symbol}</div>`;
            }
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

    getLeaderPortraitPath(leader) {
        const file = leader?.portrait;
        if (!file) return null;
        if (file.startsWith('http://') || file.startsWith('https://') || file.startsWith('//')) {
            return null;
        }
        if (file.startsWith('assets/') || file.startsWith('./assets/') || file.startsWith('/assets/')) {
            return file;
        }
        return `assets/images/leaders/${file}`;
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
            audioManager.playMusic('500ad_ambient');
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
                `Turn ${result.turn} - Income: ${result.income.gold} gold, ${result.income.manpower} manpower, ${result.income.food || 0} food (cities: ${result.cityProduction?.gold || 0}g/${result.cityProduction?.manpower || 0}m, upkeep ${result.upkeep || 0})`,
                'success'
            );
            const generatedNarratives = result.dynamicNarrative?.generated || [];
            if (generatedNarratives.length > 0) {
                const names = generatedNarratives.map((entry) => entry.title).join(', ');
                this.showNotification(`New quest/event: ${names}`, 'info');
            }
            if (result.researchProgress?.completed) {
                this.showNotification(`Research completed: ${result.researchProgress.completed.name}`, 'success');
            } else if (result.researchProgress?.active) {
                const active = result.researchProgress.active;
                this.showNotification(
                    `Research in progress: ${active.name} (${active.turnsRemaining}/${active.totalTurns} turns left)`,
                    'info'
                );
            }
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

        const choices = gameState.getRecruitmentOptions(tile)
            .map((entry) => ({
                id: entry.unitId,
                title: `${entry.unit?.name || entry.unitId}`,
                subtitle: entry.finalCost ? `${entry.finalCost.gold}g / ${entry.finalCost.manpower}m` : '',
                detail: entry.available ? 'Available' : entry.reasons.join(' • '),
                disabled: !entry.available
            }));

        this.showChoiceModal(
            `Recruit at ${tile.cityData.name}`,
            choices,
            (unitId) => {
                const currentStatus = gameState.getRecruitmentOptionStatus(tile, unitId);
                if (!currentStatus.available) {
                    this.showNotification(currentStatus.reasons.join('; '), 'error');
                    return;
                }
                const spawnTile = currentStatus.spawnTile;
                if (!spawnTile) {
                    const unit = getUnitById(unitId);
                    const isNaval = unit?.type === 'naval' || unit?.category === 'transport';
                    this.showNotification(
                        isNaval ? 'No valid adjacent water tile for naval recruitment' : 'No open adjacent land tile for recruitment',
                        'error'
                    );
                    return;
                }
                const unit = gameState.recruitUnit(unitId, spawnTile, { cityTile: tile });
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
        return gameState.getRecruitSpawnTile(cityTile, unitId);
    }

    buildInSelectedCity() {
        if (!gameMap?.selectedTile) {
            this.showNotification('Select a city tile to build', 'error');
            return;
        }

        const tile = gameMap.getTile(gameMap.selectedTile.x, gameMap.selectedTile.y);
        const isPlayerControlled = tile && (tile.owner === 'player' || gameMap.getTerritoryOwnerAt(tile.x, tile.y) === 'player');
        const hasColonizationUnit = Boolean(gameState.getColonizationUnitOnTile?.(tile));
        if (!isPlayerControlled && !hasColonizationUnit) {
            this.showNotification('Build here requires either a player-owned tile or a stationed land unit for colonization', 'error');
            return;
        }
        const cityData = gameState.ensureCityBuildingState(tile);
        const autoBuildEnabled = Boolean(cityData?.autoBuildEnabled);
        const hasCity = Boolean(tile?.cityData);
        const cityName = tile.cityData?.name || `Tile ${tile.x},${tile.y}`;
        const buildModeLabel = autoBuildEnabled ? 'AUTO' : 'MANUAL';

        const cityBuildingChoices = hasCity ? gameState.getCityBuildingOptions(tile).map((entry) => ({
            id: `city_building:${entry.id}`,
            title: `${entry.name} (L${entry.currentLevel}/${entry.maxLevel})`,
            subtitle: entry.nextLevel && entry.cost
                ? `Upgrade to L${entry.nextLevel} • ${entry.cost.gold}g / ${entry.cost.manpower}m / ${entry.cost.prestige || 0}p • ${entry.turns} turns`
                : 'Max level reached',
            detail: entry.available ? 'Available' : entry.reasons.join(' • '),
            disabled: !entry.available
        })) : [];
        const automationChoice = {
            id: 'city_auto_toggle',
            title: autoBuildEnabled ? 'Auto Build: ON' : 'Auto Build: OFF',
            subtitle: `Current Build Mode: ${buildModeLabel}`,
            detail: autoBuildEnabled
                ? 'AUTO mode: city can start one building-tree upgrade each turn by priority'
                : 'MANUAL mode: no auto-starts; you choose city projects yourself'
        };
        const infrastructureChoices = gameState.getBuildActionOptions(tile).map((entry) => ({
            id: `infra:${entry.actionId}`,
            title: `${entry.action?.name || entry.actionId} [Infrastructure]`,
            subtitle: `${entry.action?.gold || 0}g / ${entry.action?.manpower || 0}m / ${entry.action?.prestige || 0}p`,
            detail: entry.available ? 'Available' : entry.reasons.join(' • '),
            disabled: !entry.available
        }));
        const choices = hasCity
            ? [automationChoice, ...cityBuildingChoices, ...infrastructureChoices]
            : infrastructureChoices;

        this.showChoiceModal(
            `Build in ${cityName} • Mode: ${buildModeLabel}`,
            choices,
            (choiceId) => {
                if (choiceId === 'city_auto_toggle') {
                    const current = gameState.ensureCityBuildingState(tile);
                    if (!current) {
                        this.showNotification('Auto Build is only available in city tiles', 'error');
                        return;
                    }
                    current.autoBuildEnabled = !current.autoBuildEnabled;
                    this.showNotification(
                        `${cityName}: Build Mode ${current.autoBuildEnabled ? 'AUTO' : 'MANUAL'}`,
                        'info'
                    );
                    this.updateHUD();
                    gameMap.requestRender();
                    // Re-open so the updated mode is visible immediately.
                    setTimeout(() => this.buildInSelectedCity(), 0);
                    return;
                }
                const isCityBuilding = choiceId.startsWith('city_building:');
                const isInfrastructure = choiceId.startsWith('infra:');
                const id = isCityBuilding
                    ? choiceId.substring('city_building:'.length)
                    : (isInfrastructure ? choiceId.substring('infra:'.length) : choiceId);
                const result = isCityBuilding
                    ? gameState.startCityBuildingProject(tile, id)
                    : gameState.applyCityBuildAction(tile, id);
                if (!result.success) {
                    this.showNotification(result.message || 'Build failed', 'error');
                    return;
                }
                this.updateHUD();
                gameMap.requestRender();
                const message = isCityBuilding
                    ? `${cityName}: ${result.buildingName} upgrade to L${result.targetLevel} started (${result.turns} turns)`
                    : `${cityName}: ${result.actionName}`;
                this.showNotification(message, 'success');
            }
        );
    }

    researchTechnology() {
        if (!gameState?.initialized) {
            this.showNotification('Start a campaign before opening research.', 'error');
            return;
        }
        const techState = gameState.getTechnologyTreeState();
        if (techState.length === 0) {
            this.showNotification('No technologies defined', 'info');
            return;
        }

        const escapeHtml = this.escapeHtml.bind(this);
        const activeResearch = gameState.player?.activeResearch || null;
        const techById = new Map(techState.map((tech) => [tech.id, tech]));
        const tierById = {};
        const getTier = (techId, stack = new Set()) => {
            if (Number.isFinite(tierById[techId])) return tierById[techId];
            if (stack.has(techId)) return 1;
            stack.add(techId);
            const tech = techById.get(techId);
            const requires = Array.isArray(tech?.requires) ? tech.requires : [];
            if (requires.length === 0) {
                tierById[techId] = 1;
            } else {
                const depth = requires.reduce((max, reqId) => Math.max(max, getTier(reqId, stack)), 1);
                tierById[techId] = depth + 1;
            }
            stack.delete(techId);
            return tierById[techId];
        };
        techState.forEach((tech) => getTier(tech.id));

        const unlockSummary = (tech) => {
            const unlocks = tech.unlocks || {};
            const parts = [];
            const labelList = (ids, resolver) => (ids || []).map((id) => resolver(id)).filter(Boolean);
            const unitLabels = labelList(unlocks.units, (id) => getUnitById(id)?.name || id);
            const buildingLabels = labelList(unlocks.buildings, (id) => CITY_BUILDING_TREE[id]?.name || id);
            const actionLabels = labelList(unlocks.buildActions, (id) => BUILD_ACTIONS[id]?.name || id);
            if (unitLabels.length > 0) parts.push(`Units: ${unitLabels.join(', ')}`);
            if (buildingLabels.length > 0) parts.push(`Buildings: ${buildingLabels.join(', ')}`);
            if (actionLabels.length > 0) parts.push(`City actions: ${actionLabels.join(', ')}`);
            return parts.length > 0 ? parts.join(' | ') : 'Unlocks strategic bonuses';
        };

        const tiers = {};
        techState.forEach((tech) => {
            const tier = tierById[tech.id] || 1;
            if (!tiers[tier]) tiers[tier] = [];
            tiers[tier].push(tech);
        });

        const statusLabel = {
            researched: 'Researched',
            researching: 'Researching',
            available: 'Available',
            locked: 'Locked'
        };
        const tierHtml = Object.keys(tiers)
            .map((tierStr) => Number.parseInt(tierStr, 10))
            .sort((a, b) => a - b)
            .map((tier) => {
                const cards = tiers[tier]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((tech) => {
                        const status = tech.status || 'locked';
                        const requirements = (tech.requires || []).map((reqId) => techById.get(reqId)?.name || reqId);
                        const requiresLabel = requirements.length > 0 ? requirements.join(', ') : 'None';
                        const unlocks = unlockSummary(tech);
                        const showStartButton = status === 'available' && !activeResearch;
                        const progressText = activeResearch && activeResearch.techId === tech.id
                            ? `Progress: ${Math.max(0, activeResearch.totalTurns - activeResearch.turnsRemaining)}/${activeResearch.totalTurns} turns`
                            : '';
                        return `
                            <article class="tech-node tech-node-${status}">
                                <div class="tech-node-header">
                                    <h3>${escapeHtml(tech.name)}</h3>
                                    <span class="tech-status-chip tech-status-${status}">${statusLabel[status] || 'Locked'}</span>
                                </div>
                                <p class="tech-node-description">${escapeHtml(tech.description || '')}</p>
                                <p class="tech-node-meta"><strong>Cost:</strong> ${tech.cost?.gold || 0}g / ${tech.cost?.prestige || 0}p | <strong>Time:</strong> ${tech.researchTurns || 1} turns</p>
                                <p class="tech-node-meta"><strong>Requires:</strong> ${escapeHtml(requiresLabel)}</p>
                                <p class="tech-node-meta"><strong>Unlocks:</strong> ${escapeHtml(unlocks)}</p>
                                ${progressText ? `<p class="tech-node-progress">${escapeHtml(progressText)}</p>` : ''}
                                ${showStartButton ? `<button class="menu-btn tech-start-btn" data-tech-start="${escapeHtml(tech.id)}">Start Research</button>` : ''}
                                ${status === 'locked' && tech.missingRequirements?.length ? `<p class="tech-node-blocked">Missing: ${escapeHtml(tech.missingRequirements.join(', '))}</p>` : ''}
                            </article>
                        `;
                    })
                    .join('');
                return `
                    <section class="tech-tier-section">
                        <h3>Tier ${tier}</h3>
                        <div class="tech-tier-grid">${cards}</div>
                    </section>
                `;
            })
            .join('');

        const activeBanner = activeResearch
            ? `<p class="tech-active-banner"><strong>Current Research:</strong> ${escapeHtml(activeResearch.name || activeResearch.techId)} (${activeResearch.turnsRemaining}/${activeResearch.totalTurns} turns remaining)</p>`
            : '<p class="tech-active-banner"><strong>Current Research:</strong> None</p>';
        const content = `
            <h2>Research & Technology Tree</h2>
            ${activeBanner}
            <p class="tech-tree-legend">
                <span class="tech-status-chip tech-status-available">Available</span>
                <span class="tech-status-chip tech-status-researching">Researching</span>
                <span class="tech-status-chip tech-status-researched">Researched</span>
                <span class="tech-status-chip tech-status-locked">Locked</span>
            </p>
            <div class="tech-tree-container">${tierHtml}</div>
            <div style="margin-top:1rem;">
                <button class="menu-btn" id="btn-close-tech-tree">Close</button>
            </div>
        `;

        this.showModal(content);
        this.modalContent?.querySelector('#btn-close-tech-tree')?.addEventListener('click', () => this.closeModal());
        this.modalContent?.querySelectorAll('[data-tech-start]').forEach((button) => {
            button.addEventListener('click', () => {
                const techId = button.getAttribute('data-tech-start');
                const result = gameState.researchTechnology(techId);
                if (!result.success) {
                    this.showNotification(result.message || 'Research failed', 'error');
                    return;
                }
                this.updateHUD();
                gameMap?.requestRender();
                this.showNotification(`Research started: ${result.name} (${result.turns} turns)`, 'success');
                this.researchTechnology();
            });
        });
    }

    manageDiplomacy() {
        if (!gameState?.initialized) {
            this.showNotification('Start a campaign before opening diplomacy.', 'error');
            return;
        }

        const escapeHtml = this.escapeHtml.bind(this);

        const renderDiplomacyModal = () => {
            const overview = (typeof gameState.getDiplomacyOverview === 'function') ? gameState.getDiplomacyOverview() : [];
            const reputation = gameState?.diplomacyState?.reputation || 0;
            const activeRoutes = (gameState?.diplomacyState?.tradeRoutes || []).filter((route) => route?.active).length;
            const rows = overview.map((entry) => {
                const actions = this.getDiplomacyActions(entry);
                const actionButtons = actions.map((action) => `
                    <button class="menu-btn choice-btn${action.disabled ? ' choice-btn-disabled' : ''}" data-dipl-action="${escapeHtml(action.id)}" data-dipl-faction="${escapeHtml(entry.factionId)}" ${action.disabled ? 'disabled aria-disabled="true"' : ''}>
                        <span class="btn-text">${escapeHtml(action.title)}</span>
                        <small class="choice-btn-subtitle">${escapeHtml(action.subtitle || '')}</small>
                    </button>
                `).join('');
                return `
                    <div class="dipl-row">
                        <h3>${escapeHtml(entry.displayName || this.formatFactionName(entry.factionId))}</h3>
                        <p>Status: <strong>${escapeHtml(entry.status)}</strong> | Hostility: ${escapeHtml(entry.hostility)} | Trust: ${escapeHtml(entry.trust)}</p>
                        <p>Trade: ${entry.tradeAgreement ? 'Agreement active' : 'No agreement'}${entry.route ? ` | Route value: ${escapeHtml(entry.route.value)}g` : ''}</p>
                        <div class="dipl-actions">${actionButtons}</div>
                    </div>
                `;
            }).join('');

            const content = `
                <h2>Diplomacy & Trade</h2>
                <p>Reputation: <strong>${reputation}</strong> | Active Trade Routes: <strong>${activeRoutes}</strong></p>
                <div class="dipl-list" style="display:flex;flex-direction:column;gap:0.75rem;max-height:60vh;overflow:auto;">
                    ${overview.length > 0 ? rows : '<p>No known factions to negotiate with yet.</p>'}
                </div>
                <div style="margin-top:1rem;">
                    <button class="menu-btn" id="btn-close-diplomacy">Close</button>
                </div>
            `;

            this.showModal(content);
            this.modalContent?.querySelector('#btn-close-diplomacy')?.addEventListener('click', () => this.closeModal());
            this.modalContent?.querySelectorAll('[data-dipl-action]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const actionId = btn.getAttribute('data-dipl-action');
                    const factionId = btn.getAttribute('data-dipl-faction');
                    const result = gameState.applyDiplomacyAction(actionId, factionId);
                    this.showNotification(result.message, result.success ? 'success' : 'error');
                    this.updateHUD();
                    renderDiplomacyModal();
                });
            });
        };

        renderDiplomacyModal();
    }

    getDiplomacyActions(entry) {
        const status = entry?.status || 'war';
        const tradeAgreement = Boolean(entry?.tradeAgreement);
        return [
            {
                id: 'propose_truce',
                title: 'Propose Truce',
                subtitle: 'Pause hostilities',
                disabled: status !== 'war'
            },
            {
                id: 'propose_alliance',
                title: 'Propose Alliance',
                subtitle: 'Mutual non-aggression',
                disabled: status === 'war' || status === 'alliance'
            },
            {
                id: 'trade_agreement',
                title: 'Trade Agreement',
                subtitle: 'Establish income routes',
                disabled: status === 'war' || tradeAgreement
            },
            {
                id: 'declare_war',
                title: 'Declare War',
                subtitle: 'Break ties and fight',
                disabled: status === 'war'
            }
        ];
    }

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    showQuestLogModal() {
        if (!gameState?.initialized) {
            this.showNotification('Start a campaign before opening quests.', 'error');
            return;
        }
        const overview = typeof gameState.getDynamicNarrativeOverview === 'function'
            ? gameState.getDynamicNarrativeOverview()
            : { active: [], history: [] };
        const active = Array.isArray(overview.active) ? overview.active : [];
        const history = Array.isArray(overview.history) ? overview.history : [];

        const activeHtml = active.length > 0
            ? active.map((entry) => {
                const tags = (entry.triggerTags || []).map((tag) => `<span style="display:inline-block;padding:0.2rem 0.45rem;border:1px solid rgba(212,175,55,0.45);border-radius:999px;font-size:0.75rem;opacity:0.9;">${this.escapeHtml(tag)}</span>`).join(' ');
                const choices = (entry.choices || []).map((choice) => `
                    <button class="menu-btn quest-choice-btn" data-quest-id="${this.escapeHtml(entry.id)}" data-choice-id="${this.escapeHtml(choice.id)}">
                        <span class="btn-text">${this.escapeHtml(choice.title)}</span>
                        <small class="choice-btn-subtitle">${this.escapeHtml(choice.subtitle || '')}</small>
                    </button>
                `).join('');
                return `
                    <article class="dipl-row">
                        <h3>${this.escapeHtml(entry.title)}</h3>
                        <p>Type: <strong>${this.escapeHtml(entry.type)}</strong> | Started turn ${this.escapeHtml(entry.createdTurn)}</p>
                        ${tags ? `<div class="dipl-actions">${tags}</div>` : ''}
                        <p>${this.escapeHtml(entry.description || '')}</p>
                        <div class="dipl-actions" style="flex-direction:column;align-items:stretch;">${choices}</div>
                    </article>
                `;
            }).join('')
            : '<p>No active quests/events.</p>';

        const historyHtml = history.length > 0
            ? history.map((entry) => `
                <div class="dipl-row">
                    <h3>${this.escapeHtml(entry.title || 'Untitled')}</h3>
                    <p>${this.escapeHtml(entry.choiceTitle || entry.selectedChoiceId || entry.status || 'Logged')} • turn ${this.escapeHtml(entry.resolvedTurn ?? entry.createdTurn ?? gameState.turn)}</p>
                </div>
            `).join('')
            : '<p>No history entries yet.</p>';

        const content = `
            <h2>Quests & Events</h2>
            <div class="dipl-list" style="display:flex;flex-direction:column;gap:0.75rem;max-height:68vh;overflow:auto;">
                <section>
                    <h3>Active</h3>
                    <div style="display:flex;flex-direction:column;gap:0.65rem;">${activeHtml}</div>
                </section>
                <section>
                    <h3>History</h3>
                    <div style="display:flex;flex-direction:column;gap:0.45rem;">${historyHtml}</div>
                </section>
            </div>
            <div style="margin-top:1rem;">
                <button class="menu-btn" id="btn-close-quest-log">Close</button>
            </div>
        `;
        this.showModal(content);

        this.modalContent?.querySelector('#btn-close-quest-log')?.addEventListener('click', () => this.closeModal());
        this.modalContent?.querySelectorAll('.quest-choice-btn').forEach((button) => {
            button.addEventListener('click', () => {
                const questId = button.getAttribute('data-quest-id');
                const choiceId = button.getAttribute('data-choice-id');
                const result = gameState.resolveDynamicNarrativeChoice(questId, choiceId);
                if (!result?.success) {
                    this.showNotification(result?.message || 'Could not apply choice.', 'error');
                    return;
                }
                this.updateHUD();
                gameMap?.requestRender();
                this.showNotification(result.message || 'Choice applied', 'success');
                this.showQuestLogModal();
            });
        });
    }

    showChoiceModal(title, options, onSelect) {
        const items = options.map((option) => `
            <button class="menu-btn choice-btn${option.disabled ? ' choice-btn-disabled' : ''}" data-choice="${option.id}" ${option.disabled ? 'disabled aria-disabled="true"' : ''}>
                <span class="btn-text">${option.title}</span>
                <small class="choice-btn-subtitle">${option.subtitle || ''}</small>
                ${option.detail ? `<small class="choice-btn-detail${option.disabled ? ' choice-btn-detail-disabled' : ''}">${option.detail}</small>` : ''}
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
                if (btn.disabled) return;
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
        const engagement = gameState.canUnitsEngage(selected, target);
        if (!engagement.allowed) {
            this.showNotification(engagement.reason || 'Attack not allowed.', 'error');
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
        const resources = gameState.player.resources || {};
        document.getElementById('resource-gold').textContent = resources.gold || 0;
        document.getElementById('resource-manpower').textContent = resources.manpower || 0;
        document.getElementById('resource-prestige').textContent = resources.prestige || 0;
        const setOptionalResource = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value || 0;
        };
        setOptionalResource('resource-food', resources.food);
        setOptionalResource('resource-wood', resources.wood);
        setOptionalResource('resource-stone', resources.stone);
        setOptionalResource('resource-iron', resources.iron);
        setOptionalResource('resource-rare', resources.rare);
        document.getElementById('turn-number').textContent = gameState.turn;
    }

    /**
     * Show unit panel
     */
    showUnitPanel(unit, options = {}) {
        const panel = document.getElementById('unit-panel');
        if (!panel) return;
        const enemyView = Boolean(options.enemyView);
        const estimatedView = Boolean(options.estimatedView);

        panel.classList.add('active');
        panel.classList.toggle('enemy-panel', enemyView);
        this.positionUnitPanel();

        document.getElementById('selected-unit-name').textContent = unit.name;
        const metaEl = document.getElementById('unit-panel-meta');
        if (metaEl) {
            if (enemyView) {
                const factionName = this.formatFactionName(unit.faction || unit.owner || 'enemy');
                metaEl.textContent = `Enemy force: ${factionName}${estimatedView ? ' • Estimated strength' : ''}`;
            } else {
                const factionText = unit.faction ? `Faction: ${this.formatFactionName(unit.faction)}` : 'Your unit';
                const moveModeText = this.getSelectedUnitMoveModeLabel(unit);
                metaEl.textContent = moveModeText ? `${factionText} • ${moveModeText}` : factionText;
            }
        }
        const portrait = document.getElementById('selected-unit-portrait');
        if (portrait) {
            const unitType = getUnitById(unit.typeId);
            const symbol = unit.symbol || unitType?.symbol || '⚔️';

            portrait.textContent = '';
            const container = document.createElement('div');
            container.className = `unit-portrait-content ${unit.owner === 'player' ? 'player-unit' : 'enemy-unit'}`;
            container.dataset.category = unit.category;

            const iconSpan = document.createElement('span');
            iconSpan.className = 'unit-portrait-icon';
            iconSpan.textContent = symbol;
            if (symbol.length > 2) iconSpan.style.fontSize = '1.8rem';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'unit-portrait-name';
            nameSpan.textContent = unit.name;

            container.appendChild(iconSpan);
            container.appendChild(nameSpan);
            portrait.appendChild(container);
        }
        const statLabels = document.querySelectorAll('#unit-panel .stat-label');
        if (statLabels.length >= 4) {
            statLabels[0].textContent = estimatedView ? 'Health (est.)' : 'Health';
            statLabels[1].textContent = estimatedView ? 'Attack (est.)' : 'Attack';
            statLabels[2].textContent = estimatedView ? 'Defense (est.)' : 'Defense';
            statLabels[3].textContent = estimatedView ? 'Movement (est.)' : 'Movement';
        }

        if (estimatedView) {
            document.getElementById('unit-health-value').textContent = this.formatEstimatedHealth(unit);
            document.getElementById('unit-attack').textContent = this.formatEstimatedRange(unit.stats.attack, 0.18);
            document.getElementById('unit-defense').textContent = this.formatEstimatedRange(unit.stats.defense, 0.18);
            document.getElementById('unit-movement').textContent = this.formatEstimatedRange(unit.currentMovement, 0.25, { decimals: 1 });
        } else {
            document.getElementById('unit-health-value').textContent = `${unit.currentHealth}/${unit.stats.health}`;
            document.getElementById('unit-attack').textContent = unit.stats.attack;
            document.getElementById('unit-defense').textContent = unit.stats.defense;
            document.getElementById('unit-movement').textContent = `${unit.currentMovement.toFixed(1)}/${unit.stats.movement}`;
        }

        const healthBar = document.getElementById('unit-health-bar');
        if (healthBar) {
            const healthPercent = (unit.currentHealth / unit.stats.health) * 100;
            healthBar.style.width = `${healthPercent}%`;
        }

        if (enemyView) {
            const container = document.querySelector('.unit-actions');
            if (container) {
                container.innerHTML = '<div class="unit-intel-note">Intelligence is approximate. Exact combat values, morale, and bonuses are unknown.</div>';
            }
            return;
        }

        // Add special action buttons
        this.updateUnitActionButtons(unit);
    }

    showEnemyUnitPanel(unit) {
        this.showUnitPanel(unit, { enemyView: true, estimatedView: true });
    }

    getSelectedUnitMoveModeLabel(unit) {
        if (!unit || unit.owner !== 'player') return null;
        const isSelected = gameState?.selectedUnit?.id === unit.id;
        if (!isSelected) return null;
        return Boolean(gameMap?.awaitingMoveOrder) ? 'Move Mode: ON' : 'Move Mode: OFF';
    }

    formatFactionName(factionId) {
        if (!factionId) return 'Unknown';
        const labels = {
            byzantine: 'Byzantines',
            arab: 'Arabs',
            bulgar: 'Bulgars',
            frank: 'Franks',
            sassanid: 'Sassanids',
            tribal: 'Tribal Confederation',
            enemy: 'Enemy Army',
            neutral: 'Neutral'
        };
        if (labels[factionId]) return labels[factionId];
        return String(factionId)
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (m) => m.toUpperCase());
    }

    formatEstimatedRange(value, uncertainty = 0.15, options = {}) {
        const decimals = Number.isFinite(options.decimals) ? options.decimals : 0;
        const n = Number.isFinite(value) ? Number(value) : 0;
        const spread = Math.max(decimals > 0 ? 0.2 : 1, Math.abs(n) * uncertainty);
        const factor = 10 ** decimals;
        const low = Math.max(0, Math.floor((n - spread) * factor) / factor);
        const high = Math.max(low, Math.ceil((n + spread) * factor) / factor);
        const fmt = (x) => decimals > 0 ? x.toFixed(decimals) : String(Math.round(x));
        return low === high ? `~${fmt(low)}` : `~${fmt(low)}-${fmt(high)}`;
    }

    formatEstimatedHealth(unit) {
        const hpRatio = Math.max(0, Math.min(1, (unit.currentHealth || 0) / Math.max(1, unit.stats?.health || 1)));
        let condition = 'Unknown';
        if (hpRatio >= 0.8) condition = 'Strong';
        else if (hpRatio >= 0.55) condition = 'Steady';
        else if (hpRatio >= 0.3) condition = 'Worn';
        else condition = 'Critical';

        const spread = Math.max(8, Math.floor((unit.stats.health || 1) * 0.12));
        const low = Math.max(0, Math.min(unit.stats.health, unit.currentHealth - spread));
        const high = Math.max(low, Math.min(unit.stats.health, unit.currentHealth + spread));
        return `${condition} (~${low}-${high}/${unit.stats.health})`;
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
        const withClickSound = (handler) => () => {
            if (typeof audioManager !== 'undefined' && audioManager?.playUISound) {
                audioManager.playUISound('click');
            }
            handler();
        };

        // Clear existing custom buttons (everything except move/attack/fortify if they are static)
        // For simplicity, let's just rebuild the whole set
        container.innerHTML = '';

        const moveBtn = document.createElement('button');
        moveBtn.className = 'action-btn';
        moveBtn.id = 'btn-move-unit';
        const moveArmed = Boolean(gameMap?.awaitingMoveOrder);
        moveBtn.textContent = moveArmed ? 'Move Mode: ON' : 'Move Mode: OFF';
        if (moveArmed) moveBtn.classList.add('active');
        moveBtn.onclick = withClickSound(() => {
            if (gameMap) gameMap.awaitingMoveOrder = !gameMap.awaitingMoveOrder;
            this.hideUnitPanelForMapTargeting();
            const armed = Boolean(gameMap?.awaitingMoveOrder);
            moveBtn.textContent = armed ? 'Move Mode: ON' : 'Move Mode: OFF';
            moveBtn.classList.toggle('active', armed);
            this.showNotification(
                armed
                    ? 'Move mode ON: pan map if needed, then click destination tile.'
                    : 'Move mode OFF.',
                'info'
            );
            this.showUnitPanel(unit);
            gameMap?.requestRender();
        });
        container.appendChild(moveBtn);

        const attackBtn = document.createElement('button');
        attackBtn.className = 'action-btn';
        attackBtn.id = 'btn-attack-unit';
        attackBtn.textContent = 'Attack';
        attackBtn.onclick = withClickSound(() => this.attackWithSelectedUnit());
        container.appendChild(attackBtn);

        const fortBtn = document.createElement('button');
        fortBtn.className = 'action-btn';
        fortBtn.id = 'btn-fortify-unit';
        fortBtn.textContent = 'Fortify';
        fortBtn.onclick = withClickSound(() => this.fortifySelectedUnit());
        container.appendChild(fortBtn);

        // Engineer special actions
        if (unit.typeId === 'civil_engineers') {
            const buildRoadBtn = document.createElement('button');
            buildRoadBtn.className = 'action-btn';
            buildRoadBtn.textContent = 'Build Road';
            buildRoadBtn.onclick = withClickSound(() => {
                const result = gameState.applyUnitBuildAction(unit, 'build_road');
                if (result.success) {
                    this.showNotification('Road construction started', 'success');
                    this.updateHUD();
                } else {
                    this.showNotification(result.message, 'error');
                }
            });
            container.appendChild(buildRoadBtn);
        }

        if (unit.typeId === 'civil_engineers' || unit.typeId === 'explorer' || unit.typeId === 'merchant_ship') {
            const automateBtn = document.createElement('button');
            automateBtn.className = `action-btn ${unit.automated ? 'active' : ''}`;
            const autoLabel = (unit.typeId === 'explorer' || unit.typeId === 'merchant_ship') ? 'Auto Explore' : 'Automated';
            automateBtn.textContent = unit.automated ? `${autoLabel}: ON` : autoLabel;
            automateBtn.onclick = withClickSound(() => {
                unit.automated = !unit.automated;
                automateBtn.textContent = unit.automated ? `${autoLabel}: ON` : autoLabel;
                automateBtn.classList.toggle('active', unit.automated);
                if (unit.typeId === 'explorer' || unit.typeId === 'merchant_ship') {
                    this.showNotification(unit.automated ? `${unit.name} auto-explore enabled` : `${unit.name} auto-explore disabled`, 'info');
                } else {
                    this.showNotification(unit.automated ? 'Engineer automation enabled' : 'Engineer automation disabled', 'info');
                }
            });
            container.appendChild(automateBtn);
        }

        // Transport unit actions
        if (unit.bonuses?.transportCapacity && unit.carryingUnits && unit.carryingUnits.length > 0) {
            const unloadBtn = document.createElement('button');
            unloadBtn.className = 'action-btn';
            unloadBtn.textContent = `Unload (${unit.carryingUnits.length})`;
            unloadBtn.onclick = withClickSound(() => {
                const result = gameState.unloadUnits(unit.id);
                if (result.success) {
                    this.updateUnitActionButtons(unit);
                } else {
                    this.showNotification(result.message, 'error');
                }
            });
            container.appendChild(unloadBtn);
        }

        // Destination cancel button
        if (unit.destination) {
            const cancelDestBtn = document.createElement('button');
            cancelDestBtn.className = 'action-btn danger';
            cancelDestBtn.textContent = 'Cancel Route';
            cancelDestBtn.onclick = withClickSound(() => {
                unit.destination = null;
                this.showNotification('Route cancelled', 'info');
                this.updateUnitActionButtons(unit);
            });
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
     * Show concise combat result with clear winner/loser and post-battle HP.
     */
    showCombatResult(result) {
        const resolveCombatant = (side) => {
            const payload = result?.[side] || {};
            const live = gameState.units.find((u) => u.id === payload.id);
            const maxHealth = Math.max(
                1,
                Number(live?.stats?.health ?? payload.maxHealth ?? 1)
            );
            const healthValue = Number.isFinite(live?.currentHealth)
                ? live.currentHealth
                : (Number.isFinite(payload.health) ? payload.health : 0);
            return {
                id: payload.id || live?.id || null,
                name: live?.name || payload.name || (side === 'attacker' ? 'Attacker' : 'Defender'),
                owner: live?.owner || payload.owner || null,
                position: live?.position || null,
                health: Math.max(0, Math.floor(healthValue)),
                maxHealth
            };
        };

        const attacker = resolveCombatant('attacker');
        const defender = resolveCombatant('defender');
        if (gameMap) {
            gameMap.focusOnBattleUnits(attacker, defender);
            const highlighted = [];
            if (attacker?.id && attacker.health < attacker.maxHealth) highlighted.push(attacker.id);
            if (defender?.id && defender.health < defender.maxHealth) highlighted.push(defender.id);
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

        const playerSide = attacker.owner === 'player'
            ? 'attacker'
            : (defender.owner === 'player' ? 'defender' : null);
        const ourUnit = playerSide === 'attacker' ? attacker : (playerSide === 'defender' ? defender : null);
        const enemyUnit = playerSide === 'attacker' ? defender : (playerSide === 'defender' ? attacker : null);

        let outcome = 'Engagement';
        let level = 'info';
        if (result.attackerDied && result.defenderDied) {
            outcome = 'Mutual Losses';
            level = 'error';
        } else if (playerSide === 'attacker' || playerSide === 'defender') {
            const ourLost = playerSide === 'attacker' ? Boolean(result.attackerDied) : Boolean(result.defenderDied);
            const enemyLost = playerSide === 'attacker' ? Boolean(result.defenderDied) : Boolean(result.attackerDied);
            if (enemyLost && !ourLost) {
                outcome = 'Victory';
                level = 'success';
            } else if (ourLost && !enemyLost) {
                outcome = 'Defeat';
                level = 'error';
            } else {
                outcome = 'Stalemate';
                level = 'info';
            }
        } else if (result.defenderDied && !result.attackerDied) {
            outcome = `${attacker.name} won`;
        } else if (result.attackerDied && !result.defenderDied) {
            outcome = `${defender.name} won`;
        }

        const baseMessage = ourUnit && enemyUnit
            ? `${outcome}${locationText}: Our ${ourUnit.name} ${ourUnit.health}/${ourUnit.maxHealth} HP vs ${enemyUnit.name} ${enemyUnit.health}/${enemyUnit.maxHealth} HP`
            : `${outcome}${locationText}: ${attacker.name} ${attacker.health}/${attacker.maxHealth} HP vs ${defender.name} ${defender.health}/${defender.maxHealth} HP`;
        const tacticalSummary = result?.summary ? ` | ${result.summary}` : '';
        const combatLogTail = Array.isArray(result?.combatLog) && result.combatLog.length > 0
            ? ` | ${result.combatLog[result.combatLog.length - 1]}`
            : '';
        const message = `${baseMessage}${tacticalSummary}${combatLogTail}`;
        this.showNotification(message, level);

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
		<p style="margin-bottom:1rem;">
		    Game developed by <a href="https://www.linkedin.com/in/nikolareljin" target="_blank" rel="noopener noreferrer">Nikola Reljin</a>. Please check my other  <a href="https://github.com/nikolareljin?tab=repositories" target="_blank" rel="noopener noreferrer">Github repositories</a>.
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
            const playerCities = gameMap?.getCityTiles('player') || [];
            const playerFaction = gameState?.player?.faction || gameState?.selectedFaction || this.selectedFaction || 'byzantine';
            const preferredStartTownId = gameState?.getLeaderStartProfile?.(playerFaction)?.startTownId;
            const focusCity = playerCities.find(tile => tile.cityData?.capitalRole === 'primary')
                || playerCities.find(tile => tile.cityData?.id === preferredStartTownId)
                || playerCities.find(tile => tile.cityData?.kind === 'capital')
                || playerCities[0];
            if (focusCity) {
                gameMap?.centerOn(focusCity.x, focusCity.y);
            } else {
                const playerUnits = (gameState?.units || []).filter(u =>
                    u.owner === 'player' &&
                    Number.isFinite(u.position?.x) &&
                    Number.isFinite(u.position?.y) &&
                    u.position.x >= 0 &&
                    u.position.y >= 0
                );
                if (playerUnits.length > 0) {
                    const avgX = playerUnits.reduce((sum, u) => sum + u.position.x, 0) / playerUnits.length;
                    const avgY = playerUnits.reduce((sum, u) => sum + u.position.y, 0) / playerUnits.length;
                    gameMap?.centerOn(avgX, avgY);
                } else {
                    gameMap?.requestRender();
                }
            }
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
        const panel = document.getElementById('unit-panel');
        panel?.classList.remove('active', 'enemy-panel');
        gameState.selectedUnit = null;
        if (gameMap) gameMap.awaitingMoveOrder = false;
        gameMap?.requestRender();
    }

    hideUnitPanelForMapTargeting() {
        if (!window.matchMedia('(max-width: 768px)').matches) return;
        const panel = document.getElementById('unit-panel');
        if (!panel?.classList.contains('active')) return;
        panel.classList.remove('active');
        gameMap?.requestRender();
    }
}

// Global UI manager instance
const uiManager = new UIManager();
window.uiManager = uiManager;
