/**
 * Modern Navigation Component
 * Auto-generates navigation based on current page
 */
(function() {
  'use strict';

  var navItems = [
    { id: 'index', label: '首页', href: 'index.html' },
    { id: 'chords', label: '和弦库', href: 'chords.html' },
    { id: 'chord-mastery', label: '突破前三品', href: 'chord-mastery.html' },
    { id: 'scales', label: '音阶', href: 'scales.html' },
    { id: 'theory', label: '乐理', href: 'theory.html' },
    { id: 'songs', label: '练习曲', href: 'songs.html' },
    { id: 'solo', label: 'Solo', href: 'solo.html' },
    { id: 'roadmap', label: '学习路线', href: 'roadmap.html' }
  ];

  function createNav() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (!currentPage || currentPage === '') currentPage = 'index.html';

    var nav = document.createElement('nav');
    nav.className = 'main-nav';

    var container = document.createElement('div');
    container.className = 'nav-container';

    // Brand
    var brand = document.createElement('a');
    brand.href = 'index.html';
    brand.className = 'nav-brand';
    brand.textContent = '🎸 Guitar Guide';

    // Links
    var linksContainer = document.createElement('ul');
    linksContainer.className = 'nav-links';

    navItems.forEach(function(item) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      a.className = 'nav-link';

      if (currentPage === item.href || 
          (currentPage === '' && item.href === 'index.html') ||
          (currentPage === '/' && item.href === 'index.html')) {
        a.classList.add('active');
      }

      li.appendChild(a);
      linksContainer.appendChild(li);
    });

    container.appendChild(brand);
    container.appendChild(linksContainer);
    nav.appendChild(container);

    // Insert at beginning of body
    if (document.body) {
      document.body.insertBefore(nav, document.body.firstChild);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createNav);
  } else {
    createNav();
  }
})();
