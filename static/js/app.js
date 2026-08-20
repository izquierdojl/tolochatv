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
  const favoritesBtn = document.getElementById('channels-favorites-btn');
  const panel = document.getElementById('channels-panel');
  const treeEl = document.getElementById('channels-tree');
  const favoritesEl = document.getElementById('channels-favorites');
  const favoritesListEl = document.getElementById('channels-favorites-list');
  const favoritesEmptyEl = document.getElementById('channels-favorites-empty');
  const toggleAllBtn = document.getElementById('channels-toggle-all');
  if (!btn || !favoritesBtn || !panel || !treeEl || !favoritesEl || !favoritesListEl) return;

  const STORE_OPEN = 'tolochatv.channels.panelOpen';
  const STORE_EXPANDED = 'tolochatv.channels.expanded';
  const STORE_SELECTED = 'tolochatv.channels.selected';
  const STORE_SCROLL = 'tolochatv.channels.scroll';
  const STORE_VIEW = 'tolochatv.channels.view';

  const expanded = new Map(); // category_id -> expanded bool
  let treeData = null;        // cached API response
  let userPrefs = null;       // cached authenticated preferences
  let liveFavorites = {};     // stream_id -> favorite metadata
  let panelOpen = false;
  let panelView = 'tree';
  let selectedStreamId = null;
  let treeRendered = false;   // whether the tree DOM is currently built

  function t(key) {
    if (typeof I18N !== 'undefined' && I18N.t) return I18N.t(key);
    return key;
  }

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    (container || document.body).appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  async function copyChannelLink(streamId) {
    try {
      const resp = await fetch('/api/channels/live-url?stream_id=' + encodeURIComponent(streamId));
      if (!resp.ok) throw new Error('Failed to resolve URL');
      const data = await resp.json();
      const url = data.url;
      await writeClipboard(url);
      showToast(t('Copied!'));
    } catch (e) {
      showToast(t('Failed to copy channel link'));
    }
  }

  function writeClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  function createCopyButton(streamId) {
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'channel-copy-btn flex-shrink-0 w-7 h-7 text-base leading-none text-gray-400 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded';
    copy.dataset.streamId = String(streamId);
    copy.textContent = '⧉';
    copy.setAttribute('aria-label', t('Copy channel link'));
    copy.title = t('Copy channel link');
    copy.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      copyChannelLink(streamId);
    });
    return copy;
  }

  function isFavorite(streamId) {
    return Object.prototype.hasOwnProperty.call(liveFavorites, String(streamId));
  }

  async function loadUserPrefs() {
    if (userPrefs !== null) return;
    try {
      const resp = await fetch('/api/user-prefs');
      if (!resp.ok) throw new Error('Failed to load user preferences');
      userPrefs = await resp.json();
      const favorites = userPrefs.favorites || {};
      liveFavorites = favorites.live && typeof favorites.live === 'object'
        ? {...favorites.live} : {};
    } catch (e) {
      userPrefs = null;
      liveFavorites = {};
      console.error('Failed to load channel favorites:', e);
    }
  }

  async function saveUserPrefs() {
    let favorites = userPrefs && userPrefs.favorites;
    if (!favorites) {
      try {
        const resp = await fetch('/api/user-prefs');
        if (!resp.ok) throw new Error('Failed to refresh user preferences');
        userPrefs = await resp.json();
        favorites = userPrefs.favorites || {};
      } catch (e) {
        console.error('Failed to save channel favorites:', e);
        return;
      }
    }

    const updatedFavorites = {...favorites, live: liveFavorites};
    userPrefs = {...userPrefs, favorites: updatedFavorites};
    try {
      const resp = await fetch('/api/user-prefs', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({favorites: updatedFavorites})
      });
      if (!resp.ok) throw new Error('Failed to save user preferences');
    } catch (e) {
      console.error('Failed to save channel favorites:', e);
    }
  }

  function visibleChannelsById() {
    const channels = new Map();
    if (!treeData || !treeData.groups) return channels;

    treeData.groups.forEach(group => {
      (group.channels || []).forEach(channel => {
        const id = String(channel.stream_id);
        const existing = channels.get(id);
        if (existing) {
          if (!existing.groups.includes(group.category_name)) {
            existing.groups.push(group.category_name);
          }
          return;
        }
        channels.set(id, {
          streamId: id,
          name: channel.name,
          groups: [group.category_name]
        });
      });
    });
    return channels;
  }

  function updateFavoriteControls() {
    treeEl.querySelectorAll('.channel-favorite-btn').forEach(button => {
      const id = button.dataset.streamId;
      const marked = isFavorite(id);
      button.textContent = marked ? '★' : '☆';
      button.setAttribute('aria-pressed', String(marked));
      button.setAttribute('aria-label', t(marked ? 'Remove channel from favorites' : 'Add channel to favorites'));
      button.title = t(marked ? 'Remove channel from favorites' : 'Add channel to favorites');
      button.classList.toggle('text-yellow-400', marked);
    });
  }

  function renderFavorites() {
    favoritesListEl.innerHTML = '';
    const visibleChannels = visibleChannelsById();
    const favorites = Object.keys(liveFavorites)
      .map(id => visibleChannels.get(String(id)))
      .filter(Boolean);

    if (favoritesEmptyEl) favoritesEmptyEl.classList.toggle('hidden', favorites.length > 0);
    if (!favorites.length) return;

    favorites.forEach(channel => {
      const row = document.createElement('div');
      row.className = 'flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-700 text-sm';

      const link = document.createElement('a');
      link.href = '/play/live/' + encodeURIComponent(channel.streamId);
      link.className = 'flex-1 min-w-0 truncate focus:outline-none focus:ring-2 focus:ring-blue-500 rounded' +
        (channel.streamId === selectedStreamId ? ' channel-selected' : '');
      link.tabIndex = 0;
      link.dataset.streamId = channel.streamId;
      link.textContent = channel.name + ' (' + channel.groups.join(', ') + ')';
      link.addEventListener('click', () => {
        selectedStreamId = channel.streamId;
        applySelectionHighlight();
        try { localStorage.setItem(STORE_SELECTED, selectedStreamId); } catch (e) { /* ignore */ }
      });

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'channel-favorite-btn flex-shrink-0 text-yellow-400 text-xl leading-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded';
      remove.dataset.streamId = channel.streamId;
      remove.textContent = '★';
      remove.setAttribute('aria-pressed', 'true');
      remove.setAttribute('aria-label', t('Remove channel from favorites'));
      remove.title = t('Remove channel from favorites');
      remove.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(channel.streamId, channel.name, channel.groups);
      });

      row.appendChild(link);
      row.appendChild(createCopyButton(channel.streamId));
      row.appendChild(remove);
      favoritesListEl.appendChild(row);
    });
  }

  function toggleFavorite(streamId, name, groups) {
    const id = String(streamId);
    if (isFavorite(id)) {
      delete liveFavorites[id];
    } else {
      liveFavorites[id] = {name, groups};
    }
    updateFavoriteControls();
    renderFavorites();
    void saveUserPrefs();
  }

  function setPanelView(view, focusFirst = false) {
    panelView = view;
    try { localStorage.setItem(STORE_VIEW, panelView); } catch (e) { /* ignore */ }
    const isTree = view === 'tree';
    treeEl.classList.toggle('hidden', !isTree);
    favoritesEl.classList.toggle('hidden', isTree);
    if (toggleAllBtn) toggleAllBtn.classList.toggle('hidden', !isTree);
    btn.classList.toggle('active', panelOpen && isTree);
    favoritesBtn.classList.toggle('active', panelOpen && !isTree);
    favoritesBtn.setAttribute('aria-pressed', String(panelOpen && !isTree));
    favoritesBtn.setAttribute('aria-label', t(isTree ? 'Show favorite channels' : 'Show channel tree'));
    if (!isTree) renderFavorites();

    if (focusFirst) {
      const first = panelFocusables()[0];
      if (first) first.focus();
    }
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
      const saved = localStorage.getItem(STORE_SELECTED);
      if (saved) selectedStreamId = String(saved);
      const savedView = localStorage.getItem(STORE_VIEW);
      if (savedView === 'tree' || savedView === 'favorites') panelView = savedView;
    } catch (e) { /* storage unavailable */ }
    return isOpen;
  }

  function syncSelectionFromUrl() {
    const m = location.pathname.match(/^\/play\/live\/(.+)$/);
    if (!m) return;
    try {
      selectedStreamId = decodeURIComponent(m[1]);
      localStorage.setItem(STORE_SELECTED, selectedStreamId);
    } catch (e) { /* storage unavailable */ }
  }

  function revealSelectedGroup() {
    if (!selectedStreamId || !treeData || !treeData.groups) return false;
    const group = treeData.groups.find(g =>
      (g.channels || []).some(ch => String(ch.stream_id) === selectedStreamId)
    );
    if (group && !expanded.get(group.category_id)) {
      expanded.set(group.category_id, true);
      saveExpanded();
      return true;
    }
    return false;
  }

  function savePanelScroll() {
    try { localStorage.setItem(STORE_SCROLL, String(panel.scrollTop)); } catch (e) { /* ignore */ }
  }

  function restorePanelScroll() {
    try {
      const saved = localStorage.getItem(STORE_SCROLL);
      if (saved !== null) panel.scrollTop = parseInt(saved, 10) || 0;
    } catch (e) { /* ignore */ }
  }

  function applySelectionHighlight() {
    if (!treeEl) return;
    treeEl.querySelectorAll('a[data-stream-id].channel-selected').forEach(el => {
      el.classList.remove('channel-selected');
    });
    favoritesListEl.querySelectorAll('a[data-stream-id].channel-selected').forEach(el => {
      el.classList.remove('channel-selected');
    });
    if (!selectedStreamId) return;
    const treeElSelected = treeEl.querySelector('a[data-stream-id="' + CSS.escape(selectedStreamId) + '"]');
    if (treeElSelected) treeElSelected.classList.add('channel-selected');
    const favoriteEl = favoritesListEl.querySelector('a[data-stream-id="' + CSS.escape(selectedStreamId) + '"]');
    if (favoriteEl) favoriteEl.classList.add('channel-selected');
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
      renderFavorites();
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
          const row = document.createElement('div');
          row.className = 'flex items-center gap-1';

          const a = document.createElement('a');
          a.href = '/play/live/' + ch.stream_id;
          a.dataset.streamId = String(ch.stream_id);
          a.className = 'flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 text-sm focus:outline-none focus:bg-gray-700 flex-1 min-w-0' +
            (String(ch.stream_id) === selectedStreamId ? ' channel-selected' : '');
          a.addEventListener('click', () => {
            selectedStreamId = String(ch.stream_id);
            try { localStorage.setItem(STORE_SELECTED, selectedStreamId); } catch (e) { /* ignore */ }
            applySelectionHighlight();
          });
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

          const favorite = document.createElement('button');
          favorite.type = 'button';
          favorite.className = 'channel-favorite-btn flex-shrink-0 w-7 h-7 text-lg leading-none text-gray-400 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded';
          favorite.dataset.streamId = String(ch.stream_id);
          favorite.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            const visible = visibleChannelsById().get(String(ch.stream_id));
            toggleFavorite(ch.stream_id, ch.name, visible ? visible.groups : []);
          });

      row.appendChild(a);
      row.appendChild(createCopyButton(ch.stream_id));
      row.appendChild(favorite);
      list.appendChild(row);
        });
        groupDiv.appendChild(list);
      }

      treeEl.appendChild(groupDiv);
    });

    if (countEl) countEl.textContent = String(total);
    updateToggleLabel();
    updateFavoriteControls();
    renderFavorites();
    if (focusCat) {
      const target = treeEl.querySelector('button[data-cat="' + CSS.escape(focusCat) + '"]');
      if (target) target.focus();
    }
  }

  async function showPanel(focusFirst, view = panelView) {
    panelOpen = true;
    panel.classList.remove('hidden');
    try { localStorage.setItem(STORE_OPEN, '1'); } catch (e) { /* ignore */ }
    setPanelView(view);
    const treePromise = treeData ? Promise.resolve() : fetch('/api/channels/tree')
      .then(resp => resp.ok ? resp.json() : {groups: []})
      .catch(() => ({groups: []}))
      .then(data => { treeData = data; });
    await Promise.all([treePromise, loadUserPrefs()]);
    const revealedGroup = revealSelectedGroup();
    if (!treeRendered || revealedGroup) {
      renderTree();
      treeRendered = true;
      restorePanelScroll();
    } else {
      // Tree already mounted (e.g. reopened or restored from bfcache):
      // only refresh the selection highlight, never rebuild the whole tree.
      applySelectionHighlight();
      updateFavoriteControls();
      renderFavorites();
    }
    setPanelView(view);
    if (focusFirst) {
      const first = panelFocusables()[0];
      if (first) first.focus();
    }
  }

  function hidePanel() {
    panelOpen = false;
    btn.classList.remove('active');
    favoritesBtn.classList.remove('active');
    favoritesBtn.setAttribute('aria-pressed', 'false');
    panel.classList.add('hidden');
    try { localStorage.setItem(STORE_OPEN, '0'); } catch (e) { /* ignore */ }
    btn.focus();
  }

  btn.addEventListener('click', () => {
    if (panel.classList.contains('hidden')) {
      showPanel(true, 'tree');
    } else if (panelView !== 'tree') {
      setPanelView('tree', true);
    } else {
      hidePanel();
    }
  });

  favoritesBtn.addEventListener('click', () => {
    if (panel.classList.contains('hidden')) {
      showPanel(true, 'favorites');
    } else {
      setPanelView('favorites', true);
    }
  });

  if (toggleAllBtn) toggleAllBtn.addEventListener('click', () => {
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

  // Sync selection with the playing channel before restoring panel state
  syncSelectionFromUrl();

  // Persist the panel's scroll position so it is restored on return/reopen
  panel.addEventListener('scroll', () => savePanelScroll(), { passive: true });

  // On bfcache restore the DOM (and any stale highlight) comes back intact;
  // re-apply the current selection highlight and scroll so it stays consistent.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      applySelectionHighlight();
      restorePanelScroll();
    }
  });

  // Restore persisted state on page load (fixed panel defaults to open)
  if (loadState()) {
    showPanel(false);
  }

})();
