/**
 * Modern Navigation Component
 * Auto-generates navigation based on current page
 */
(function() {
  'use strict';

  var navItems = [
    { id: 'index', label: '首页', href: 'index.html' },
    { id: 'chords', label: '和弦库', href: 'chords.html' },
    { id: 'scales', label: '音阶', href: 'scales.html' },
    { id: 'theory', label: '乐理', href: 'theory.html' },
    { id: 'songs', label: '练习曲', href: 'songs.html' },
    { id: 'solo', label: 'Solo', href: 'solo.html' },
    { id: 'chord-mastery', label: '突破前三品', href: 'chord-mastery.html' },
    { id: 'roadmap', label: '路线图', href: 'roadmap.html' }
  ];

  function createNav() {
    var path = window.location.pathname;
    var currentPage = path.split('/').pop() || 'index.html';
    
    // Handle cases like '/chords' -> 'chords.html' or '/chords.html' -> 'chords.html'
    if (!currentPage || currentPage === '') {
      currentPage = 'index.html';
    } else if (!currentPage.includes('.html')) {
      // Convert '/chords' to 'chords.html' for comparison
      currentPage = currentPage + '.html';
    }

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

      // More flexible matching - only match if path contains the item id or is exact match
      var isActive = false;
      if (item.href === 'index.html') {
        // Index page check
        isActive = (currentPage === 'index.html' && (path === '/' || path === '' || path.endsWith('/')));
      } else {
        // Other pages - check if current page matches item id
        var itemName = item.href.replace('.html', '');
        var currentName = currentPage.replace('.html', '');
        isActive = (currentName === itemName);
      }
      
      if (isActive) {
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
