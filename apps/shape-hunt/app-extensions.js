/* Shape Hunt extension layer: taste map, review board, brutal mode and better design review flow. */
(function installShapeHuntExtensions() {
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => [...root.querySelectorAll(selector)];

  function ensureSection(id, html) {
    if (q(`#${id}`)) return;
    const section = document.createElement('section');
    section.id = id;
    section.className = 'view';
    section.innerHTML = html;
    q('.main').appendChild(section);
  }

  function ensureTab(view, label) {
    if (q(`.tab[data-view="${view}"]`)) return;
    const tab = document.createElement('button');
    tab.className = 'tab';
    tab.dataset.view = view;
    tab.textContent = label;
    tab.addEventListener('click', () => {
      state.view = view;
      render();
    });
    q('.tabs').appendChild(tab);
  }

  function installControls() {
    if (!q('#brutalMode')) {
      const host = q('#sortSelect')?.closest('.control-block') || q('#densityRange').closest('.control-block');
      const label = document.createElement('label');
      label.className = 'toggle-row';
      label.innerHTML = '<input id="brutalMode" type="checkbox"/> Brutal silhouette mode';
      host.appendChild(label);
      q('#brutalMode').checked = Boolean(state.settings.brutalMode);
      q('#brutalMode').addEventListener('change', (event) => {
        state.settings.brutalMode = event.target.checked;
        save();
        render();
      });
    }

    if (!q('#tastePanel')) {
      const panel = document.createElement('div');
      panel.className = 'taste-panel';
      panel.innerHTML = '<div class="eyebrow">Taste signal</div><div id="tastePanel"></div>';
      q('.stats').before(panel);
    }
  }

  function installViews() {
    ensureTab('map', 'Shape Map');
    ensureTab('review', 'Review Board');
    ensureSection('mapView', '<div class="section-intro"><h3>Shape Map</h3><p>See where your taste clusters. Gold means saved, green means good, red means rejected. Click a point to inspect it.</p></div><div id="shapeMapStage"></div>');
    ensureSection('reviewView', '<div class="section-intro"><h3>Review Board</h3><p>A calm board for saved forms. Use it when the rough hunt becomes a design conversation.</p></div><div id="reviewBoardStage"></div>');
  }

  function tasteInsight() {
    const good = state.shapes.filter((shape) => state.decisions[shape.id]?.rating === 'good' || state.decisions[shape.id]?.saved);
    const bad = state.shapes.filter((shape) => state.decisions[shape.id]?.rating === 'bad');
    const keys = ['height', 'base', 'rim', 'belly', 'waist', 'foot', 'lip', 'shoulder', 'quiet', 'tableScore', 'soulScore', 'campingRisk'];
    const avg = (list, key) => list.length ? Math.round((list.reduce((sum, shape) => sum + Number(shape[key]), 0) / list.length) * 1000) / 1000 : null;
    return keys.map((key) => ({ key, good: avg(good, key), bad: avg(bad, key) }));
  }

  function renderTastePanel() {
    const mount = q('#tastePanel');
    if (!mount) return;
    const rows = tasteInsight().filter((row) => row.good !== null || row.bad !== null);
    if (!rows.length) {
      mount.innerHTML = '<p>No taste signal yet.</p>';
      return;
    }
    mount.innerHTML = rows.map((row) => {
      const delta = row.good !== null && row.bad !== null ? Math.round((row.good - row.bad) * 1000) / 1000 : null;
      const sign = delta === null || delta <= 0 ? '' : '+';
      return `<div><span>${row.key}</span><strong>${row.good ?? '—'}</strong><em>${delta === null ? '' : `${sign}${delta}`}</em></div>`;
    }).join('');
  }

  function renderShapeMap() {
    const mount = q('#shapeMapStage');
    if (!mount) return;
    const shapes = filtered();
    if (!shapes.length) {
      mount.innerHTML = empty('No silhouettes to map.', 'Generate a batch first.');
      return;
    }

    const keys = ['recommendation', 'soulScore', 'tableScore', 'campingRisk', 'foot', 'lip', 'waist', 'belly', 'height', 'base', 'rim', 'stability'];
    state.settings.mapX = state.settings.mapX || 'tableScore';
    state.settings.mapY = state.settings.mapY || 'soulScore';
    const xKey = state.settings.mapX;
    const yKey = state.settings.mapY;
    const width = 960;
    const height = 560;
    const pad = 54;
    const xs = shapes.map((shape) => Number(shape[xKey]));
    const ys = shapes.map((shape) => Number(shape[yKey]));
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const x = (value) => pad + ((value - minX) / Math.max(0.0001, maxX - minX)) * (width - pad * 2);
    const y = (value) => height - pad - ((value - minY) / Math.max(0.0001, maxY - minY)) * (height - pad * 2);

    const points = shapes.map((shape) => {
      const decision = state.decisions[shape.id] || {};
      const color = decision.saved ? '#a98245' : decision.rating === 'good' ? '#1f7a4d' : decision.rating === 'bad' ? '#9a352c' : '#161514';
      const radius = decision.saved ? 7 : decision.rating ? 5.5 : 3.8;
      const opacity = decision.rating === 'bad' ? 0.35 : 0.80;
      return `<circle cx="${Math.round(x(shape[xKey]) * 10) / 10}" cy="${Math.round(y(shape[yKey]) * 10) / 10}" r="${radius}" fill="${color}" opacity="${opacity}" data-id="${shape.id}"/>`;
    }).join('');

    mount.innerHTML = `
      <div class="map-toolbar">
        <label>X <select id="mapX">${keys.map((key) => `<option value="${key}">${key}</option>`).join('')}</select></label>
        <label>Y <select id="mapY">${keys.map((key) => `<option value="${key}">${key}</option>`).join('')}</select></label>
        <span class="pill">gold saved</span><span class="pill">green good</span><span class="pill">red bad</span>
      </div>
      <svg class="shape-map" viewBox="0 0 ${width} ${height}">
        <rect x="0" y="0" width="${width}" height="${height}" rx="28" fill="#fbfaf7"/>
        <line x1="${pad}" x2="${width - pad}" y1="${height - pad}" y2="${height - pad}" stroke="#ded8ce"/>
        <line x1="${pad}" x2="${pad}" y1="${pad}" y2="${height - pad}" stroke="#ded8ce"/>
        <text x="${width / 2}" y="${height - 16}" text-anchor="middle" class="map-label">${xKey}</text>
        <text x="18" y="${height / 2}" transform="rotate(-90 18 ${height / 2})" text-anchor="middle" class="map-label">${yKey}</text>
        ${points}
      </svg>
    `;
    q('#mapX').value = xKey;
    q('#mapY').value = yKey;
    q('#mapX').addEventListener('change', (event) => { state.settings.mapX = event.target.value; save(); renderShapeMap(); });
    q('#mapY').addEventListener('change', (event) => { state.settings.mapY = event.target.value; save(); renderShapeMap(); });
    qa('circle[data-id]', mount).forEach((dot) => {
      dot.addEventListener('click', () => openFocus(state.shapes.findIndex((shape) => shape.id === dot.dataset.id)));
    });
  }

  function renderReviewBoard() {
    const mount = q('#reviewBoardStage');
    if (!mount) return;
    const saved = state.shapes
      .filter((shape) => state.decisions[shape.id]?.saved)
      .sort((a, b) => {
        const aw = state.decisions[a.id]?.tournamentWins || 0;
        const bw = state.decisions[b.id]?.tournamentWins || 0;
        return bw - aw || b.recommendation - a.recommendation;
      })
      .slice(0, 24);

    if (!saved.length) {
      mount.innerHTML = empty('Nothing to review yet.', 'Save promising silhouettes, then return here for a calmer design review board.');
      return;
    }

    mount.innerHTML = '<div class="review-actions"><button id="exportReviewBtn" class="primary">Export review board HTML</button><button id="exportShortlistBtn" class="secondary">Export shortlist JSON</button></div><div class="review-grid"></div>';
    const grid = q('.review-grid', mount);
    saved.forEach((shape, index) => {
      const tags = state.tags[shape.id] || [];
      const card = document.createElement('article');
      card.className = 'review-card';
      card.innerHTML = `<div class="review-rank">${String(index + 1).padStart(2, '0')}</div><div class="review-art">${svg(shape, { large: true, scale: 0.92 })}</div><div><div class="eyebrow">${shape.archetypeName}</div><h3>${shape.id}</h3><p class="meta">${designerRead(shape)}</p><div class="card-chips">${tags.map((tag) => `<span>${tag}</span>`).join('')}</div></div>`;
      card.addEventListener('click', () => openFocus(state.shapes.indexOf(shape)));
      grid.appendChild(card);
    });
    q('#exportReviewBtn').addEventListener('click', () => exportReviewBoard(saved));
    q('#exportShortlistBtn').addEventListener('click', () => downloadObject({ schema: 'shape-hunt-shortlist-v1', exportedAt: new Date().toISOString(), shapes: saved, decisions: state.decisions, tags: state.tags }, 'shape-hunt-shortlist.json'));
  }

  function exportReviewBoard(saved) {
    const cards = saved.map((shape, index) => `<section class="card"><div class="rank">${String(index + 1).padStart(2, '0')}</div>${svg(shape, { large: true, scale: 0.92 })}<h2>${shape.id}</h2><p>${shape.archetypeName}</p><p>${designerRead(shape)}</p></section>`).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Shape Hunt Review Board</title><style>body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#f5f2ec;color:#161514;margin:40px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px}.card{background:#fbfaf7;border:1px solid #ded8ce;border-radius:28px;padding:24px}.card svg{width:100%;height:420px}.rank{color:#a98245;font-weight:800;letter-spacing:.12em}p{color:#6e6a63;line-height:1.5}</style></head><body><h1>Shape Hunt Review Board</h1><p>${new Date().toLocaleString()}</p><div class="grid">${cards}</div></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `shape-hunt-review-board-${new Date().toISOString().slice(0, 10)}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function downloadObject(object, name) {
    const blob = new Blob([JSON.stringify(object, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function patchRender() {
    if (window.__shapeHuntExtensionsPatched) return;
    window.__shapeHuntExtensionsPatched = true;
    const originalRender = render;
    render = function renderWithExtensions() {
      originalRender();
      document.body.classList.toggle('brutal-mode', Boolean(state.settings.brutalMode));
      if (state.view === 'map') {
        q('#mapView')?.classList.add('active');
        q('#viewTitle').textContent = 'See the taste field.';
        renderShapeMap();
      }
      if (state.view === 'review') {
        q('#reviewView')?.classList.add('active');
        q('#viewTitle').textContent = 'Turn saved forms into a review board.';
        renderReviewBoard();
      }
      renderTastePanel();
    };
  }

  function boot() {
    installControls();
    installViews();
    patchRender();
    render();
  }

  boot();
})();