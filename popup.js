document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('toggleExtension');
    const statusText = document.getElementById('statusText');
    const versionText = document.getElementById('versionText');
    const modeRadios = document.getElementsByName('blockMode');

    // Stats
    const dailyCountLabel = document.getElementById('dailyCount');
    const totalCountLabel = document.getElementById('totalCount');

    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Inputs
    const newKeywordInput = document.getElementById('newKeyword');
    const addBtn = document.getElementById('addBtn');
    const keywordList = document.getElementById('keywordList');

    const newUrlInput = document.getElementById('newUrl');
    const addUrlBtn = document.getElementById('addUrlBtn');
    const urlList = document.getElementById('urlList');

    // Set Version
    const manifest = chrome.runtime.getManifest();
    if (versionText) versionText.textContent = `v${manifest.version}`;

    // Default data
    const defaultKeywords = [
        'jahrein',
        'ahmet sonuç',
        'jahreo',
        'jahrein yayın',
        'cago',
        'jaho',
        'jahrei̇n',
        'jahreinin',
        'jahreinden',
        'cagolar',
        'jahreinler',
        'ahmet sonuc',
        'jahreindota'
    ];

    const defaultUrls = [
        'twitter.com/jahreindota',
        'kick.com/jahrein',
        'https://www.youtube.com/@jahreinboss',
        'instagram.com/jahrein',
    ];

    // Load settings
    chrome.storage.local.get(['enabled', 'keywords', 'blockedUrls', 'blockMode', 'totalBlocked', 'dailyBlocked'], (result) => {
        const enabled = result.enabled !== undefined ? result.enabled : true;
        const keywords = result.keywords || defaultKeywords;
        const blockedUrls = result.blockedUrls || defaultUrls;
        const blockMode = result.blockMode || 'hide';
        const totalBlocked = result.totalBlocked || 0;
        const dailyBlocked = result.dailyBlocked || 0;

        // Initialize UI
        if (toggle) toggle.checked = enabled;
        updateStatusText(enabled);

        if (dailyCountLabel) dailyCountLabel.textContent = dailyBlocked;
        if (totalCountLabel) totalCountLabel.textContent = totalBlocked;

        // Update Gamification UI
        updateStatsUI(totalBlocked);

        // Set Radio
        for (const radio of modeRadios) {
            if (radio.value === blockMode) radio.checked = true;
        }

        renderList(keywords, keywordList, 'keywords');
        renderList(blockedUrls, urlList, 'blockedUrls');

        // Initialize storage if empty
        if (!result.keywords) {
            chrome.storage.local.set({
                keywords: defaultKeywords,
                blockedUrls: defaultUrls,
                enabled: true,
                blockMode: 'hide',
                totalBlocked: 0,
                dailyBlocked: 0
            });
        }
    });

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Toggle Event
    if (toggle) {
        toggle.addEventListener('change', () => {
            const isEnabled = toggle.checked;
            chrome.storage.local.set({ enabled: isEnabled });
            updateStatusText(isEnabled);
        });
    }

    // Mode Change Event
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                chrome.storage.local.set({ blockMode: e.target.value });
            }
        });
    });

    // Add Keyword
    if (addBtn) {
        addBtn.addEventListener('click', () => addItem('keywords', newKeywordInput, keywordList));
    }
    if (newKeywordInput) {
        newKeywordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addItem('keywords', newKeywordInput, keywordList);
        });
    }

    // Add URL
    if (addUrlBtn) {
        addUrlBtn.addEventListener('click', () => addItem('blockedUrls', newUrlInput, urlList));
    }
    if (newUrlInput) {
        newUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addItem('blockedUrls', newUrlInput, urlList);
        });
    }

    function updateStatusText(enabled) {
        if (!statusText) return;
        statusText.textContent = enabled ? 'Aktif' : 'Devre Dışı';
        statusText.style.color = enabled ? '#4cc9f0' : '#888';
    }

    // --- Gamification Logic ---
    function calculateLevel(totalBlocked) {
        // Level formula: level = floor(sqrt(totalBlocked / 10)) + 1
        const level = Math.floor(Math.sqrt(totalBlocked / 5)) + 1;
        const currentLevelXp = (level - 1) * (level - 1) * 5;
        const nextLevelXp = level * level * 5;
        const progress = totalBlocked - currentLevelXp;
        const needed = nextLevelXp - currentLevelXp;

        return {
            level: level,
            progress: progress,
            needed: needed,
            percent: Math.min((progress / needed) * 100, 100)
        };
    }

    const badges = [
        { id: 'first_blood', name: 'İlk Kan', icon: '🩸', threshold: 1 },
        { id: 'novice', name: 'Çaylak', icon: '🛡️', threshold: 50 },
        { id: 'guardian', name: 'Muhafız', icon: '⚔️', threshold: 250 },
        { id: 'master', name: 'Usta', icon: '🧿', threshold: 1000 },
        { id: 'legend', name: 'Efsane', icon: '👑', threshold: 5000 },
        { id: 'zen', name: 'Zen', icon: '🧘', threshold: 10000 },
        { id: 'immortal', name: 'Ölümsüz', icon: '☠️', threshold: 50000 },
        { id: 'the_one', name: 'Seçilmiş', icon: '🌌', threshold: 100000 }
    ];

    function updateStatsUI(totalBlocked) {
        // Level & XP
        const stats = calculateLevel(totalBlocked);
        const levelTitle = document.getElementById('levelTitle');
        const levelProgressText = document.getElementById('levelProgressText');
        const xpFill = document.getElementById('xpFill');

        if (levelTitle) levelTitle.textContent = `Seviye ${stats.level}: ${getLevelName(stats.level)}`;
        if (levelProgressText) levelProgressText.textContent = `${stats.progress}/${stats.needed} XP`;
        if (xpFill) xpFill.style.width = `${stats.percent}%`;

        // Badges
        const badgeGrid = document.getElementById('badgeGrid');
        if (badgeGrid) {
            badgeGrid.innerHTML = '';
            badges.forEach(badge => {
                const isUnlocked = totalBlocked >= badge.threshold;
                const div = document.createElement('div');
                div.className = `badge ${isUnlocked ? 'unlocked' : ''}`;
                div.title = isUnlocked ? `Kazanıldı: ${badge.threshold} Engelleme` : `Hedef: ${badge.threshold} Engelleme`;
                div.innerHTML = `
                    <span class="badge-icon">${badge.icon}</span>
                    <span class="badge-name">${badge.name}</span>
                `;
                badgeGrid.appendChild(div);
            });
        }
    }

    function getLevelName(level) {
        if (level < 5) return "Çaylak";
        if (level < 10) return "Koruyucu";
        if (level < 20) return "Şövalye";
        if (level < 40) return "Komutan";
        if (level < 60) return "General";
        if (level < 80) return "Lord";
        return "İlah";
    }

    // Call this inside the chrome.storage.local.get callback
    // We'll hook this up by modifying the main init function below


    function addItem(storageKey, inputElement, listElement) {
        const value = inputElement.value.trim().toLowerCase();
        if (value) {
            chrome.storage.local.get([storageKey], (result) => {
                const items = result[storageKey] || [];
                if (!items.includes(value)) {
                    items.push(value);
                    chrome.storage.local.set({ [storageKey]: items }, () => {
                        renderList(items, listElement, storageKey);
                        inputElement.value = '';
                    });
                }
            });
        }
    }

    function removeItem(itemToRemove, storageKey, listElement) {
        chrome.storage.local.get([storageKey], (result) => {
            const items = result[storageKey] || [];
            const newItems = items.filter(k => k !== itemToRemove);
            chrome.storage.local.set({ [storageKey]: newItems }, () => {
                renderList(newItems, listElement, storageKey);
            });
        });
    }

    function renderList(items, listElement, storageKey) {
        if (!listElement) return;
        listElement.innerHTML = '';
        if (!items) return;

        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => removeItem(item, storageKey, listElement);

            li.appendChild(deleteBtn);
            listElement.appendChild(li);
        });
    }
});
