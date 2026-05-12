/**
 * Navigation JS - Guitar Learning Site
 * - Auto-highlights current page nav link
 * - Mobile hamburger menu toggle
 * - Dark/Light theme toggle
 */
(function () {
  'use strict';

  // --- Get current page filename ---
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // --- Highlight active nav link ---
  var navLinks = document.querySelectorAll('.navbar .nav-links a');
  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

  // --- Hamburger menu toggle ---
  var hamburger = document.querySelector('.hamburger');
  var mobileMenu = document.querySelector('.navbar .nav-links');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    // Close menu when a nav link is clicked (mobile)
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      var isNavbar = e.target.closest('.navbar');
      if (!isNavbar && mobileMenu.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      }
    });
  }

  // --- Dark/Light theme toggle ---
  var themeToggle = document.querySelector('.theme-toggle');
  var htmlEl = document.documentElement;

  // Load saved theme
  var savedTheme = localStorage.getItem('guitar-theme');
  if (savedTheme === 'light') {
    htmlEl.setAttribute('data-theme', 'light');
    if (themeToggle) themeToggle.textContent = '☀️';
  }
})();

// Global function for inline onclick
window.toggleTheme = function() {
  var htmlEl = document.documentElement;
  var btn = document.querySelector('.theme-toggle');
  var isLight = htmlEl.getAttribute('data-theme') === 'light';
  if (isLight) {
    htmlEl.removeAttribute('data-theme');
    if (btn) btn.textContent = '🌙';
    localStorage.setItem('guitar-theme', 'dark');
  } else {
    htmlEl.setAttribute('data-theme', 'light');
    if (btn) btn.textContent = '☀️';
    localStorage.setItem('guitar-theme', 'light');
  }
};
