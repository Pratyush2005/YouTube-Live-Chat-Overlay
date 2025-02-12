function adjustVideoPlayer() {
  if (!adjustVideoPlayer.debounce) {
    adjustVideoPlayer.debounce = setTimeout(() => {
      if (!isFullscreen || !chatOverlay || chatOverlay.style.display === 'none') {
        resetVideoPlayer();
        return;
      }

      const player = document.querySelector('.html5-video-player');
      const video = document.querySelector('video');
      const moviePlayer = document.getElementById('movie_player');

      if (!player || !video || !moviePlayer) return;

      const chatWidth = parseInt(chatOverlay.style.width);
      const viewportWidth = window.innerWidth;
      const videoWidth = viewportWidth - chatWidth;

      moviePlayer.style.width = `${videoWidth}px`;
      moviePlayer.style.position = 'fixed';
      moviePlayer.style.left = '0';

      player.style.width = '100%';
      player.style.left = '0';

      video.style.width = '100%';
      video.style.left = '0';
      adjustVideoPlayer.debounce = null;
    }, 100);
  }
}

function resetVideoPlayer() {
  const player = document.querySelector('.html5-video-player');
  const video = document.querySelector('video');
  const moviePlayer = document.getElementById('movie_player');

  if (moviePlayer) {
    moviePlayer.style.width = '100%';
    moviePlayer.style.position = '';
    moviePlayer.style.left = '';
  }

  if (player) {
    player.style.width = '100%';
    player.style.left = '';
  }

  if (video) {
    video.style.width = '100%';
    video.style.left = '';
  }
}
