(function () {
  const scriptTag = document.currentScript;
 
  const config = {
    song: scriptTag.dataset.song || '',
    title: scriptTag.dataset.title || 'Música sem título',
    artist: scriptTag.dataset.artist || 'Artista desconhecido',
    cover: scriptTag.dataset.cover || 'https://placehold.co/80x80/1db954/ffffff?text=%E2%99%AA',
    autoplay: scriptTag.dataset.autoplay === 'true'
  };
 
  // ====== CSS ======
  const style = document.createElement('style');
  style.textContent = `
    .mini-player {
      position: fixed;
      display: flex;
      align-items: center;
      gap: 12px;
      background: #181818;
      color: #fff;
      padding: 10px 16px;
      border-radius: 50px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.35);
      font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
      z-index: 9999;
      user-select: none;
      cursor: grab;
      touch-action: none;
    }
    .mini-player.dragging {
      cursor: grabbing;
      box-shadow: 0 10px 28px rgba(0,0,0,0.5);
      transition: none;
    }
    .mini-player .cover {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      animation: mp-spin 6s linear infinite;
      animation-play-state: paused;
    }
    .mini-player.playing .cover { animation-play-state: running; }
    .mini-player .info {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
      max-width: 140px;
    }
    .mini-player .title {
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mini-player .artist {
      font-size: 11px;
      color: #b3b3b3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mini-player button {
      background: #1db954;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: transform 0.15s ease, background 0.15s ease;
    }
    .mini-player button:hover { transform: scale(1.08); background: #1ed760; }
    .mini-player button svg { width: 16px; height: 16px; fill: #000; }
    @keyframes mp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
 
  // ====== HTML do player ======
  const player = document.createElement('div');
  player.className = 'mini-player';
  player.innerHTML = `
    <img class="cover" src="${config.cover}" alt="capa">
    <div class="info">
      <span class="title">${config.title}</span>
      <span class="artist">${config.artist}</span>
    </div>
    <button aria-label="Play/Pause">
      <svg class="play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      <svg class="pause-icon" viewBox="0 0 24 24" style="display:none"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>
    </button>
  `;
 
  const audio = document.createElement('audio');
  audio.src = config.song;
  audio.loop = true;
 
  document.body.appendChild(player);
  document.body.appendChild(audio);
 
  // Use left/top em vez de bottom/right para poder mover livremente depois
  const initialRect = player.getBoundingClientRect();
  player.style.left = (window.innerWidth - initialRect.width - 20) + 'px';
  player.style.top = (window.innerHeight - initialRect.height - 20) + 'px';
 
  // ====== arrastar ======
  let isDragging = false;
  let hasMoved = false;
  let offsetX = 0;
  let offsetY = 0;
 
  function startDrag(clientX, clientY) {
    isDragging = true;
    hasMoved = false;
    const rect = player.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    player.classList.add('dragging');
  }
 
  function moveDrag(clientX, clientY) {
    if (!isDragging) return;
    hasMoved = true;
    let newLeft = clientX - offsetX;
    let newTop = clientY - offsetY;
 
    // manter o player dentro da tela
    const rect = player.getBoundingClientRect();
    newLeft = Math.max(0, Math.min(window.innerWidth - rect.width, newLeft));
    newTop = Math.max(0, Math.min(window.innerHeight - rect.height, newTop));
 
    player.style.left = newLeft + 'px';
    player.style.top = newTop + 'px';
  }
 
  function endDrag() {
    isDragging = false;
    player.classList.remove('dragging');
  }
 
  // Mouse
  player.addEventListener('mousedown', (e) => {
    startDrag(e.clientX, e.clientY);
    e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
  document.addEventListener('mouseup', endDrag);
 
  // Touch 
  player.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener('touchend', endDrag);
 
  // Reposiciona se a janela for redimensionada, para não sair da tela
  window.addEventListener('resize', () => {
    const rect = player.getBoundingClientRect();
    const maxLeft = window.innerWidth - rect.width;
    const maxTop = window.innerHeight - rect.height;
    player.style.left = Math.min(parseFloat(player.style.left), maxLeft) + 'px';
    player.style.top = Math.min(parseFloat(player.style.top), maxTop) + 'px';
  });
 
  // ====== play/pause ======
  const btn = player.querySelector('button');
  const playIcon = player.querySelector('.play-icon');
  const pauseIcon = player.querySelector('.pause-icon');
 
  btn.addEventListener('click', (e) => {
    if (hasMoved) {
      e.stopPropagation();
      return;
    }
    if (audio.paused) {
      audio.play().catch(err => {
        console.error('Não foi possível tocar o áudio:', err);
        alert('Não foi possível tocar o áudio. Verifique o caminho definido em data-song.');
      });
    } else {
      audio.pause();
    }
  });
 
  audio.addEventListener('play', () => {
    player.classList.add('playing');
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  });
 
  audio.addEventListener('pause', () => {
    player.classList.remove('playing');
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  });
 
  audio.addEventListener('error', () => {
    console.error('Erro ao carregar o áudio. Verifique o caminho em data-song="..."');
  });
 
  if (config.autoplay) {
    audio.play().catch(() => {
    });
  }
})();
