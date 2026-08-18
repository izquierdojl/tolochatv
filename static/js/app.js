// Keyboard navigation for 10-foot UI
(function() {
  'use strict';

  // Pages with custom arrow key handling
  const customNavPages = ['/play/', '/guide'];
  const hasCustomNav = customNavPages.some(p => location.pathname.startsWith(p));

  // ============================================================
  // Focus Management
  // ============================================================

  function getFocusables(container = document) {
    return Array.from(container.querySelectorAll(
      'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"], .focusable'
    )).filter(el => el.offsetParent !== null); // visible only
  }

  function getGridInfo(element) {
    const grid = element.closest('.grid');
    if (!grid) return null;

    const items = Array.from(grid.querySelectorAll('[data-nav="grid"]'));
    const index = items.indexOf(element);
    if (index === -1) return null;

    // Detect columns by comparing Y positions
    let cols = 1;
    if (items.length > 1) {
      const firstTop = items[0].getBoundingClientRect().top;
      for (let i = 1; i < items.length; i++) {
        if (items[i].getBoundingClientRect().top > firstTop + 5) {
          cols = i;
          break;
        }
      }
      if (cols === 1) cols = items.length;
    }

    return { items, index, cols };
  }

  function moveFocus(direction) {
    const current = document.activeElement;
    const focusables = getFocusables();
    const currentIndex = focusables.indexOf(current);

    // Try grid navigation first
    const gridInfo = getGridInfo(current);
    if (gridInfo && gridInfo.cols > 1) {
      const { items, index, cols } = gridInfo;
      let nextIndex = -1;

      switch (direction) {
        case 'up': nextIndex = index - cols; break;
        case 'down': nextIndex = index + cols; break;
        case 'left': nextIndex = index - 1; break;
        case 'right': nextIndex = index + 1; break;
      }

      if (nextIndex >= 0 && nextIndex < items.length) {
        items[nextIndex].focus();
        items[nextIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        return true;
      }
      // At grid edge - don't wrap for up/down
      if (direction === 'up' || direction === 'down') return false;
    }

    // Linear navigation fallback
    let nextElement = null;
    if (direction === 'up' || direction === 'left') {
      nextElement = focusables[currentIndex - 1];
    } else {
      nextElement = focusables[currentIndex + 1];
    }

    if (nextElement) {
      nextElement.focus();
      nextElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return true;
    }
    return false;
  }

  // ============================================================
  // Initial Focus
  // ============================================================

  function setInitialFocus() {
    // Skip if something is already focused (other than body)
    if (document.activeElement && document.activeElement !== document.body) return;

    // Priority: [autofocus], first grid item, first focusable in main
    const autofocus = document.querySelector('[autofocus]');
    if (autofocus) { autofocus.focus(); return; }

    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    const gridItem = mainContent.querySelector('[data-nav="grid"]');
    if (gridItem) { gridItem.focus(); return; }

    const firstFocusable = getFocusables(mainContent)[0];
    if (firstFocusable) firstFocusable.focus();
  }

  // ============================================================
  // Favorites Toggle
  // ============================================================

  function toggleFocusedFavorite() {
    const el = document.activeElement;
    if (!el) return false;

    // Check for movie card
    const movieCard = el.closest('.movie-card');
    if (movieCard) {
      const btn = movieCard.querySelector('.fav-btn, .fav-btn-movie');
      if (btn) { btn.click(); return true; }
    }

    // Check for series card
    const seriesCard = el.closest('.series-card');
    if (seriesCard) {
      const btn = seriesCard.querySelector('.fav-btn, .fav-btn-series');
      if (btn) { btn.click(); return true; }
    }

    // Check for favorites tile (in favorites view)
    const tile = el.closest('.vod-tile, .series-tile');
    if (tile) {
      const btn = tile.querySelector('button');
      if (btn) { btn.click(); return true; }
    }

    // Check for detail page favorite button
    const favBtn = document.getElementById('fav-btn');
    if (favBtn) { favBtn.click(); return true; }

    return false;
  }

  // ============================================================
  // Keyboard Handler
  // ============================================================

  document.addEventListener('keydown', (e) => {
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    const isSelect = e.target.tagName === 'SELECT';

    // Input field handling
    if (isInput) {
      if (e.key === 'Escape') {
        e.target.blur();
        return;
      }
      // Allow down arrow to escape search input
      if (e.key === 'ArrowDown' && e.target.type === 'text') {
        const mainContent = document.querySelector('main');
        const firstResult = mainContent?.querySelector('[data-nav="grid"]');
        if (firstResult) {
          e.preventDefault();
          firstResult.focus();
          return;
        }
      }
      // Let other keys work normally in inputs
      return;
    }

    // Select handling - let arrows work for options
    if (isSelect && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        // Skip if page has custom navigation or Alt pressed (browser nav)
        if (hasCustomNav || e.altKey) return;
        e.preventDefault();
        const dir = e.key.replace('Arrow', '').toLowerCase();
        moveFocus(dir);
        break;

      case 'Enter': {
        const el = document.activeElement;
        if (el?.href) {
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            window.open(el.href, '_blank');
          } else {
            window.location.href = el.href;
          }
        } else if (el?.click && el.tagName !== 'A' && el.tagName !== 'BUTTON') {
          e.preventDefault();
          el.click();
        }
        break;
      }

      case 'f':
      case 'F':
        if (toggleFocusedFavorite()) {
          e.preventDefault();
        }
        break;

      case 'Escape':
        // Only handle if focus is on a known focusable element (not during browser find dialog, etc.)
        if (!document.activeElement || document.activeElement === document.body) return;
        e.preventDefault();
        if (document.activeElement?.closest('nav')) {
          // In nav - go to main content
          const mainFocusable = document.querySelector('main [data-nav="grid"], main .focusable, main a[href], main button');
          if (mainFocusable) mainFocusable.focus();
        } else {
          // In content - go to nav
          const navLink = document.querySelector('nav .nav-link');
          if (navLink) navLink.focus();
        }
        break;

      case 'Backspace':
        // Go back unless on root pages or in input
        const rootPages = ['/', '/guide', '/vod', '/series', '/search', '/settings'];
        if (!rootPages.includes(location.pathname)) {
          e.preventDefault();
          history.back();
        }
        break;
    }
  });

  // Set initial focus after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setInitialFocus);
  } else {
    setTimeout(setInitialFocus, 0);
  }

})();

// ============================================================
// Channels Tree (fixed sidebar panel)
// ============================================================

(function() {
  'use strict';

  const btn = document.getElementById('channels-tree-btn');
  const panel = document.getElementById('channels-panel');
  const treeEl = document.getElementById('channels-tree');
  const toggleAllBtn = document.getElementById('channels-toggle-all');
  if (!btn || !panel || !treeEl) return;

  const STORE_OPEN = 'tolochatv.channels.panelOpen';
  const STORE_EXPANDED = 'tolochatv.channels.expanded';

  const expanded = new Map(); // category_id -> expanded bool
  let treeData = null;        // cached API response
  let panelOpen = false;

  function t(key) {
    if (typeof I18N !== 'undefined' && I18N.t) return I18N.t(key);
    return key;
  }

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  function saveExpanded() {
    try {
      const ids = Array.from(expanded.entries())
        .filter(([, open]) => open)
        .map(([id]) => id);
      localStorage.setItem(STORE_EXPANDED, JSON.stringify(ids));
    } catch (e) { /* storage unavailable */ }
  }

  function allGroupsExpanded() {
    return !!treeData && !!treeData.groups && treeData.groups.length > 0 &&
      treeData.groups.every(g => expanded.get(g.category_id));
  }

  function updateToggleLabel() {
    if (!toggleAllBtn) return;
    toggleAllBtn.textContent = allGroupsExpanded() ? t('Collapse all') : t('Expand all');
  }

  function loadState() {
    // Fixed panel: open by default on first visit; groups start collapsed.
    let isOpen = true;
    try {
      const raw = localStorage.getItem(STORE_OPEN);
      if (raw === '0' || raw === '1') isOpen = raw === '1';
      const ids = JSON.parse(localStorage.getItem(STORE_EXPANDED) || '[]');
      if (Array.isArray(ids)) ids.forEach(id => expanded.set(String(id), true));
    } catch (e) { /* storage unavailable */ }
    return isOpen;
  }

  function panelFocusables() {
    return Array.from(panel.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]'))
      .filter(el => el.offsetParent !== null);
  }

  function renderTree(focusCat) {
    treeEl.innerHTML = '';
    const countEl = document.getElementById('channels-count');

    if (!treeData || !treeData.groups || treeData.groups.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'text-sm text-gray-400 p-3';
      empty.textContent = t('No channels available');
      treeEl.appendChild(empty);
      if (countEl) countEl.textContent = '';
      updateToggleLabel();
      return;
    }

    let total = 0;
    treeData.groups.forEach(g => {
      total += g.channels.length;
      const isOpen = expanded.get(g.category_id) || false;

      const groupDiv = document.createElement('div');
      groupDiv.className = 'group-item';

      const header = document.createElement('button');
      header.type = 'button';
      header.className = 'flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-gray-700 text-sm focus:outline-none focus:bg-gray-700';
      header.tabIndex = 0;
      header.dataset.cat = g.category_id;
      header.innerHTML =
        '<span class="chevron text-gray-400 text-xs w-4 flex-shrink-0">' + (isOpen ? '&#9660;' : '&#9654;') + '</span>' +
        '<span class="truncate flex-1 text-left">' + escapeHtml(g.category_name) + '</span>' +
        '<span class="text-xs text-gray-500 flex-shrink-0">' + g.channels.length + '</span>';
      header.addEventListener('click', () => {
        expanded.set(g.category_id, !(expanded.get(g.category_id) || false));
        saveExpanded();
        renderTree(g.category_id);
      });
      groupDiv.appendChild(header);

      if (isOpen) {
        const list = document.createElement('div');
        list.className = 'pl-4';
        g.channels.forEach(ch => {
          const a = document.createElement('a');
          a.href = '/play/live/' + ch.stream_id;
          a.className = 'flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 text-sm focus:outline-none focus:bg-gray-700';
          a.tabIndex = 0;
          const img = document.createElement('img');
          img.src = ch.icon || '';
          img.alt = '';
          img.className = 'w-5 h-5 object-contain flex-shrink-0';
          img.addEventListener('error', () => { img.style.display = 'none'; });
          const name = document.createElement('span');
          name.className = 'truncate';
          name.textContent = ch.name;
          a.appendChild(img);
          a.appendChild(name);
          list.appendChild(a);
        });
        groupDiv.appendChild(list);
      }

      treeEl.appendChild(groupDiv);
    });

    if (countEl) countEl.textContent = String(total);
    updateToggleLabel();
    if (focusCat) {
      const target = treeEl.querySelector('button[data-cat="' + CSS.escape(focusCat) + '"]');
      if (target) target.focus();
    }
  }

  async function showPanel(focusFirst) {
    panelOpen = true;
    btn.classList.add('active');
    panel.classList.remove('hidden');
    try { localStorage.setItem(STORE_OPEN, '1'); } catch (e) { /* ignore */ }
    if (!treeData) {
      try {
        const resp = await fetch('/api/channels/tree');
        treeData = resp.ok ? await resp.json() : { groups: [] };
      } catch (e) {
        treeData = { groups: [] };
      }
    }
    renderTree();
    if (focusFirst) {
      const first = panelFocusables()[0];
      if (first) first.focus();
    }
  }

  function hidePanel() {
    panelOpen = false;
    btn.classList.remove('active');
    panel.classList.add('hidden');
    try { localStorage.setItem(STORE_OPEN, '0'); } catch (e) { /* ignore */ }
    btn.focus();
  }

  btn.addEventListener('click', () => {
    if (panel.classList.contains('hidden')) {
      showPanel(true);
    } else {
      hidePanel();
    }
  });

  toggleAllBtn.addEventListener('click', () => {
    if (!treeData || !treeData.groups || treeData.groups.length === 0) return;
    if (allGroupsExpanded()) {
      expanded.clear();
    } else {
      treeData.groups.forEach(g => expanded.set(g.category_id, true));
    }
    saveExpanded();
    renderTree();
  });

  // Keyboard: while focus is inside the panel, intercept with priority over
  // the global navigation handler (including pages with custom nav).
  document.addEventListener('keydown', (e) => {
    const inside = panelOpen && panel.contains(document.activeElement);
    if (!inside) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      hidePanel();
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      const items = panelFocusables();
      if (!items.length) return;
      const current = document.activeElement;
      const idx = items.indexOf(current);

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const header = current && current.matches && current.matches('button[data-cat]')
          ? current : null;
        if (header) {
          const cat = header.dataset.cat;
          const isOpen = expanded.get(cat) || false;
          if ((e.key === 'ArrowRight' && !isOpen) || (e.key === 'ArrowLeft' && isOpen)) {
            expanded.set(cat, !isOpen);
            saveExpanded();
            renderTree(cat);
          }
        }
        return;
      }

      let next = idx;
      if (e.key === 'ArrowDown') next = idx + 1;
      if (e.key === 'ArrowUp') next = idx - 1;
      if (next < 0) next = items.length - 1;
      if (next >= items.length) next = 0;
      items[next].focus();
      items[next].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, true);

  // Restore persisted state on page load (fixed panel defaults to open)
  if (loadState()) {
    showPanel(false);
  }

})();
