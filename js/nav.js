(function () {
  'use strict';

  var primary = [
    { id: 'roadmap', label: '学习路线', href: 'roadmap.html' },
    { id: 'chords', label: '和弦', href: 'chords.html' },
    { id: 'songs', label: '歌曲', href: 'songs.html' },
    { id: 'practice-tools', label: '练习工具', href: 'practice-tools.html' }
  ];

  var more = [
    { id: 'scales', label: '音阶', href: 'scales.html' },
    { id: 'theory', label: '乐理', href: 'theory.html' },
    { id: 'solo', label: 'Solo', href: 'solo.html' },
    { id: 'chord-mastery', label: '进阶和弦', href: 'chord-mastery.html' }
  ];

  function link(item, current) {
    var a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.label;
    a.className = 'nav-link' + (current === item.id ? ' active' : '');
    return a;
  }

  function createNav() {
    var file = window.location.pathname.split('/').pop() || 'index.html';
    var current = file.replace('.html', '');
    var nav = document.createElement('nav');
    nav.className = 'main-nav';
    nav.setAttribute('aria-label', '主导航');

    var container = document.createElement('div');
    container.className = 'nav-container';

    var brand = document.createElement('a');
    brand.href = 'index.html';
    brand.className = 'nav-brand';
    brand.innerHTML = '<span class="brand-mark">拾</span><span>拾音吉他课<small>BEGINNER GUITAR</small></span>';

    var links = document.createElement('div');
    links.className = 'nav-links';
    primary.forEach(function (item) { links.appendChild(link(item, current)); });

    var dropdown = document.createElement('details');
    dropdown.className = 'nav-more';
    var summary = document.createElement('summary');
    summary.className = 'nav-link';
    summary.textContent = '更多';
    dropdown.appendChild(summary);
    var menu = document.createElement('div');
    menu.className = 'nav-menu';
    more.forEach(function (item) { menu.appendChild(link(item, current)); });
    dropdown.appendChild(menu);
    links.appendChild(dropdown);

    var start = document.createElement('a');
    start.href = 'roadmap.html';
    start.className = 'nav-cta';
    start.textContent = '开始学习 →';

    container.appendChild(brand);
    container.appendChild(links);
    container.appendChild(start);
    nav.appendChild(container);
    document.body.insertBefore(nav, document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createNav);
  } else {
    createNav();
  }
})();
