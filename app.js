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
});

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