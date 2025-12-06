document.getElementById('finishBtn').addEventListener('click', () => {
    // Attempt to close the tab
    window.close();
    // If window.close() is blocked (which it often is for non-script-opened tabs), we can redirect to a "Done" state or just show a message.
    document.body.innerHTML = `
        <div style="height:100vh;display:flex;justify-content:center;align-items:center;background:#121212;color:#fff;font-family:sans-serif;text-align:center;">
            <div>
                <h1 style="color:#4cc9f0">Her şey hazır! 🛡️</h1>
                <p>Bu sekmeyi kapatabilirsiniz.</p>
            </div>
        </div>
    `;
});
