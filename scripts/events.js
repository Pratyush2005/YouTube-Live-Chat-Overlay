const documentEventHandlers = {
  mousemove: [handleDrag, handleResize],
  mouseup: [handleDragEnd, handleResizeEnd]
};

function addDocumentListeners() {
  Object.entries(documentEventHandlers).forEach(([event, handlers]) => {
    handlers.forEach(handler => {
      document.addEventListener(event, handler);
    });
  });
}

function removeDocumentListeners() {
  Object.entries(documentEventHandlers).forEach(([event, handlers]) => {
    handlers.forEach(handler => {
      document.removeEventListener(event, handler);
    });
  });
}

function handleDragStart(e) {
  if (e.target.closest('[class^="resize-handle"]')) {
    const handle = e.target.closest('[class^="resize-handle"]');
    resizeDirection = handle.dataset.direction;
    handleResizeStart(e);
    return;
  }

  if (e.target.closest('.chat-header')) {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    initialLeft = parseInt(chatOverlay.style.left) || window.innerWidth - parseInt(chatOverlay.style.width);
    initialTop = parseInt(chatOverlay.style.top) || 0;

    chatOverlay.classList.add('dragging');
    document.addEventListener('selectstart', preventSelection);
  }
}

function handleDrag(e) {
  if (!isDragging) return;

  const deltaX = e.clientX - dragStartX;
  const deltaY = e.clientY - dragStartY;

  const newLeft = initialLeft + deltaX;
  const newTop = initialTop + deltaY;

  const maxLeft = window.innerWidth - parseInt(chatOverlay.style.width);
  const maxTop = window.innerHeight - parseInt(chatOverlay.style.height);

  chatOverlay.style.left = Math.max(0, Math.min(maxLeft, newLeft)) + 'px';
  chatOverlay.style.top = Math.max(0, Math.min(maxTop, newTop)) + 'px';

  settings.left = chatOverlay.style.left;
  settings.top = chatOverlay.style.top;

  requestAnimationFrame(() => adjustVideoPlayer());
}

function handleDragEnd() {
  if (!isDragging) return;

  isDragging = false;
  chatOverlay.classList.remove('dragging');

  browser.storage.local.set({ chatSettings: settings });

  document.removeEventListener('selectstart', preventSelection);
  requestAnimationFrame(() => adjustVideoPlayer());
}

function handleResizeStart(e) {
  if (!resizeDirection) return;

  isResizing = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  initialWidth = parseInt(chatOverlay.style.width);
  initialHeight = parseInt(chatOverlay.style.height);
  initialLeft = parseInt(chatOverlay.style.left) || window.innerWidth - initialWidth;
  initialTop = parseInt(chatOverlay.style.top) || 0;

  chatOverlay.classList.add('resizing');
  document.addEventListener('selectstart', preventSelection);
}

function handleResize(e) {
  if (!isResizing) return;

  const minWidth = 250;
  const maxWidth = window.innerWidth - 100;
  const minHeight = 200;
  const maxHeight = window.innerHeight - 50;

  if (resizeDirection === 'width-left') {
    const deltaX = e.clientX - dragStartX;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, initialWidth - deltaX));
    const newLeft = initialLeft + deltaX;

    if (newWidth >= minWidth && newWidth <= maxWidth && newLeft >= 0) {
      chatOverlay.style.width = newWidth + 'px';
      chatOverlay.style.left = newLeft + 'px';
      settings.width = newWidth + 'px';
      settings.left = newLeft + 'px';
    }
  }
  else if (resizeDirection === 'width-right') {
    const deltaX = e.clientX - dragStartX;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, initialWidth + deltaX));

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      chatOverlay.style.width = newWidth + 'px';
      settings.width = newWidth + 'px';
    }
  }
  else if (resizeDirection === 'height-top') {
    const deltaY = e.clientY - dragStartY;
    const newHeight = Math.max(minHeight, Math.min(maxHeight, initialHeight - deltaY));
    const newTop = initialTop + deltaY;

    if (newHeight >= minHeight && newHeight <= maxHeight && newTop >= 0) {
      chatOverlay.style.height = newHeight + 'px';
      chatOverlay.style.top = newTop + 'px';
      settings.height = newHeight + 'px';
      settings.top = newTop + 'px';
    }
  }
  else if (resizeDirection === 'height-bottom') {
    const deltaY = e.clientY - dragStartY;
    const newHeight = Math.max(minHeight, Math.min(maxHeight, initialHeight + deltaY));

    if (newHeight >= minHeight && newHeight <= maxHeight) {
      chatOverlay.style.height = newHeight + 'px';
      settings.height = newHeight + 'px';
    }
  }

  requestAnimationFrame(() => adjustVideoPlayer());
}

function handleResizeEnd() {
  if (!isResizing) return;

  isResizing = false;
  resizeDirection = null;
  chatOverlay.classList.remove('resizing');

  browser.storage.local.set({ chatSettings: settings });

  document.removeEventListener('selectstart', preventSelection);
  requestAnimationFrame(() => adjustVideoPlayer());
}

function preventSelection(e) {
  e.preventDefault();
}
