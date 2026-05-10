function copyemail() {
  navigator.clipboard.writeText("akramumad@gmail.com");
  const c = document.querySelector(".copied");
  c.style.opacity = "1";
  setTimeout(() => (c.style.opacity = "0"), 1000);
}

function switchTab(tabName, element) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach(content => content.classList.remove("active"));
  
  // Remove active class from all buttons
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach(button => button.classList.remove("active"));
  
  // Show selected tab content
  const selectedTab = document.getElementById(`${tabName}-tab`);
  if (selectedTab) {
    selectedTab.classList.add("active");
  }
  
  // Add active class to clicked button
  if (element) {
    element.classList.add("active");
  }
}

// Dark mode toggle
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Check for saved theme preference or default to light mode
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);

  setupExperienceModal();
  setupSiteAudioPlayer();
});

function setupExperienceModal() {
  const modal = document.getElementById('experience-modal');
  if (!modal) return;

  const contentHost = modal.querySelector('[data-experience-modal-content]');
  const closeBtn = modal.querySelector('[data-experience-modal-close]');
  const clickableRows = document.querySelectorAll('.experience-clickable[data-experience-detail-id]');

  let lastFocused = null;

  const openModalWithDetailId = (detailId) => {
    const detailEl = document.getElementById(detailId);
    if (!detailEl || !contentHost) return;

    lastFocused = document.activeElement;

    contentHost.innerHTML = detailEl.innerHTML;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('experience-modal-open');

    const scrollModalToTop = () => {
      modal.scrollTop = 0;
      const panel = modal.querySelector('.experience-modal-content');
      if (panel) panel.scrollIntoView({ block: 'start', behavior: 'auto' });
    };
    scrollModalToTop();
    requestAnimationFrame(scrollModalToTop);

    if (closeBtn && typeof closeBtn.focus === 'function') {
      try {
        closeBtn.focus({ preventScroll: true });
      } catch {
        closeBtn.focus();
      }
    }
    requestAnimationFrame(scrollModalToTop);
  };

  const closeModal = () => {
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('experience-modal-open');
    if (contentHost) contentHost.innerHTML = '';

    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
    lastFocused = null;
  };

  clickableRows.forEach((row) => {
    row.addEventListener('click', () => {
      const detailId = row.getAttribute('data-experience-detail-id');
      if (detailId) openModalWithDetailId(detailId);
    });

    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const detailId = row.getAttribute('data-experience-detail-id');
        if (detailId) openModalWithDetailId(detailId);
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    const isOpen = modal.getAttribute('aria-hidden') === 'false';
    if (!isOpen) return;
    if (e.key === 'Escape') closeModal();
  });
}

const SITE_AUDIO_STATE_KEY = 'siteAudioPlayer:v1';

/** Markup for the site mini-player (injected on subpages that omit it). */
const SITE_AUDIO_PLAYER_INNER_HTML = `
<div class="site-audio" data-site-audio>
  <audio preload="metadata"></audio>
  <div class="site-audio-shell">
    <button type="button" class="site-audio-btn site-audio-minimize" data-audio-minimize aria-label="Minimize player" title="Minimize">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
    <div class="site-audio-expanded">
    <div class="site-audio-left-stack">
      <div class="site-audio-art" aria-hidden="true">
        <img class="site-audio-cover" data-audio-cover alt="" width="56" height="56" decoding="async" hidden />
        <svg class="site-audio-art-fallback" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" />
          <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <div class="site-audio-transport">
        <button type="button" class="site-audio-btn" data-audio-prev aria-label="Previous track">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6 6h2v12H6V6zm12 0v12l-8-6 8-6z" />
          </svg>
        </button>
        <button type="button" class="site-audio-btn site-audio-btn-play" data-audio-play aria-label="Play">
          <svg class="site-audio-icon-play" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="8 5 8 19 19 12 8 5" />
          </svg>
          <svg class="site-audio-icon-pause" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        </button>
        <button type="button" class="site-audio-btn" data-audio-next aria-label="Next track">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M16 6h2v12h-2V6zM4 18V6l8 6-8 6z" />
          </svg>
        </button>
      </div>
    </div>
    <div class="site-audio-body">
      <div class="site-audio-head">
        <span class="site-audio-title" data-audio-title>—</span>
        <span class="site-audio-artist" data-audio-artist>—</span>
      </div>
      <div class="site-audio-playback">
        <div class="site-audio-seek-inline">
          <span class="site-audio-time" data-audio-time-current>0:00</span>
          <div class="site-audio-seek-track">
            <input type="range" min="0" max="1000" value="0" data-audio-seek aria-label="Seek" />
          </div>
          <span class="site-audio-time site-audio-time-end" data-audio-time-duration>0:00</span>
        </div>
        <div class="site-audio-volume">
          <button type="button" class="site-audio-btn site-audio-btn-mute" data-audio-mute aria-label="Mute">
            <span class="site-audio-vol-iconwrap" data-audio-vol-icon data-volume-state="high" aria-hidden="true">
              <svg class="site-audio-vol-svg" data-vol="low" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              </svg>
              <svg class="site-audio-vol-svg" data-vol="mid" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <svg class="site-audio-vol-svg" data-vol="high" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
              <svg class="site-audio-vol-svg" data-vol="mute" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            </span>
          </button>
          <input type="range" min="0" max="100" value="26" data-audio-volume aria-label="Volume" />
        </div>
      </div>
    </div>
    </div>
    <div class="site-audio-collapsed" data-site-audio-collapsed hidden>
      <div class="site-audio-mini-disc" aria-hidden="true">
        <img class="site-audio-mini-cover" data-audio-mini-cover alt="" width="44" height="44" decoding="async" hidden />
      </div>
      <button type="button" class="site-audio-btn site-audio-expand" data-audio-expand aria-label="Expand player" title="Expand">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </div>
  </div>
</div>
`.trim();

function readSiteAudioState() {
  try {
    const raw = localStorage.getItem(SITE_AUDIO_STATE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (typeof o !== 'object' || o === null) return null;
    return o;
  } catch {
    return null;
  }
}

function ensureSiteAudioPlayerMount() {
  if (document.querySelector('[data-site-audio]')) return;
  const host = document.createElement('div');
  host.innerHTML = SITE_AUDIO_PLAYER_INNER_HTML;
  const root = host.firstElementChild;
  if (!root) return;
  const page = document.querySelector('.page');
  if (page) page.prepend(root);
  else document.body.prepend(root);
}

/**
 * Site mini-player: add MP3s under /audio and edit SITE_AUDIO_PLAYLIST below.
 */
function setupSiteAudioPlayer() {
  ensureSiteAudioPlayerMount();
  const root = document.querySelector('[data-site-audio]');
  if (!root) return;

  /** Default linear gain (0–1). ~0.25 is quiet-but-clear on most systems; avoids starting at full blast. */
  const DEFAULT_VOLUME = 0.26;

  const SITE_AUDIO_PLAYLIST = [
    {
      file: 'audio/color-your-night.mp3',
      title: 'Color Your Night',
      artist: 'ATLUS Sound Team',
      cover: 'Images/audio/color-your-night-cover.png',
    },
    {
      file: 'audio/beneath-the-mask-rain.mp3',
      title: 'Beneath the Mask -rain-',
      artist: 'Lyn, ATLUS Sound Team',
      cover: 'Images/audio/beneath-the-mask-rain-cover.png',
    },
    {
      file: 'audio/tokyo-express.mp3',
      title: 'Tokyo Express',
      artist: 'Yel',
      cover: 'Images/audio/tokyo-express-cover.png',
    },
    {
      file: 'audio/euphoria-bts.mp3',
      title: 'Euphoria',
      artist: 'BTS',
      cover: 'Images/audio/euphoria-cover.png',
    },
    {
      file: 'audio/moon-afroshyi.mp3',
      title: 'Moon',
      artist: 'Afroshyi',
      cover: 'Images/audio/moon-afroshyi-cover.png',
    },
  ];

  const audio = root.querySelector('audio');
  const titleEl = root.querySelector('[data-audio-title]');
  const artistEl = root.querySelector('[data-audio-artist]');
  const artEl = root.querySelector('.site-audio-art');
  const coverImg = root.querySelector('[data-audio-cover]');
  const btnPlay = root.querySelector('[data-audio-play]');
  const btnPrev = root.querySelector('[data-audio-prev]');
  const btnNext = root.querySelector('[data-audio-next]');
  const btnMute = root.querySelector('[data-audio-mute]');
  const seekEl = root.querySelector('[data-audio-seek]');
  const volEl = root.querySelector('[data-audio-volume]');
  const timeCur = root.querySelector('[data-audio-time-current]');
  const timeDur = root.querySelector('[data-audio-time-duration]');
  const iconPlay = root.querySelector('.site-audio-icon-play');
  const iconPause = root.querySelector('.site-audio-icon-pause');
  const volIconWrap = root.querySelector('[data-audio-vol-icon]');
  const btnMinimize = root.querySelector('[data-audio-minimize]');
  const btnExpand = root.querySelector('[data-audio-expand]');
  const expandedWrap = root.querySelector('.site-audio-expanded');
  const collapsedWrap = root.querySelector('[data-site-audio-collapsed]');
  const miniCover = root.querySelector('[data-audio-mini-cover]');

  if (!audio || !SITE_AUDIO_PLAYLIST.length) return;

  const saved = readSiteAudioState();
  let startIndex = 0;
  let initialResume = null;
  if (saved && typeof saved.i === 'number' && Number.isFinite(saved.i)) {
    startIndex = Math.min(
      Math.max(0, Math.floor(saved.i)),
      SITE_AUDIO_PLAYLIST.length - 1
    );
    initialResume = {
      t: typeof saved.t === 'number' && Number.isFinite(saved.t) ? Math.max(0, saved.t) : 0,
      play: !!saved.play,
    };
  }

  let index = 0;
  let scrubbing = false;
  let initialResumeApplied = false;
  let lastStatePersist = 0;
  let collapsed = !!(saved && saved.collapsed);

  const persist = () => {
    try {
      localStorage.setItem(
        SITE_AUDIO_STATE_KEY,
        JSON.stringify({
          i: index,
          t: audio.currentTime,
          play: !audio.paused,
          vol: audio.volume,
          muted: audio.muted,
          collapsed,
        })
      );
    } catch (_) {}
  };

  const persistThrottledTime = () => {
    const now = Date.now();
    if (now - lastStatePersist < 400) return;
    lastStatePersist = now;
    persist();
  };

  const formatTime = (sec) => {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const syncPlayUi = () => {
    const on = !audio.paused;
    root.classList.toggle('is-audio-playing', on);
    if (btnPlay) btnPlay.classList.toggle('is-playing', on);
    if (btnPlay) btnPlay.setAttribute('aria-label', on ? 'Pause' : 'Play');
    if (iconPlay) iconPlay.setAttribute('aria-hidden', on ? 'true' : 'false');
    if (iconPause) iconPause.setAttribute('aria-hidden', on ? 'false' : 'true');
  };

  const syncMiniCover = (t) => {
    if (!miniCover) return;
    if (t.cover) {
      miniCover.src = t.cover;
      miniCover.alt = '';
      miniCover.hidden = false;
    } else {
      miniCover.removeAttribute('src');
      miniCover.hidden = true;
    }
  };

  const applyCollapsed = (next) => {
    collapsed = !!next;
    root.classList.toggle('is-collapsed', collapsed);
    if (expandedWrap) expandedWrap.hidden = collapsed;
    if (collapsedWrap) collapsedWrap.hidden = !collapsed;
    if (btnMinimize) btnMinimize.hidden = collapsed;
    persist();
  };

  const syncVolIcon = () => {
    if (!volIconWrap) return;
    const v = audio.volume;
    let state = 'high';
    if (audio.muted || v === 0) state = 'mute';
    else if (v < 0.34) state = 'low';
    else if (v < 0.67) state = 'mid';
    else state = 'high';
    volIconWrap.setAttribute('data-volume-state', state);
    if (btnMute) {
      btnMute.setAttribute('aria-label', state === 'mute' ? 'Unmute' : 'Mute');
    }
  };

  const loadTrack = (i) => {
    index = (i + SITE_AUDIO_PLAYLIST.length) % SITE_AUDIO_PLAYLIST.length;
    const t = SITE_AUDIO_PLAYLIST[index];
    audio.src = t.file;
    if (titleEl) {
      titleEl.textContent = t.title;
      titleEl.title = t.title;
    }
    if (artistEl) {
      artistEl.textContent = t.artist;
      artistEl.title = t.artist;
    }
    if (seekEl) seekEl.value = '0';
    if (timeCur) timeCur.textContent = '0:00';
    if (timeDur) timeDur.textContent = '0:00';

    if (coverImg && artEl) {
      if (t.cover) {
        coverImg.src = t.cover;
        coverImg.alt = '';
        coverImg.hidden = false;
        artEl.classList.add('has-cover');
      } else {
        coverImg.removeAttribute('src');
        coverImg.alt = '';
        coverImg.hidden = true;
        artEl.classList.remove('has-cover');
      }
    }
    syncMiniCover(t);

    audio.load();
  };

  let startVol = DEFAULT_VOLUME;
  if (saved && typeof saved.vol === 'number' && Number.isFinite(saved.vol)) {
    startVol = Math.min(1, Math.max(0, saved.vol));
  }
  audio.volume = startVol;
  if (volEl) volEl.value = String(Math.round(startVol * 100));
  if (saved && saved.muted) {
    audio.muted = true;
  }

  loadTrack(startIndex);
  applyCollapsed(collapsed);

  btnMinimize?.addEventListener('click', (e) => {
    e.stopPropagation();
    applyCollapsed(true);
  });
  btnExpand?.addEventListener('click', (e) => {
    e.stopPropagation();
    applyCollapsed(false);
  });

  btnPlay?.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    syncPlayUi();
    persist();
  });

  btnPrev?.addEventListener('click', () => {
    const wasPlaying = !audio.paused;
    loadTrack(index - 1);
    if (wasPlaying) audio.play().catch(() => {});
    syncPlayUi();
    persist();
  });

  btnNext?.addEventListener('click', () => {
    const wasPlaying = !audio.paused;
    loadTrack(index + 1);
    if (wasPlaying) audio.play().catch(() => {});
    syncPlayUi();
    persist();
  });

  btnMute?.addEventListener('click', () => {
    const off = audio.muted || audio.volume === 0;
    if (off) {
      audio.muted = false;
      if (audio.volume === 0 && volEl) {
        audio.volume = DEFAULT_VOLUME;
        volEl.value = String(Math.round(DEFAULT_VOLUME * 100));
      }
    } else {
      audio.muted = true;
    }
    syncVolIcon();
    persist();
  });

  volEl?.addEventListener('input', () => {
    const v = Number(volEl.value) / 100;
    audio.volume = v;
    if (v > 0) audio.muted = false;
    syncVolIcon();
    persist();
  });

  seekEl?.addEventListener('pointerdown', () => {
    scrubbing = true;
  });
  seekEl?.addEventListener('pointerup', () => {
    scrubbing = false;
    persist();
  });
  seekEl?.addEventListener('pointercancel', () => {
    scrubbing = false;
  });
  seekEl?.addEventListener('input', () => {
    if (!audio.duration || !Number.isFinite(audio.duration)) return;
    const v = Number(seekEl.value) / 1000;
    audio.currentTime = v * audio.duration;
  });

  audio.addEventListener('timeupdate', () => {
    if (scrubbing || !audio.duration || !Number.isFinite(audio.duration)) return;
    if (seekEl) seekEl.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
    if (timeCur) timeCur.textContent = formatTime(audio.currentTime);
    persistThrottledTime();
  });

  audio.addEventListener('loadedmetadata', () => {
    if (timeDur) timeDur.textContent = formatTime(audio.duration);
    if (
      !initialResumeApplied &&
      initialResume &&
      audio.duration &&
      Number.isFinite(audio.duration)
    ) {
      initialResumeApplied = true;
      const maxT = Math.max(0, audio.duration - 0.05);
      const t = Math.min(initialResume.t, maxT);
      audio.currentTime = t;
      if (initialResume.play) {
        audio.play().catch(() => {});
      }
      initialResume = null;
      syncPlayUi();
    }
    persist();
  });

  audio.addEventListener('play', () => {
    syncPlayUi();
    persist();
  });
  audio.addEventListener('pause', () => {
    syncPlayUi();
    persist();
  });
  audio.addEventListener('volumechange', () => {
    syncVolIcon();
    persist();
  });

  audio.addEventListener('ended', () => {
    loadTrack(index + 1);
    audio.play().catch(() => {});
    syncPlayUi();
    persist();
  });

  audio.addEventListener('error', () => {
    if (titleEl) {
      titleEl.textContent = 'Audio file missing';
      titleEl.title = '';
    }
    if (artistEl) {
      artistEl.textContent = 'Add MP3s to audio/ (see app.js)';
      artistEl.title = '';
    }
    persist();
  });

  const flushState = () => persist();
  window.addEventListener('pagehide', flushState);
  window.addEventListener('beforeunload', flushState);

  syncPlayUi();
  syncVolIcon();
}

// Dropdown toggle function
function toggleDropdown(id) {
  const content = document.getElementById(id);
  const button = event.currentTarget;
  const isOpen = content.classList.contains('open');
  
  if (isOpen) {
    content.classList.remove('open');
    button.classList.remove('active');
  } else {
    content.classList.add('open');
    button.classList.add('active');
  }
}
