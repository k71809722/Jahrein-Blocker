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
