/* Grammar v2: distinct modern cultural silhouette grammars, softened for pressed steel/enamel. */
(function installGrammarV2() {
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const SIZE_SET = [120, 240, 330];
  const PER_CATEGORY = 500;

  const GRAMMARS = [
    { id: 'slavic-modern', short: 'SLA', name: 'Slavic Modern', type: 'slavic', desc: 'grounded heirloom warmth; ritual table presence without folk literalism', base: { h: 80, base: 78, rim: 102, belly: .70, waist: .34, foot: .78, lip: .44, shoulder: .52, quiet: .60, handle: .58 } },
    { id: 'viking-nordic-modern', short: 'NOR', name: 'Viking / Nordic Modern', type: 'nordic', desc: 'low gravity, honest mass, broad stability, northern restraint', base: { h: 78, base: 84, rim: 98, belly: .42, waist: .18, foot: .62, lip: .30, shoulder: .32, quiet: .82, handle: .42 } },
    { id: 'japan-modern', short: 'JPN', name: 'Japan Modern', type: 'japan', desc: 'quiet low bowl-cup, precise foot, controlled rim', base: { h: 72, base: 74, rim: 104, belly: .30, waist: .12, foot: .48, lip: .26, shoulder: .22, quiet: .92, handle: .34 } },
    { id: 'classic-modern', short: 'CLA', name: 'Classic Modern', type: 'classic', desc: 'balanced table cup, familiar but not generic', base: { h: 82, base: 76, rim: 102, belly: .48, waist: .32, foot: .56, lip: .42, shoulder: .42, quiet: .68, handle: .50 } },
    { id: 'french-modern', short: 'FRA', name: 'French Modern', type: 'french', desc: 'restrained salon tulip, lifted rim, elegant tension', base: { h: 84, base: 72, rim: 108, belly: .40, waist: .54, foot: .54, lip: .70, shoulder: .60, quiet: .46, handle: .64 } },
    { id: 'italian-modern', short: 'ITA', name: 'Italian Modern', type: 'italian', desc: 'cafe warmth, cappuccino softness, generous but controlled rim', base: { h: 78, base: 76, rim: 110, belly: .66, waist: .38, foot: .48, lip: .60, shoulder: .66, quiet: .46, handle: .62 } }
  ];

  const VARIANTS = [
    { id: 'A', name: 'Signature', desc: 'primary DNA', map: (s) => ({ ...s }) },
    { id: 'B', name: 'Pressed Soft', desc: 'larger radii, safer draw', map: (s) => ({ ...s, waist: s.waist * .72, lip: s.lip * .82, shoulder: s.shoulder * .82, quiet: clamp(s.quiet + .10, 0, 1), steel: clamp((s.steel || .84) + .10, 0, 1) }) },
    { id: 'C', name: 'Table Hero', desc: 'stronger table signature', map: (s) => ({ ...s, foot: clamp(s.foot * 1.08 + .05, 0, 1), lip: clamp(s.lip * 1.04, 0, 1), handle: clamp((s.handle || .5) + .06, 0, 1), quiet: clamp(s.quiet - .04, 0, 1) }) }
  ];

  const TAGS = ['slavic modern', 'nordic restraint', 'japan quiet', 'classic balance', 'french elegance', 'italian warmth', 'pressed steel safe', 'too angular', 'too sharp for enamel', 'handle works', 'handle too heavy', 'child handles good', 'three-size family works'];

  function installCategories() {
    archetypes.splice(0, archetypes.length, ...GRAMMARS.map((g) => ({ id: g.id, name: g.name, description: g.desc, bias: g.base })));
    const select = q('#archetypeFilter');
    if (select) {
      select.innerHTML = '<option value="all">All modern categories</option>';
      GRAMMARS.forEach((g) => {
        const option = document.createElement('option');
        option.value = g.id;
        option.textContent = g.name;
        select.appendChild(option);
      });
      if (!GRAMMARS.some((g) => g.id === state.settings.archetype)) state.settings.archetype = 'all';
      select.value = state.settings.archetype;
      save();
    }
  }

  function installControls() {
    const density = q('#densityRange');
    const label = q('label[for="densityRange"]');
    const readout = q('.range-readout');
    state.settings.perCategory = Number(state.settings.perCategory || PER_CATEGORY);
    if (density) {
      density.min = '100'; density.max = '700'; density.step = '50'; density.value = state.settings.perCategory;
      density.addEventListener('input', (event) => {
        state.settings.perCategory = Number(event.target.value);
        state.settings.density = Number(event.target.value);
        q('#densityValue').textContent = event.target.value;
        save();
      });
    }
    if (label) label.textContent = 'Per category batch';
    if (readout) readout.innerHTML = `<span id="densityValue">${state.settings.perCategory}</span> silhouettes / category`;
    if (!q('#generateGrammarBtn')) {
      const button = document.createElement('button');
      button.id = 'generateGrammarBtn';
      button.className = 'secondary';
      button.textContent = 'Generate 500 / category';
      button.addEventListener('click', () => generateBatch(Number(state.settings.perCategory || PER_CATEGORY)));
      q('.sidebar-actions')?.prepend(button);
    }
    if (!q('#cultureNote')) {
      const note = document.createElement('p');
      note.id = 'cultureNote';
      note.className = 'culture-note';
      note.textContent = 'Grammar v2: each category uses a different profile grammar. Forms are softened for pressed steel, not sharp ceramic fantasy.';
      q('#archetypeFilter')?.closest('.control-block')?.appendChild(note);
    }
  }

  function extendTags() {
    TAGS.forEach((tag) => { if (!critiqueTags.includes(tag)) critiqueTags.push(tag); });
  }

  function tastePull(key, fallback) {
    const selected = state.shapes.filter((s) => state.decisions[s.id]?.saved || state.decisions[s.id]?.rating === 'good');
    if (selected.length < 8) return fallback;
    const avg = selected.reduce((sum, s) => sum + Number(s[key] || fallback), 0) / selected.length;
    return fallback + (avg - fallback) * .18;
  }

  function makeShape(id, grammar, r, over = {}) {
    const b = grammar.base;
    const s = {
      id,
      archetypeId: grammar.id,
      archetypeName: grammar.name,
      archetypeDescription: grammar.desc,
      grammarType: grammar.type,
      geometryVersion: 'grammar-v2-soft-pressed-steel',
      height: clamp(tastePull('height', b.h) + jit(r, 9), 58, 100),
      base: clamp(tastePull('base', b.base) + jit(r, 7), 56, 94),
      rim: clamp(tastePull('rim', b.rim) + jit(r, 9), 82, 122),
      belly: clamp(tastePull('belly', b.belly) + jit(r, .16), .04, .90),
      waist: clamp(tastePull('waist', b.waist) + jit(r, .15), 0, .78),
      foot: clamp(tastePull('foot', b.foot) + jit(r, .14), .08, .95),
      lip: clamp(tastePull('lip', b.lip) + jit(r, .15), .04, .88),
      shoulder: clamp(tastePull('shoulder', b.shoulder) + jit(r, .16), .04, .88),
      quiet: clamp(b.quiet + jit(r, .13), .22, .98),
      handle: clamp(b.handle + jit(r, .18), .10, .92),
      steel: clamp(.80 + b.quiet * .12 + jit(r, .08), .58, .98),
      ...over
    };
    // Guardrails against sharp steel/enamel transitions.
    if (s.waist > .62 && s.lip > .66) s.waist *= .84;
    if (s.foot > .84 && s.waist > .54) s.foot *= .94;
    if (s.belly > .78 && s.rim > 114) s.belly *= .92;
    if (s.height / Math.max(1, s.rim) > 1.04) s.height *= .96;
    return enrich(s);
  }

  function anchor(grammar) {
    const b = grammar.base;
    return enrich({ id: `${grammar.short}_ANCHOR`, archetypeId: grammar.id, archetypeName: grammar.name, archetypeDescription: grammar.desc, grammarType: grammar.type, geometryVersion: 'grammar-v2-soft-pressed-steel', height: b.h, base: b.base, rim: b.rim, belly: b.belly, waist: b.waist, foot: b.foot, lip: b.lip, shoulder: b.shoulder, quiet: b.quiet, handle: b.handle, steel: .92 });
  }

  function shapeForSize(shape, ml) {
    const ratio = {
      120: { height: .62, base: .83, rim: .77, belly: .68, waist: .42, foot: 1.15, lip: .70, shoulder: .64, handle: 1.14, quiet: .06, steel: .08 },
      240: { height: .82, base: .93, rim: .91, belly: .82, waist: .66, foot: 1.07, lip: .84, shoulder: .82, handle: 1.06, quiet: .03, steel: .05 },
      330: { height: 1, base: 1, rim: 1, belly: 1, waist: 1, foot: 1, lip: 1, shoulder: 1, handle: 1, quiet: 0, steel: 0 }
    }[ml] || { height: 1, base: 1, rim: 1, belly: 1, waist: 1, foot: 1, lip: 1, shoulder: 1, handle: 1, quiet: 0, steel: 0 };
    return { ...shape, id: `${shape.id}_${ml}`, height: shape.height * ratio.height, base: shape.base * ratio.base, rim: shape.rim * ratio.rim, belly: clamp(shape.belly * ratio.belly, 0, 1), waist: clamp(shape.waist * ratio.waist, 0, 1), foot: clamp(shape.foot * ratio.foot, 0, 1), lip: clamp(shape.lip * ratio.lip, 0, 1), shoulder: clamp(shape.shoulder * ratio.shoulder, 0, 1), handle: clamp((shape.handle || .5) * ratio.handle, 0, 1), quiet: clamp(shape.quiet + ratio.quiet, 0, 1), steel: clamp((shape.steel || .82) + ratio.steel, 0, 1) };
  }

  familyAdapt = function familyAdaptGrammar(shape, ml) {
    return enrich(shapeForSize(shape, ml));
  };

  function profile(shape, ml = 330) {
    const s = ml === 330 ? shape : shapeForSize(shape, ml);
    const h = s.height, b = s.base / 2, rim = s.rim / 2;
    const belly = lerp(.8, 8.0, s.belly), waist = lerp(0, 4.8, s.waist), foot = lerp(.7, 4.8, s.foot), lip = lerp(.2, 5.4, s.lip), sh = lerp(.1, 4.8, s.shoulder);
    let pts;
    if (s.grammarType === 'slavic') pts = [[0,b],[.055,b-foot*.42],[.155,b+foot*.62],[.335,lerp(b,rim,.32)+belly*.34],[.505,lerp(b,rim,.48)+belly*.18-waist],[.735,lerp(b,rim,.76)+belly*.36+sh*.45],[.925,rim+lip*.14],[1,rim+lip*.38]];
    else if (s.grammarType === 'nordic') pts = [[0,b],[.07,b-foot*.20],[.23,b+belly*.40],[.47,lerp(b,rim,.44)+belly*.16],[.72,lerp(b,rim,.72)+belly*.10],[.93,rim+lip*.10],[1,rim+lip*.24]];
    else if (s.grammarType === 'japan') pts = [[0,b*.96],[.06,b-foot*.30],[.175,b+foot*.16],[.365,lerp(b,rim,.34)+belly*.18],[.61,lerp(b,rim,.66)+belly*.10-waist*.32],[.85,lerp(b,rim,.93)+belly*.05],[1,rim+lip*.20]];
    else if (s.grammarType === 'french') pts = [[0,b*.98],[.065,b-foot*.36],[.18,b+foot*.34],[.39,lerp(b,rim,.36)+sh*.10-waist*.55],[.61,lerp(b,rim,.60)+sh*.35-waist*.28],[.80,lerp(b,rim,.84)+sh*.62],[.93,rim+lip*.28],[1,rim+lip*.56]];
    else if (s.grammarType === 'italian') pts = [[0,b],[.06,b-foot*.24],[.15,b+foot*.18],[.315,lerp(b,rim,.34)+belly*.42],[.52,lerp(b,rim,.50)+belly*.22-waist*.38],[.73,lerp(b,rim,.74)+belly*.28+sh*.40],[.905,rim+lip*.22],[1,rim+lip*.42]];
    else pts = [[0,b],[.07,b-foot*.34],[.175,b+foot*.38],[.385,lerp(b,rim,.38)+belly*.30],[.56,lerp(b,rim,.54)+belly*.12-waist],[.76,lerp(b,rim,.78)+belly*.18+sh*.42],[.925,rim+lip*.12],[1,rim+lip*.30]];
    return pts.map(([y, r]) => ({ y: y * h, r: Math.max(10, r) })).sort((a, b) => a.y - b.y);
  }

  function angularRisk(points, shape) {
    let risk = 0;
    for (let i = 1; i < points.length - 1; i++) {
      const a = points[i - 1], b = points[i], c = points[i + 1];
      const s1 = (b.r - a.r) / Math.max(1, b.y - a.y);
      const s2 = (c.r - b.r) / Math.max(1, c.y - b.y);
      risk += Math.min(1, Math.abs(s2 - s1) * 3.2);
    }
    risk /= Math.max(1, points.length - 2);
    risk += Math.max(0, shape.waist - .62) * .25 + Math.max(0, shape.lip - .76) * .20 + Math.max(0, .32 - shape.quiet) * .20;
    return clamp(risk, 0, 1);
  }

  function camping(shape, hToRim) {
    const weak = clamp((.30 - shape.foot) / .30, 0, 1);
    const cyl = clamp((.16 - Math.abs((shape.rim - shape.base) / Math.max(1, shape.rim))) / .16, 0, 1);
    const tall = clamp((hToRim - 1.02) / .32, 0, 1);
    const dead = clamp((.18 - shape.waist) / .18, 0, 1) * clamp((.28 - shape.belly) / .28, 0, 1);
    return clamp(weak * .34 + cyl * .22 + tall * .24 + dead * .20, 0, 1);
  }

  enrich = function enrichGrammar(shape) {
    const pts = profile(shape, 330), h = shape.height, hToRim = h / Math.max(1, shape.rim), stability = shape.base / Math.max(1, h);
    const radii = pts.map((p) => p.r), maxD = Math.max(...radii) * 2;
    const mid = pts.filter((p) => p.y > h * .25 && p.y < h * .72).map((p) => p.r);
    const minMid = (mid.length ? Math.min(...mid) : shape.base / 2) * 2;
    const waistSignal = clamp((maxD - minMid) / Math.max(1, maxD), 0, 1);
    const angular = angularRisk(pts, shape), camp = camping(shape, hToRim), press = clamp(1 - angular * .72 - camp * .20, 0, 1);
    const table = clamp((1 - Math.abs(hToRim - .82) / .42) * .28 + clamp((stability - .68) / .38, 0, 1) * .28 + shape.foot * .24 + shape.quiet * .20, 0, 1);
    const soul = clamp(waistSignal * .25 + shape.foot * .22 + shape.lip * .18 + shape.belly * .22 + (1 - Math.abs(shape.quiet - .58)) * .13, 0, 1);
    const fam = clamp(Math.max(0, shape.lip - .76) * .30 + Math.max(0, shape.waist - .68) * .32 + Math.max(0, shape.belly - .82) * .22 + Math.max(0, .70 - stability) * .24, 0, 1);
    return { ...shape, hToRim: rnd(hToRim, 2), stability: rnd(stability, 2), tableScore: rnd(table, 2), soulScore: rnd(soul, 2), campingRisk: rnd(camp, 2), familyRisk: rnd(fam, 2), angularRisk: rnd(angular, 2), pressSafeScore: rnd(press, 2), massProxy: Math.round(h * (shape.base + shape.rim) * .0102 + shape.foot * 10 + shape.belly * 9 + shape.handle * 5), recommendation: rnd(table * .28 + soul * .30 + press * .26 + (1 - camp) * .10 + (1 - fam) * .06, 3) };
  };

  function catmull(points, side, opt = {}) {
    const scale = opt.scale || 1, top = opt.top || 16, k = 2.25 * scale, cx = 90, h = Math.max(...points.map((p) => p.y));
    const mapped = points.map((p) => ({ x: cx + side * p.r * k, y: top + (h - p.y) * k }));
    const tension = .82, out = [`M ${mapped[0].x.toFixed(1)},${mapped[0].y.toFixed(1)}`];
    for (let i = 0; i < mapped.length - 1; i++) {
      const p0 = mapped[Math.max(0, i - 1)], p1 = mapped[i], p2 = mapped[i + 1], p3 = mapped[Math.min(mapped.length - 1, i + 2)];
      const c1 = { x: p1.x + (p2.x - p0.x) / 6 * tension, y: p1.y + (p2.y - p0.y) / 6 * tension };
      const c2 = { x: p2.x - (p3.x - p1.x) / 6 * tension, y: p2.y - (p3.y - p1.y) / 6 * tension };
      out.push(`C ${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`);
    }
    return out.join(' ');
  }

  path = function grammarPath(shape, opt = {}) {
    const pts = profile(shape, opt.familySize || 330);
    return `${catmull(pts, 1, opt)} ${catmull([...pts].reverse(), -1, opt).replace(/^M /, 'L ')} Z`;
  };

  function handlePath(shape, opt = {}, side = 1) {
    const ml = opt.familySize || 330, s = ml === 330 ? shape : shapeForSize(shape, ml), pts = profile(shape, ml);
    const scale = opt.scale || 1, top = opt.top || 16, k = 2.25 * scale, cx = 90, h = Math.max(...pts.map((p) => p.y));
    const maxR = Math.max(...pts.filter((p) => p.y > h * .30 && p.y < h * .75).map((p) => p.r));
    const energy = Number(s.handle || .52), yTop = top + (h - h * (ml <= 240 ? .66 : .69)) * k, yBottom = top + (h - h * (ml <= 240 ? .33 : .35)) * k, yMid = (yTop + yBottom) / 2;
    const xInner = cx + side * (maxR * k + 2), outer = (14 + energy * 16 + (ml <= 240 ? 7 : 3)) * scale, xOuter = xInner + side * outer, xHole = xInner + side * Math.max(7, outer * .45), soft = 6 * scale;
    const outerPath = `M ${xInner.toFixed(1)},${yTop.toFixed(1)} C ${xOuter.toFixed(1)},${(yTop - soft).toFixed(1)} ${xOuter.toFixed(1)},${(yBottom + soft).toFixed(1)} ${xInner.toFixed(1)},${yBottom.toFixed(1)} C ${(xInner + side * 5).toFixed(1)},${(yMid + 4).toFixed(1)} ${(xInner + side * 5).toFixed(1)},${(yMid - 4).toFixed(1)} ${xInner.toFixed(1)},${yTop.toFixed(1)}`;
    const innerPath = `M ${(xInner + side * 5).toFixed(1)},${(yTop + 9 * scale).toFixed(1)} C ${xHole.toFixed(1)},${(yTop + 4 * scale).toFixed(1)} ${xHole.toFixed(1)},${(yBottom - 4 * scale).toFixed(1)} ${(xInner + side * 5).toFixed(1)},${(yBottom - 9 * scale).toFixed(1)} C ${(xInner + side * 10).toFixed(1)},${(yMid + 1).toFixed(1)} ${(xInner + side * 10).toFixed(1)},${(yMid - 1).toFixed(1)} ${(xInner + side * 5).toFixed(1)},${(yTop + 9 * scale).toFixed(1)}`;
    return `${outerPath} Z ${innerPath} Z`;
  }

  function handles(shape, opt = {}) {
    const ml = opt.familySize || 330, sides = ml <= 240 ? [-1, 1] : [1];
    return sides.map((side) => `<path d="${handlePath(shape, opt, side)}" fill="currentColor" fill-rule="evenodd" class="handle-path"/>`).join('');
  }

  svg = function grammarSvg(shape, opt = {}) {
    const vb = opt.large ? '0 0 180 260' : '0 0 180 236', ty = opt.large ? 239 : 225, ml = opt.familySize || 330, ad = ml === 330 ? shape : familyAdapt(shape, ml);
    const bodyOnly = Boolean(opt.bodyOnly) || document.body.classList.contains('brutal-mode');
    const cap = opt.large ? `<text x="90" y="254" text-anchor="middle" class="svg-caption">H ${Math.round(ad.height)} · base ${Math.round(ad.base)} · rim ${Math.round(ad.rim)} · press ${Math.round((ad.pressSafeScore || .8) * 100)}</text>` : '';
    return `<svg viewBox="${vb}" role="img" aria-label="${shape.id} silhouette"><line x1="24" x2="156" y1="${ty}" y2="${ty}" class="table-line"/>${bodyOnly ? '' : handles(shape, opt)}<path d="${path(shape, opt)}" fill="currentColor" class="body-path"/>${cap}</svg>`;
  };

  designerRead = function grammarRead(shape) {
    const notes = [shape.archetypeName];
    if (shape.pressSafeScore > .78) notes.push('soft enough for pressed steel');
    if (shape.angularRisk > .42) notes.push('watch angularity for enamel');
    if (shape.tableScore > .74) notes.push('strong table presence');
    if (shape.soulScore > .74) notes.push('controlled soul');
    if (shape.foot > .70) notes.push('signature foot shadow');
    if (shape.lip > .68) notes.push('expressive rim');
    if (shape.belly > .70) notes.push('warm family belly');
    if (shape.campingRisk > .55) notes.push('camping warning');
    return `${notes.join(' · ')}.`;
  };

  function variantShape(shape, variant) {
    return enrich({ ...variant.map(shape), id: `${shape.id}_${variant.id}` });
  }

  function familyCard(shape, ml, variant) {
    const v = variantShape(shape, variant), ad = familyAdapt(v, ml);
    return `<article class="cup-variant-card"><div class="cup-variant-head"><strong>${ml} ml · ${variant.id}</strong><span>${variant.name}</span></div><div class="cup-variant-art">${svg(v, { familySize: ml, scale: ml === 120 ? 1.10 : ml === 330 ? .92 : 1.00 })}</div><p class="meta">H ${Math.round(ad.height)} · base ${Math.round(ad.base)} · rim ${Math.round(ad.rim)} · ${ml <= 240 ? '2 handles' : '1 handle'}</p><p class="risk ${ad.angularRisk > .44 || ad.familyRisk > .55 ? 'warn' : ''}">${variant.desc} · press ${Math.round((ad.pressSafeScore || .8) * 100)}</p></article>`;
  }

  renderFamily = function familyMatrix() {
    const mount = q('#familyBoard');
    const saved = state.shapes.filter((s) => state.decisions[s.id]?.saved || state.decisions[s.id]?.rating === 'good').sort((a, b) => b.recommendation - a.recommendation).slice(0, 12);
    if (!saved.length) { mount.innerHTML = empty('Save or mark Good candidates first.', 'Family Matrix will show 3 variants × 3 sizes: 120 / 240 / 330, with handles included.'); return; }
    mount.innerHTML = '';
    saved.forEach((shape) => {
      const section = document.createElement('section');
      section.className = 'family-row cup-matrix-row';
      section.innerHTML = `<div class="family-header"><div><div class="eyebrow">${shape.archetypeName}</div><h3>${shape.id}</h3><p class="meta">3 variants × 3 sizes. 120/240 include two handles; 330 includes one handle.</p></div><div class="matrix-actions"><button class="secondary" data-more>More like this</button><button class="ghost" data-focus>Focus</button></div></div><div class="cup-matrix">${SIZE_SET.map((ml) => `<div class="cup-size-column"><h4>${ml} ml</h4>${VARIANTS.map((variant) => familyCard(shape, ml, variant)).join('')}</div>`).join('')}</div>`;
      q('[data-more]', section).addEventListener('click', () => moreLike(shape));
      q('[data-focus]', section).addEventListener('click', () => openFocus(state.shapes.indexOf(shape)));
      mount.appendChild(section);
    });
  };

  generateBatch = function grammarBatch(n = state.settings.perCategory || PER_CATEGORY) {
    const perCategory = Number(n || PER_CATEGORY), selected = state.settings.archetype || q('#archetypeFilter')?.value || 'all', categories = selected === 'all' ? GRAMMARS : GRAMMARS.filter((g) => g.id === selected), r = rng(state.seed++), out = [];
    categories.forEach((g) => { out.push(anchor(g)); for (let i = 0; i < perCategory; i++) out.push(makeShape(`${g.short}_${String(i + 1).padStart(4, '0')}`, g, r)); });
    state.shapes = out; state.settings.perCategory = perCategory; state.settings.density = perCategory; state.settings.geometryVersion = 'grammar-v2-soft-pressed-steel'; persistShapes(); state.focusIndex = 0; render(); toast(`Generated ${out.length} silhouettes from ${categories.length} grammar${categories.length === 1 ? '' : 's'}`);
  };

  moreLike = function grammarMore(shape, n = 240) {
    const grammar = GRAMMARS.find((g) => g.id === shape.archetypeId) || GRAMMARS[3], r = rng(Math.floor(Math.random() * 999999)), out = [];
    for (let i = 0; i < n; i++) {
      const t = i < n * .60 ? .10 : .22;
      out.push(makeShape(`M_${shape.id}_${String(i + 1).padStart(3, '0')}`, grammar, r, { h: clamp(shape.height + jit(r, 18 * t), 58, 100), base: clamp(shape.base + jit(r, 18 * t), 56, 94), rim: clamp(shape.rim + jit(r, 20 * t), 82, 122), belly: clamp(shape.belly + jit(r, .40 * t), .04, .90), waist: clamp(shape.waist + jit(r, .36 * t), 0, .78), foot: clamp(shape.foot + jit(r, .38 * t), .08, .95), lip: clamp(shape.lip + jit(r, .38 * t), .04, .88), shoulder: clamp(shape.shoulder + jit(r, .40 * t), .04, .88), quiet: clamp(shape.quiet + jit(r, .30 * t), .22, .98), handle: clamp((shape.handle || grammar.base.handle) + jit(r, .36 * t), .10, .92), steel: clamp((shape.steel || .82) + jit(r, .20 * t), .58, .98) }));
    }
    setDecision(shape.id, { moreLike: (state.decisions[shape.id]?.moreLike || 0) + 1, saved: true }); addHistory(shape.id, 'more-like-this-grammar', { n, grammar: grammar.id }); state.shapes = out.concat(state.shapes.filter((s) => s.id !== shape.id)); persistShapes(); state.view = 'gallery'; closeFocus(); render(); toast(`Generated ${n} ${grammar.name} variations`);
  };

  function patchRender() {
    if (window.__grammarV2Patched) return;
    window.__grammarV2Patched = true;
    const original = render;
    render = function renderGrammar() {
      original();
      if (state.view === 'family') { q('#familyView')?.classList.add('active'); q('#viewTitle').textContent = 'Build a three-size cup family.'; renderFamily(); }
    };
  }

  function updateCopy() {
    const title = q('#familyView .section-intro h3'), intro = q('#familyView .section-intro p');
    if (title) title.textContent = 'Family Matrix';
    if (intro) intro.textContent = 'Saved or Good DNA expanded into 3 variants for 3 primary sizes: 120 / 240 / 330, with handles included.';
  }

  function boot() {
    installCategories(); installControls(); extendTags(); updateCopy(); patchRender();
    const hasV2 = state.shapes.some((s) => s.geometryVersion === 'grammar-v2-soft-pressed-steel');
    if (!hasV2 || state.settings.geometryVersion !== 'grammar-v2-soft-pressed-steel') { state.settings.perCategory = Number(state.settings.perCategory || PER_CATEGORY); state.settings.geometryVersion = 'grammar-v2-soft-pressed-steel'; save(); generateBatch(state.settings.perCategory); }
    else { state.shapes = state.shapes.map(enrich); render(); }
  }

  boot();
})();