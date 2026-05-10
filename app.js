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

/**
 * Site mini-player: add MP3s under /audio and edit SITE_AUDIO_PLAYLIST below.
 */
function setupSiteAudioPlayer() {
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

  if (!audio || !SITE_AUDIO_PLAYLIST.length) return;

  let index = 0;
  let scrubbing = false;

  const formatTime = (sec) => {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const syncPlayUi = () => {
    const on = !audio.paused;
    if (btnPlay) btnPlay.classList.toggle('is-playing', on);
    if (btnPlay) btnPlay.setAttribute('aria-label', on ? 'Pause' : 'Play');
    if (iconPlay) iconPlay.setAttribute('aria-hidden', on ? 'true' : 'false');
    if (iconPause) iconPause.setAttribute('aria-hidden', on ? 'false' : 'true');
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

    audio.load();
  };

  loadTrack(0);

  audio.volume = DEFAULT_VOLUME;
  if (volEl) volEl.value = String(Math.round(DEFAULT_VOLUME * 100));

  btnPlay?.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    syncPlayUi();
  });

  btnPrev?.addEventListener('click', () => {
    const wasPlaying = !audio.paused;
    loadTrack(index - 1);
    if (wasPlaying) audio.play().catch(() => {});
    syncPlayUi();
  });

  btnNext?.addEventListener('click', () => {
    const wasPlaying = !audio.paused;
    loadTrack(index + 1);
    if (wasPlaying) audio.play().catch(() => {});
    syncPlayUi();
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
  });

  volEl?.addEventListener('input', () => {
    const v = Number(volEl.value) / 100;
    audio.volume = v;
    if (v > 0) audio.muted = false;
    syncVolIcon();
  });

  seekEl?.addEventListener('pointerdown', () => {
    scrubbing = true;
  });
  seekEl?.addEventListener('pointerup', () => {
    scrubbing = false;
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
  });

  audio.addEventListener('loadedmetadata', () => {
    if (timeDur) timeDur.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('play', syncPlayUi);
  audio.addEventListener('pause', syncPlayUi);
  audio.addEventListener('volumechange', syncVolIcon);

  audio.addEventListener('ended', () => {
    loadTrack(index + 1);
    audio.play().catch(() => {});
    syncPlayUi();
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
  });

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