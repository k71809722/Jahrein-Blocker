document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('toggleExtension');
    const statusText = document.getElementById('statusText');
    const newKeywordInput = document.getElementById('newKeyword');
    const addBtn = document.getElementById('addBtn');
    const keywordList = document.getElementById('keywordList');

    const newUrlInput = document.getElementById('newUrl');
    const addUrlBtn = document.getElementById('addUrlBtn');
    const urlList = document.getElementById('urlList');

    // Default data - BURADAN EKLEME YAPABİLİRSİNİZ
    const defaultKeywords = [
        'jahrein',
        'ahmet sonuç',
        'jahreo',
        'jahrein yayın'
    ];
    const defaultUrls = [
        'twitter.com/jahreindota',
        'kick.com/jahrein',
        'youtube.com/jahrein',
        'instagram.com/jahrein'
    ];

    // Load settings
    chrome.storage.local.get(['enabled', 'keywords', 'blockedUrls'], (result) => {
        const enabled = result.enabled !== undefined ? result.enabled : true;
        const keywords = result.keywords || defaultKeywords;
        const blockedUrls = result.blockedUrls || defaultUrls;

        toggle.checked = enabled;
        updateStatusText(enabled);
        renderList(keywords, keywordList, 'keywords');
        renderList(blockedUrls, urlList, 'blockedUrls');

        // Initialize if empty
        if (!result.keywords) {
            chrome.storage.local.set({ keywords: defaultKeywords, enabled: true });
        }
    });

    // Toggle Event
    toggle.addEventListener('change', () => {
        const isEnabled = toggle.checked;
        chrome.storage.local.set({ enabled: isEnabled });
        updateStatusText(isEnabled);
    });

    // Add Keyword
    addBtn.addEventListener('click', () => addItem('keywords', newKeywordInput, keywordList));
    newKeywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem('keywords', newKeywordInput, keywordList);
    });

    // Add URL
    addUrlBtn.addEventListener('click', () => addItem('blockedUrls', newUrlInput, urlList));
    newUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem('blockedUrls', newUrlInput, urlList);
    });

    function updateStatusText(enabled) {
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
