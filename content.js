// Basic Content Script to block keywords
let blockedKeywords = [];
let isEnabled = true;
let blockMode = 'hide'; // 'hide' or 'blur'

// Initialize
chrome.storage.local.get(['enabled', 'keywords', 'blockedUrls', 'blockMode'], (result) => {
    isEnabled = result.enabled !== undefined ? result.enabled : true;
    blockMode = result.blockMode || 'hide';

    // Default Keyword List
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

    // Default URL List
    const defaultUrls = [
        'twitter.com/jahreindota',
        'kick.com/jahrein',
        'https://www.youtube.com/@jahreinboss',
        'instagram.com/jahrein'
    ];

    blockedKeywords = result.keywords || defaultKeywords;
    const blockedUrls = result.blockedUrls || defaultUrls;

    if (isEnabled) {
        injectStyles();

        // Check URL Blocking first
        const currentUrl = window.location.href.toLowerCase();

        if (blockedUrls.some(u => currentUrl.includes(u.toLowerCase()))) {
            window.stop();
            const mediaElements = document.querySelectorAll('video, audio');
            mediaElements.forEach(el => {
                el.muted = true;
                el.pause();
                el.src = '';
                el.remove();
            });

            // Modern Block Page Design
            // Modern Block Page Design
            document.documentElement.innerHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Erişim Engellendi</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            height: 100vh;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            background: radial-gradient(circle at center, #1a1a1a 0%, #000000 100%);
                            color: #fff;
                            font-family: 'Segoe UI', system-ui, sans-serif;
                            overflow: hidden;
                        }
                        .container {
                            text-align: center;
                            padding: 40px;
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 20px;
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            backdrop-filter: blur(10px);
                            box-shadow: 0 0 50px rgba(255, 71, 87, 0.1);
                            max-width: 500px;
                            animation: fadeIn 0.8s ease-out;
                        }
                        .icon {
                            font-size: 80px;
                            margin-bottom: 20px;
                            animation: bounce 2s infinite;
                        }
                        h1 {
                            font-size: 32px;
                            margin: 0 0 10px 0;
                            background: linear-gradient(45deg, #ff6b6b, #ff4757);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        }
                        p {
                            color: #aaa;
                            font-size: 16px;
                            line-height: 1.5;
                            margin-bottom: 30px;
                        }
                        .btn {
                            background: #fff;
                            color: #000;
                            border: none;
                            padding: 12px 30px;
                            border-radius: 50px;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                            transition: transform 0.2s, box-shadow 0.2s;
                            text-decoration: none;
                            display: inline-block;
                        }
                        .btn:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 5px 15px rgba(255,255,255,0.2);
                        }
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes bounce {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-10px); }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="icon">🛡️</div>
                        <h1>Erişim Engellendi</h1>
                        <p>Bu web sitesine erişim, <strong>Jahrein Engelleyici</strong> filtreleriniz nedeniyle kısıtlanmıştır.</p>
                        <button id="jahrein-back-btn" class="btn">Geri Dön</button>
                    </div>
                </body>
                </html>
            `;

            // Attach listener programmatically to bypass CSP
            const backBtn = document.getElementById('jahrein-back-btn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        window.close(); // Try closing if it's a new tab
                    }
                });
            }

            throw new Error("Jahrein Blocked");
        }

        runBlocker();
        startObserver();
    }
});

// Listen for changes in settings
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (changes.enabled) isEnabled = changes.enabled.newValue;
        if (changes.keywords) blockedKeywords = changes.keywords.newValue;
        if (changes.blockMode) {
            blockMode = changes.blockMode.newValue;
            runBlocker();
        }

        if (isEnabled) {
            runBlocker();
        }
    }
});

function injectStyles() {
    if (document.getElementById('jahrein-blocker-style')) return;
    const style = document.createElement('style');
    style.id = 'jahrein-blocker-style';
    style.textContent = `
        .jahrein-blurred {
            position: relative !important;
        }
        
        .jahrein-blurred::after {
            content: "🔒 Engellendi (Tıkla)";
            position: absolute;
            inset: 0;
            z-index: 99999;
            
            /* Glass Effect */
            background: rgba(20, 20, 20, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            
            display: flex;
            justify-content: center;
            align-items: center;
            
            font-size: 14px;
            font-weight: bold;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: #fff;
            
            cursor: pointer;
            border-radius: inherit;
            transition: all 0.2s ease;
        }

        .jahrein-blurred:hover::after {
             background: rgba(20, 20, 20, 0.6);
             content: "🔓 Tıkla ve Aç";
        }
    `;
    document.head.appendChild(style);
}

function startObserver() {
    const observer = new MutationObserver((mutations) => {
        if (!isEnabled) return;
        mutations.forEach((mutation) => {
            // Check newly added nodes
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    scanAndBlock(node);
                }
            });
            // Also check if attributes changed on existing nodes (re-hydration)
            if (mutation.type === 'attributes' && mutation.target.nodeType === 1) {
                const target = mutation.target;
                if (target.getAttribute('data-blocked-reason') === 'jahrein-blocker' && !target.classList.contains('jahrein-blurred')) {
                    if (blockMode === 'blur') target.classList.add('jahrein-blurred');
                }
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
}

function runBlocker() {
    scanAndBlock(document.body);
}

function scanAndBlock(rootNode) {
    if (!rootNode) return;

    // Scan Text
    const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
        const text = node.nodeValue.toLowerCase();
        if (blockedKeywords.some(keyword => text.includes(keyword.toLowerCase()))) {
            hideElement(node);
        }
    }

    // Scan Links & Images & Attributes (Expanded)
    const elements = rootNode.querySelectorAll ? rootNode.querySelectorAll('a, img, [title], [aria-label]') : [];
    elements.forEach(el => {
        let contentToCheck = '';
        if (el.tagName === 'A') contentToCheck = el.href;
        if (el.tagName === 'IMG') contentToCheck = el.alt;
        if (el.title) contentToCheck += ' ' + el.title;
        if (el.getAttribute('aria-label')) contentToCheck += ' ' + el.getAttribute('aria-label');

        if (contentToCheck && blockedKeywords.some(keyword => contentToCheck.toLowerCase().includes(keyword.toLowerCase()))) {
            hideElement(el);
        }
    });
}

function hideElement(element) {
    let target = element.nodeType === 3 ? element.parentElement : element;

    // TARGETS: We WANT to stop here and block this.
    const validContainers = [
        'ytd-video-renderer', 'ytd-rich-item-renderer', 'ytd-channel-renderer',
        'ytd-grid-video-renderer', 'ytd-compact-video-renderer',
        'ytd-playlist-panel-video-renderer', 'ytd-reel-item-renderer',
        'ytd-topbar-logo-renderer', // Block logo if keyword specific (unlikely but safe)
        'article',
        '[data-testid="tweet"]', '[data-testid="cellInnerDiv"]'
    ];

    // BARRIERS: If we hit these, we went too far. STOP and use the last safe element.
    const layoutBarriers = [
        'ytd-rich-grid-row', 'ytd-rich-grid-renderer', 'div#contents', 'ytd-item-section-renderer',
        'main', 'section', 'div.feed', 'div.timeline', 'ytd-browse'
    ];

    let bestContainer = null;
    let current = target;
    let depth = 0;

    while (current && current !== document.body && depth < 14) {
        const tagName = current.tagName.toLowerCase();
        let isBarrier = false;

        // Check Barriers
        if (layoutBarriers.includes(tagName) || (current.id === 'contents')) {
            isBarrier = true;
        }

        // Exact Match Checks (YouTube)
        if (tagName.startsWith('ytd-')) {
            if (validContainers.includes(tagName)) {
                bestContainer = current;
                break; // Found perfect match
            }
            if (tagName === 'ytd-rich-grid-row') {
                isBarrier = true; // Typical layout containers
            }
        }

        // Twitter/Generic Checks
        if (current.getAttribute) {
            const testId = current.getAttribute('data-testid');
            if (testId === 'tweet' || testId === 'cellInnerDiv') {
                bestContainer = current;
                break; // Found perfect match
            }
        }

        if (current.className && typeof current.className === 'string') {
            const cls = current.className.toLowerCase();
            if (cls.includes('card') || cls.includes('post') || cls.includes('tweet') && !cls.includes('wrapper')) {
                // Potential container, but keep looking for a stronger match unless we hit barrier
                if (!bestContainer) bestContainer = current;
            }
        }

        if (isBarrier) {
            break;
        }

        current = current.parentElement;
        depth++;
    }

    if (!bestContainer) bestContainer = target;

    // Final Safety Checks
    if (bestContainer.tagName === 'BODY' || bestContainer.tagName === 'HTML' || bestContainer.id === 'contents') return;

    // Block logic
    const blockedStatus = bestContainer.getAttribute('data-blocked-reason');
    const alreadyBlocked = blockedStatus === 'jahrein-blocker';
    const isRevealed = blockedStatus === 'revealed';

    if (!alreadyBlocked && !isRevealed) {
        bestContainer.setAttribute('data-blocked-reason', 'jahrein-blocker');

        try { chrome.runtime.sendMessage({ action: "updateCounter", count: 1 }); } catch (e) { }

        if (blockMode === 'blur') {
            bestContainer.style.position = 'relative';
            bestContainer.classList.add('jahrein-blurred');
            bestContainer.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (confirm("Görüntülemek istiyor musunuz?")) {
                    this.classList.remove('jahrein-blurred');
                    this.setAttribute('data-blocked-reason', 'revealed');
                    this.onclick = null;
                }
            };
        } else if (blockMode === 'ghost') {
            // Ghost Mode: Remove completely and clean up parents
            const parent = bestContainer.parentElement;

            // Check if removing this element might break the layout (especially valid for Twitter)
            // If the element is a direct child of a critical container, we might want to just hide it instead of removing
            const isCriticalContainer = parent && (
                parent.getAttribute('data-testid') === 'cellInnerDiv' ||
                parent.classList.contains('ytd-rich-grid-row')
            );

            if (isCriticalContainer) {
                bestContainer.style.display = 'none'; // Fallback to safe hide for critical containers
            } else {
                bestContainer.remove();

                // Clean up empty parents SAFELY
                // Don't delete if parent is a major layout element
                let currentParent = parent;
                for (let i = 0; i < 3; i++) {
                    if (currentParent &&
                        currentParent.children.length === 0 &&
                        currentParent.textContent.trim() === '' &&
                        currentParent.tagName !== 'BODY' &&
                        currentParent.tagName !== 'MAIN' &&
                        currentParent.tagName !== 'SECTION' &&
                        currentParent.id !== 'contents' &&
                        !currentParent.getAttribute('data-testid')
                    ) {
                        const grandParent = currentParent.parentElement;
                        currentParent.remove();
                        currentParent = grandParent;
                    } else {
                        break;
                    }
                }
            }
        } else {
            // Hide Mode (Default)
            bestContainer.style.display = 'none';
        }
    }
}
