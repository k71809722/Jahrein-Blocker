// Basic Content Script to block keywords
let blockedKeywords = [];
let isEnabled = true;

// Initialize
chrome.storage.local.get(['enabled', 'keywords', 'blockedUrls'], (result) => {
    isEnabled = result.enabled !== undefined ? result.enabled : true;

    // Default Keyword List
    const defaultKeywords = [
        'jahrein',
        'ahmet sonuç',
        'jahreo',
        'jahrein yayın'
    ];

    // Default URL List
    const defaultUrls = [
        'twitter.com/jahreindota',
        'kick.com/jahrein',
        'youtube.com/jahrein',
        'instagram.com/jahrein'
    ];

    blockedKeywords = result.keywords || defaultKeywords;
    const blockedUrls = result.blockedUrls || defaultUrls;

    if (isEnabled) {
        // Check URL Blocking first
        const currentUrl = window.location.href.toLowerCase();
        // Remove protocol for simple check (e.g. https://twitter.com -> twitter.com)
        // Check if any blocked fragment is in the URL
        if (blockedUrls.some(u => currentUrl.includes(u.toLowerCase()))) {
            document.documentElement.innerHTML = `
                <div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#1a1a1a;color:#ff6b6b;font-family:sans-serif;flex-direction:column;">
                    <h1>🛑 ERİŞİM ENGELLENDİ</h1>
                    <p>Bu site Jahrein Engelleyici tarafından engellendi.</p>
                </div>
            `;
            // Stop execution
            return;
        }

        runBlocker();
        // Start observing for dynamic content (like infinite scrolls)
        startObserver();
    }
});

// Listen for changes in settings
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (changes.enabled) {
            isEnabled = changes.enabled.newValue;
        }
        if (changes.keywords) {
            blockedKeywords = changes.keywords.newValue;
        }

        if (isEnabled) {
            runBlocker();
        }
    }
});

function startObserver() {
    const observer = new MutationObserver((mutations) => {
        if (!isEnabled) return;

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element
                    scanAndBlock(node);
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function runBlocker() {
    scanAndBlock(document.body);
}

function scanAndBlock(rootNode) {
    if (!rootNode) return;

    // 1. Text Node check
    const walker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    while (node = walker.nextNode()) {
        const text = node.nodeValue.toLowerCase();
        const matched = blockedKeywords.some(keyword => text.includes(keyword.toLowerCase()));
        if (matched) {
            hideElement(node);
        }
    }

    // 2. Link/Image check (Check hrefs and alt texts)
    const elements = rootNode.querySelectorAll ? rootNode.querySelectorAll('a, img') : [];
    elements.forEach(el => {
        let contentToCheck = '';
        if (el.tagName === 'A') contentToCheck = el.href;
        if (el.tagName === 'IMG') contentToCheck = el.alt;

        if (contentToCheck) {
            const matched = blockedKeywords.some(keyword => contentToCheck.toLowerCase().includes(keyword.toLowerCase()));
            if (matched) {
                hideElement(el);
            }
        }
    });
}

function hideElement(element) {
    // Determine the target element to start traversing from
    let target = element.nodeType === 3 ? element.parentElement : element;

    // List of selectors for common content containers
    const stopSelectors = [
        'article', // Generic article
        'ytd-video-renderer',
        'ytd-rich-item-renderer',
        'ytd-channel-renderer',
        'ytd-grid-video-renderer',
        'ytd-compact-video-renderer',
        '.tweet',
        '.post',
        '.video-card',
        '.stream-card',
        '.channel-card'
    ];

    // Safety: Do not hide these if selected as container
    const unsafeSelectors = [
        'body', 'html', 'main', 'section', 'header', 'footer',
        'div[class*="grid"]', 'div[class*="list"]', 'div[class*="feed"]', 'div[class*="layout"]',
        'ul', 'ol', 'div[id*="container"]'
    ];

    let bestContainer = null;
    let current = target;
    let depth = 0;

    // Remember the last safe element to fall back to if we hit an unsafe one
    let lastSafeElement = target;

    while (current && current !== document.body && depth < 8) {
        const tagName = current.tagName.toLowerCase();

        // Check safety
        // If the current element looks like a layout wrapper, STOP and use the child.
        if (current.className && typeof current.className === 'string') {
            const cls = current.className.toLowerCase();
            if (cls.includes('grid') || cls.includes('row') || (cls.includes('list') && !cls.includes('list-item')) || cls.includes('wrapper') || cls.includes('feed')) {
                bestContainer = lastSafeElement;
                break;
            }
        }
        if (tagName === 'ul' || tagName === 'ol' || tagName === 'section' || tagName === 'main') {
            bestContainer = lastSafeElement;
            break;
        }

        // Check if we found a known card
        if (stopSelectors.includes(tagName) || tagName.startsWith('ytd-')) {
            bestContainer = current;
            break;
        }
        // Check class for card-like names
        if (current.className && typeof current.className === 'string') {
            const cls = current.className.toLowerCase();
            if (cls.includes('card') || cls.includes('post') || cls.includes('tweet') || cls.includes('item') || cls.includes('entry')) {
                bestContainer = current;
                break;
            }
        }

        lastSafeElement = current;
        current = current.parentElement;
        depth++;
    }

    // Fallback if loop finished without decision
    if (!bestContainer) {
        bestContainer = lastSafeElement;
    }

    // Final Safety Check
    if (bestContainer) {
        // If bestContainer is huge or root-like, ignore
        if (bestContainer.tagName === 'BODY' || bestContainer.tagName === 'HTML' || bestContainer.tagName === 'MAIN') {
            bestContainer = null;
        }
    }

    if (bestContainer && bestContainer.style.display !== 'none') {
        bestContainer.style.display = 'none';
        bestContainer.setAttribute('data-blocked-reason', 'jahrein-blocker');
    }
}
