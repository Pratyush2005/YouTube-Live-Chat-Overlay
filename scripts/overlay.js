let chatOverlay = null;
let isFullscreen = false;
let isDragging = false;
let isResizing = false;
let dragStartX = 0;
let dragStartY = 0;
let initialWidth = 0;
let initialHeight = 0;
let initialLeft = 0;
let initialTop = 0;
let resizeDirection = null;
let currentVideoId = null;
let settings = {
  opacity: 0.9,
  width: '300px',
  height: '70vh',
  left: 'auto',
  top: '0px'
};
let liveBadgeObserver = null;

function checkLiveStatus() {
  const liveBadge = document.querySelector('.ytp-live-badge.ytp-button');
  const isLive = liveBadge && getComputedStyle(liveBadge).display !== 'none';
  const isFullscreen = !!document.querySelector('.html5-video-player.ytp-fullscreen');

  if (isLive && isFullscreen && !chatOverlay) {
    createChatOverlay();
  } else if ((!isLive || !isFullscreen) && chatOverlay) {
    closeChatOverlay();
  }
}

function waitForVideoPlayer() {
  return new Promise(resolve => {
    const check = () => {
      const player = document.querySelector('.html5-video-player');
      if (player) resolve(player);
      else setTimeout(check, 100);
    };
    check();
  });
}

function setupLiveBadgeObserver() {
  if (liveBadgeObserver) liveBadgeObserver.disconnect();

  liveBadgeObserver = new MutationObserver((mutations) => {
    const needsUpdate = mutations.some(mutation =>
      mutation.type === 'attributes' ||
      mutation.type === 'childList'
    );
    if (needsUpdate) {
      checkLiveStatus();
    }
  });

  const container = document.querySelector('.ytp-chrome-top');
  if (container) {
    liveBadgeObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'aria-label']
    });
  }
}

browser.storage.local.get('chatSettings').then(result => {
  if (result.chatSettings) {
    settings = { ...settings, ...result.chatSettings };
  }
});

function extractChatUrl() {
  const videoId = new URLSearchParams(window.location.search).get('v');
  const liveBadge = document.querySelector('.ytp-live-badge.ytp-button');
  const isLive = liveBadge && getComputedStyle(liveBadge).display !== 'none';

  if (!videoId || !isLive) return null;
  return `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}&dark_theme=1`;
}

function injectChatStyles(iframe) {
  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const style = iframeDoc.createElement('style');
    style.textContent = `
      body { 
        background: transparent !important;
      }
      /* ... rest of original CSS injection ... */
    `;
    iframeDoc.head.appendChild(style);
  } catch (e) { }
}

function createChatOverlay() {
  const liveBadge = document.querySelector('.ytp-live-badge.ytp-button');
  if (!liveBadge) return;

  const chatUrl = extractChatUrl();
  if (!chatUrl) return;

  if (chatOverlay) {
    chatOverlay.remove();
    chatOverlay = null;
  }

  chatOverlay = document.createElement('div');
  chatOverlay.id = 'yt-chat-overlay';
  const resizeHandles = [
    { class: 'resize-handle-left', direction: 'width-left' },
    { class: 'resize-handle-right', direction: 'width-right' },
    { class: 'resize-handle-top', direction: 'height-top' },
    { class: 'resize-handle-bottom', direction: 'height-bottom' }
  ];

  resizeHandles.forEach(({ class: className, direction }) => {
    const handle = document.createElement('div');
    handle.className = className;
    handle.dataset.direction = direction;
    chatOverlay.appendChild(handle);
  });
  const header = document.createElement('div');
  header.className = 'chat-header';

  const headerText = document.createElement('span');
  headerText.textContent = 'Live Chat';

  const controls = document.createElement('div');
  controls.className = 'chat-controls';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close chat');
  closeBtn.textContent = '×';

  controls.appendChild(closeBtn);
  header.appendChild(headerText);
  header.appendChild(controls);
  chatOverlay.appendChild(header);
  const container = document.createElement('div');
  container.className = 'chat-container';

  const iframe = document.createElement('iframe');
  iframe.src = chatUrl;
  iframe.className = 'chat-frame';
  iframe.allow = 'autoplay';

  container.appendChild(iframe);
  chatOverlay.appendChild(container);

  document.body.appendChild(chatOverlay);

  chatOverlay.style.width = settings.width;
  chatOverlay.style.height = settings.height;
  chatOverlay.style.left = settings.left === 'auto'
    ? (window.innerWidth - parseInt(settings.width)) + 'px'
    : settings.left;
  chatOverlay.style.top = settings.top;
  chatOverlay.style.opacity = settings.opacity;
  chatOverlay.style.display = 'flex';

  addDocumentListeners();
  chatOverlay.addEventListener('mousedown', handleDragStart);

  iframe.addEventListener('load', () => {
    injectChatStyles(iframe);
  });

  closeBtn.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  });

  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeChatOverlay();
  });

  adjustVideoPlayer();
}

function closeChatOverlay() {
  if (!chatOverlay) return;

  clearTimeout(adjustVideoPlayer.debounce);
  chatOverlay.remove();
  chatOverlay = null;
  removeDocumentListeners();
  resetVideoPlayer();

  const player = document.querySelector('.html5-video-player');
  if (player) player.style.width = '100%';
}
