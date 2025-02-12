let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (window.location.pathname.includes('/watch')) {
      setupLiveBadgeObserver();
      checkLiveStatus();
    } else {
      closeChatOverlay();
    }
  }
}).observe(document, { subtree: true, childList: true });

document.addEventListener('DOMContentLoaded', async () => {
  await waitForVideoPlayer();
  if (window.location.pathname.includes('/watch')) {
    setupLiveBadgeObserver();
    checkLiveStatus();
  }
});

document.addEventListener('fullscreenchange', () => {
  setTimeout(() => {
    checkLiveStatus();
  }, 300);
});

browser.storage.onChanged.addListener((changes) => {
  if (changes.chatSettings) {
    settings = { ...settings, ...changes.chatSettings.newValue };
    if (chatOverlay) {
      chatOverlay.style.width = settings.width;
      chatOverlay.style.height = settings.height;
      chatOverlay.style.left = settings.left === 'auto'
        ? (window.innerWidth - parseInt(settings.width)) + 'px'
        : settings.left;
      chatOverlay.style.top = settings.top;
      chatOverlay.style.opacity = settings.opacity;
      adjustVideoPlayer();
    }
  }
});
