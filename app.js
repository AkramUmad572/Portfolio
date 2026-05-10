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