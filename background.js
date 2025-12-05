// Background Script for Jahrein Blocker

// 1. Context Menu Handling
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "block-selected-text",
        title: "Bu Kelimeyi Engelle: \"%s\"",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "block-link",
        title: "Bu Linki Engelle",
        contexts: ["link"]
    });

    // Initialize stats if not present
    chrome.storage.local.get(['totalBlocked', 'dailyBlocked', 'lastResetDate'], (res) => {
        const today = new Date().toDateString();
        if (!res.totalBlocked) chrome.storage.local.set({ totalBlocked: 0 });
        if (!res.dailyBlocked || res.lastResetDate !== today) {
            chrome.storage.local.set({ dailyBlocked: 0, lastResetDate: today });
        }
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "block-selected-text" && info.selectionText) {
        addKeyword(info.selectionText.trim().toLowerCase());
    }
    if (info.menuItemId === "block-link" && info.linkUrl) {
        let cleanUrl = info.linkUrl.replace(/(^\w+:|^)\/\//, '');
        addUrl(cleanUrl);
    }
});

function addKeyword(keyword) {
    chrome.storage.local.get(['keywords'], (result) => {
        const keywords = result.keywords || [];
        if (!keywords.includes(keyword)) {
            keywords.push(keyword);
            chrome.storage.local.set({ keywords: keywords });
        }
    });
}

function addUrl(url) {
    chrome.storage.local.get(['blockedUrls'], (result) => {
        const blockedUrls = result.blockedUrls || [];
        if (!blockedUrls.includes(url)) {
            blockedUrls.push(url);
            chrome.storage.local.set({ blockedUrls: blockedUrls });
        }
    });
}

// 2. Counter & Stats Handling
let totalBlocked = 0;
let dailyBlocked = 0;

function updateBadge() {
    chrome.action.setBadgeText({ text: totalBlocked.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#e63946' });
}

// Sync from storage
chrome.storage.local.get(['totalBlocked', 'dailyBlocked', 'lastResetDate'], (result) => {
    totalBlocked = result.totalBlocked || 0;

    // Check for daily reset
    const today = new Date().toDateString();
    if (result.lastResetDate !== today) {
        dailyBlocked = 0;
        chrome.storage.local.set({ dailyBlocked: 0, lastResetDate: today });
    } else {
        dailyBlocked = result.dailyBlocked || 0;
    }

    updateBadge();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateCounter") {
        const count = request.count || 1;
        totalBlocked += count;
        dailyBlocked += count;

        chrome.storage.local.set({
            totalBlocked: totalBlocked,
            dailyBlocked: dailyBlocked
        });

        updateBadge();
    }
});
