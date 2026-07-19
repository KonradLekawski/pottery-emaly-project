/* Cultural geometry engine for Shape Hunt.
   Purpose: softer pressed-steel silhouettes, 500-per-category batches, 3x3 family variant matrix with handles. */
(function installCulturalGeometryEngine() {
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const CULTURAL_ARCHETYPES = [
    {
      id: 'slavic-modern',
      name: 'Slavic Modern',
      description: 'warm heirloom body, grounded foot, soft ritual table presence; no folk literalism',
      bias: { height: .44, base: .62, rim: .56, belly: .66, waist: .38, foot: .70, lip: .48, shoulder: .52, quiet: .58, handle: .54 }
    },
    {
      id: 'viking-nordic-modern',
      name: 'Viking / Nordic Modern',
      description: 'low gravity, honest mass, restrained northern softness, broad stability',
      bias: { height: .40, base: .76, rim: .48, belly: .50, waist: .24, foot: .58, lip: .34, shoulder: .36, quiet: .78, handle: .42 }
    },
    {
      id: 'japan-modern',
      name: 'Japan Modern',
      description: 'quiet, low, precise, wabi-soft profile with very controlled rim and shadow foot',
      bias: { height: .34, base: .58, rim: .50, belly: .34, waist: .18, foot: .46, lip: .28, shoulder: .26, quiet: .88, handle: .34 }
    },
    {
      id: 'classic-modern',
      name: 'Classic Modern',
      description: 'balanced table cup, calm proportions, soft foot, familiar but not generic',
      bias: { height: .52, base: .58, rim: .56, belly: .46, waist: .34, foot: .56, lip: .44, shoulder: .44, quiet: .66, handle: .50 }
    },
    {
      id: 'french-modern',
      name: 'French Modern',
      description: 'elegant tulip restraint, lifted rim, salon table energy without porcelain imitation',
      bias: { height: .56, base: .48, rim: .68, belly: .42, waist: .52, foot: .54, lip: .70, shoulder: .58, quiet: .48, handle: .60 }
    },
    {
      id: 'italian-modern',
      name: 'Italian Modern',
      description: 'warm cappuccino/cafe softness, generous rim, sensual belly, still table-safe',
      bias: { height: .46, base: .56, rim: .66, belly: .62, waist: .42, foot: .50, lip: .60, shoulder: .64, quiet: .44, handle: .58 }
    }
  ];

  const CULTURAL_TAGS = [
    'slavic modern',
    'nordic restraint',
    'japan quiet',
    'classic balance',
    'french elegance',
    'italian warmth',
    'pressed steel safe',
    'too angular',
    'too sharp for enamel',
    'handle works',
    'handle too heavy',
    'child handles good',
    'three-size family works'
  ];

  const SIZE_SET = [120, 240, 330];
  const VARIANTS = [
    {
      id: 'A',
      name: 'Signature',
      description: 'core DNA',
      transform: (s) => ({ ...s })
    },
    {
      id: 'B',
      name: 'Softer Pressed',
      description: 'smoother steel draw',
      transform: (s) => ({
        ...s,
        waist: clamp(s.waist * .78, 0, 1),
        lip: clamp(s.lip * .86, .02, 1),
        foot: clamp(s.foot * .90 + .05, 0, 1),
        belly: clamp(s.belly * .94, .02, 1),
        shoulder: clamp(s.shoulder * .86, .02, 1),
        quiet: clamp(s.quiet * .92 + .08, .05, 1)
      })
    },
    {
      id: 'C',
      name: 'Table Hero',
      description: 'more table presence',
      transform: (s) => ({
        ...s,
        foot: clamp(s.foot * 1.08 + .04, 0, 1),
        lip: clamp(s.lip * 1.07, .02, 1),
        waist: clamp(s.waist * 1.05, 0, 1),
        base: clamp(s.base * 1.02, 54, 96),
        rim: clamp(s.rim * 1.01, 80, 128),
        quiet: clamp(s.quiet * .94, .05, 1)
      })
    }
  ];

  function installCulturalArchetypes() {
    if (!Array.isArray(archetypes)) return;
    archetypes.splice(0, archetypes.length, ...CULTURAL_ARCHETYPES);
    const select = q('#archetypeFilter');
    if (select) {
      select.innerHTML = '<option value="all">All modern cultural categories</option>';
      CULTURAL_ARCHETYPES.forEach((archetype) => {
        const option = document.createElement('option');
        option.value = archetype.id;
        option.textContent = archetype.name;
        select.appendChild(option);
      });
      select.value = state.settings.archetype && CULTURAL_ARCHETYPES.some((a) => a.id === state.settings.archetype)
        ? state.settings.archetype
        : 'all';
      state.settings.archetype = select.value;
      save();
    }
  }

  function installCulturalControls() {
    const density = q('#densityRange');
    const densityLabel = q('label[for="densityRange"]');
    const densityValue = q('#densityValue');
    if (density) {
      density.min = '100';
      density.max = '700';
      density.step = '50';
      if (!state.settings.perCategory) state.settings.perCategory = 500;
      density.value = state.settings.perCategory;
      if (densityValue) densityValue.textContent = state.settings.perCategory;
      density.addEventListener('input', (event) => {
        state.settings.perCategory = Number(event.target.value);
        state.settings.density = Number(event.target.value);
        if (densityValue) densityValue.textContent = event.target.value;
        save();
      });
    }
    if (densityLabel) densityLabel.textContent = 'Per category batch';
    const readout = q('.range-readout');
    if (readout) readout.innerHTML = '<span id="densityValue">' + (state.settings.perCategory || 500) + '</span> silhouettes / selected category';

    if (!q('#generateCulturalBtn')) {
      const host = q('.sidebar-actions');
      const button = document.createElement('button');
      button.id = 'generateCulturalBtn';
      button.className = 'secondary';
      button.textContent = 'Generate 500 / category';
      button.addEventListener('click', () => generateBatch(Number(state.settings.perCategory || 500)));
      host?.prepend(button);
    }

    if (!q('#cultureNote')) {
      const note = document.createElement('p');
      note.id = 'cultureNote';
      note.className = 'culture-note';
      note.textContent = 'Modernized categories: Slavic, Viking/Nordic, Japan, Classic, French, Italian. Shapes are softened for pressed steel: fewer sharp transitions, calmer rims, larger implied radii.';
      q('#archetypeFilter')?.closest('.control-block')?.appendChild(note);
    }
  }

  function avgGoodOrSaved(key, fallback) {
    const selected = state.shapes.filter((shape) => state.decisions[shape.id]?.saved || state.decisions[shape.id]?.rating === 'good');
    if (!selected.length) return fallback;
    return selected.reduce((sum, shape) => sum + Number(shape[key] || fallback), 0) / selected.length;
  }

  function makeCulturalShape(id, archetype, r, over = {}) {
    const b = archetype.bias;
    const taste = {
      height: avgGoodOrSaved('height', lerp(72, 88, b.height)),
      base: avgGoodOrSaved('base', lerp(64, 84, b.base)),
      rim: avgGoodOrSaved('rim', lerp(90, 112, b.rim)),
      foot: avgGoodOrSaved('foot', b.foot),
      lip: avgGoodOrSaved('lip', b.lip),
      waist: avgGoodOrSaved('waist', b.waist)
    };
    const guided = state.history.length > 18 ? .18 : 0;

    const shape = {
      id,
      archetypeId: archetype.id,
      archetypeName: archetype.name,
      archetypeDescription: archetype.description,
      geometryVersion: 'cultural-soft-pressed-v1',
      culturalCategory: archetype.id,
      height: clamp(lerp(68, 91, b.height) + jit(r, 10) + (taste.height - lerp(68, 91, b.height)) * guided, 58, 98),
      base: clamp(lerp(62, 86, b.base) + jit(r, 8) + (taste.base - lerp(62, 86, b.base)) * guided, 58, 92),
      rim: clamp(lerp(88, 114, b.rim) + jit(r, 10) + (taste.rim - lerp(88, 114, b.rim)) * guided, 84, 120),
      belly: clamp(b.belly + jit(r, .20), .10, .86),
      waist: clamp(b.waist + jit(r, .18) + (taste.waist - b.waist) * guided, 0, .74),
      foot: clamp(b.foot + jit(r, .18) + (taste.foot - b.foot) * guided, .16, .92),
      lip: clamp(b.lip + jit(r, .18) + (taste.lip - b.lip) * guided, .08, .84),
      shoulder: clamp(b.shoulder + jit(r, .20), .08, .82),
      quiet: clamp(b.quiet + jit(r, .16), .26, .96),
      handle: clamp(b.handle + jit(r, .20), .12, .88),
      steelSoftness: clamp(.72 + b.quiet * .18 + jit(r, .10), .58, .96),
      ...over
    };

    // Pressed steel guardrails: soften extreme combinations before they render.
    if (shape.waist > .62 && shape.lip > .68) shape.waist *= .86;
    if (shape.foot > .84 && shape.waist > .55) shape.foot *= .92;
    if (shape.belly > .78 && shape.rim > 114) shape.belly *= .92;
    if (shape.height / Math.max(1, shape.rim) > 1.02) shape.height *= .96;

    return enrich(shape);
  }

  const previousEnrich = enrich;
  enrich = function enrichWithPressedSteel(shape) {
    const base = previousEnrich(shape);
    const angularRisk = clamp(
      Math.max(0, base.waist - .58) * .34 +
      Math.max(0, base.lip - .72) * .25 +
      Math.max(0, base.foot - .82) * .22 +
      Math.max(0, .32 - base.quiet) * .19,
      0,
      1
    );
    const pressSafeScore = clamp(1 - angularRisk * .78 - base.campingRisk * .22, 0, 1);
    return {
      ...base,
      angularRisk: rnd(angularRisk, 2),
      pressSafeScore: rnd(pressSafeScore, 2),
      recommendation: rnd(base.recommendation * .82 + pressSafeScore * .18, 3)
    };
  };

  generateBatch = function generateCulturalBatch(n = state.settings.perCategory || 500) {
    const selected = state.settings.archetype || q('#archetypeFilter')?.value || 'all';
    const perCategory = Number(n || 500);
    const r = rng(state.seed++);
    const categories = selected === 'all'
      ? CULTURAL_ARCHETYPES
      : CULTURAL_ARCHETYPES.filter((item) => item.id === selected);

    const out = [];
    categories.forEach((category) => {
      out.push(makeCulturalShape(`${category.id.toUpperCase()}_ANCHOR`, category, r, anchorFor(category)));
      for (let i = 0; i < perCategory; i += 1) {
        out.push(makeCulturalShape(`${category.id.slice(0, 3).toUpperCase()}_${String(i + 1).padStart(4, '0')}`, category, r));
      }
    });

    state.shapes = out;
    state.settings.geometryVersion = 'cultural-soft-pressed-v1';
    state.settings.perCategory = perCategory;
    state.settings.density = perCategory;
    persistShapes();
    state.focusIndex = 0;
    render();
    toast(`Generated ${out.length} soft pressed-steel silhouettes`);
  };

  function anchorFor(category) {
    const b = category.bias;
    return {
      height: clamp(lerp(68, 91, b.height), 58, 98),
      base: clamp(lerp(62, 86, b.base), 58, 92),
      rim: clamp(lerp(88, 114, b.rim), 84, 120),
      belly: b.belly,
      waist: b.waist,
      foot: b.foot,
      lip: b.lip,
      shoulder: b.shoulder,
      quiet: b.quiet,
      handle: b.handle,
      steelSoftness: .88
    };
  }

  moreLike = function moreLikeCultural(shape, n = 240) {
    const r = rng(Math.floor(Math.random() * 999999));
    const category = CULTURAL_ARCHETYPES.find((item) => item.id === shape.archetypeId) || CULTURAL_ARCHETYPES[0];
    const out = [];
    for (let i = 0; i < n; i += 1) {
      const tight = i < n * .58 ? .12 : .22;
      out.push(makeCulturalShape(`M_${shape.id}_${String(i + 1).padStart(3, '0')}`, category, r, {
        height: clamp(shape.height + jit(r, 18 * tight), 58, 100),
        base: clamp(shape.base + jit(r, 18 * tight), 56, 94),
        rim: clamp(shape.rim + jit(r, 20 * tight), 82, 122),
        belly: clamp(shape.belly + jit(r, .42 * tight), .08, .88),
        waist: clamp(shape.waist + jit(r, .38 * tight), 0, .76),
        foot: clamp(shape.foot + jit(r, .40 * tight), .12, .94),
        lip: clamp(shape.lip + jit(r, .40 * tight), .04, .86),
        shoulder: clamp(shape.shoulder + jit(r, .40 * tight), .04, .86),
        quiet: clamp(shape.quiet + jit(r, .32 * tight), .22, .98),
        handle: clamp((shape.handle ?? category.bias.handle) + jit(r, .38 * tight), .10, .92),
        steelSoftness: clamp((shape.steelSoftness ?? .82) + jit(r, .22 * tight), .56, .98)
      }));
    }

    setDecision(shape.id, { moreLike: (state.decisions[shape.id]?.moreLike || 0) + 1, saved: true });
    addHistory(shape.id, 'more-like-this-cultural', { n });
    state.shapes = out.concat(state.shapes.filter((item) => item.id !== shape.id));
    persistShapes();
    state.view = 'gallery';
    closeFocus();
    render();
    toast(`Generated ${n} softer variations around ${shape.id}`);
  };

  familyAdapt = function familyAdaptCultural(shape, ml) {
    const ratios = {
      120: { height: .62, base: .83, rim: .77, belly: .70, waist: .45, foot: 1.15, lip: .72, shoulder: .66, handle: 1.10 },
      240: { height: .82, base: .93, rim: .91, belly: .84, waist: .68, foot: 1.07, lip: .86, shoulder: .82, handle: 1.04 },
      330: { height: 1, base: 1, rim: 1, belly: 1, waist: 1, foot: 1, lip: 1, shoulder: 1, handle: 1 },
      440: { height: 1.14, base: 1.09, rim: 1.09, belly: 1.02, waist: .88, foot: .96, lip: 1.00, shoulder: 1.00, handle: 1.04 }
    }[ml] || { height: 1, base: 1, rim: 1, belly: 1, waist: 1, foot: 1, lip: 1, shoulder: 1, handle: 1 };

    return enrich({
      ...shape,
      id: `${shape.id}_${ml}`,
      height: shape.height * ratios.height,
      base: shape.base * ratios.base,
      rim: shape.rim * ratios.rim,
      belly: clamp(shape.belly * ratios.belly, 0, 1),
      waist: clamp(shape.waist * ratios.waist, 0, 1),
      foot: clamp(shape.foot * ratios.foot, 0, 1),
      lip: clamp(shape.lip * ratios.lip, 0, 1),
      shoulder: clamp(shape.shoulder * ratios.shoulder, 0, 1),
      handle: clamp((shape.handle ?? .5) * ratios.handle, 0, 1),
      steelSoftness: clamp((shape.steelSoftness ?? .82) + (ml <= 240 ? .06 : 0), .58, .98)
    });
  };

  function variantShape(shape, variantId) {
    const variant = VARIANTS.find((item) => item.id === variantId) || VARIANTS[0];
    return enrich({ ...variant.transform(shape), id: `${shape.id}_${variant.id}`, variantId: variant.id, variantName: variant.name });
  }

  geom = function geomCultural(shape, ml = 330) {
    const f = ml === 330 ? shape : familyAdapt(shape, ml);
    const h = f.height;
    const baseR = f.base / 2;
    const rimR = f.rim / 2;
    const softness = f.steelSoftness ?? .82;

    const undercut = lerp(.8, 4.8, f.foot) * lerp(.72, .42, softness);
    const footBead = lerp(.4, 3.2, f.foot) * lerp(.74, .92, softness);
    const belly = lerp(.8, 7.6, f.belly) * lerp(.82, .96, softness);
    const waist = lerp(0, 4.8, f.waist) * lerp(.78, .56, softness);
    const lip = lerp(.3, 5.0, f.lip) * lerp(.72, .58, softness);
    const shoulder = lerp(.2, 4.6, f.shoulder) * lerp(.76, .88, softness);

    const y0 = 0;
    const y1 = h * .070;
    const y2 = h * .190;
    const y3 = h * lerp(.40, .49, f.waist);
    const y4 = h * .670;
    const y5 = h * .895;
    const y6 = h;

    const r0 = Math.max(12, baseR);
    const r1 = Math.max(11, baseR - undercut);
    const r2 = Math.max(13, baseR + footBead);
    const r3 = Math.max(14, lerp(baseR, rimR, .42) + belly * .48 - waist);
    const r4 = Math.max(16, lerp(baseR, rimR, .72) + belly * .38 + shoulder);
    const r5 = Math.max(16, rimR + lip * .18);
    const r6 = Math.max(16, rimR + lip * .36);

    return { h, p: { y0, y1, y2, y3, y4, y5, y6, r0, r1, r2, r3, r4, r5, r6 } };
  };

  path = function pathCultural(shape, opt = {}) {
    const ml = opt.familySize || 330;
    const scale = opt.scale || 1;
    const { h, p } = geom(shape, ml);
    const cx = 90;
    const top = opt.top || 16;
    const k = 2.25 * scale;
    const P = (r, y) => `${(cx + r * k).toFixed(1)},${(top + (h - y) * k).toFixed(1)}`;
    const L = (r, y) => `${(cx - r * k).toFixed(1)},${(top + (h - y) * k).toFixed(1)}`;

    const c = (a, b) => (a + b) / 2;
    return [
      `M ${P(p.r0, p.y0)}`,
      `C ${P(p.r0, c(p.y0, p.y1))} ${P(p.r1, p.y0)} ${P(p.r1, p.y1)}`,
      `C ${P(p.r1, c(p.y1, p.y2))} ${P(p.r2, c(p.y1, p.y2))} ${P(p.r2, p.y2)}`,
      `C ${P(p.r2, c(p.y2, p.y3))} ${P(p.r3, c(p.y2, p.y3))} ${P(p.r3, p.y3)}`,
      `C ${P(p.r3, c(p.y3, p.y4))} ${P(p.r4, c(p.y3, p.y4))} ${P(p.r4, p.y4)}`,
      `C ${P(p.r4, c(p.y4, p.y5))} ${P(p.r5, c(p.y4, p.y5))} ${P(p.r5, p.y5)}`,
      `C ${P(p.r5, c(p.y5, p.y6))} ${P(p.r6, p.y5)} ${P(p.r6, p.y6)}`,
      `L ${L(p.r6, p.y6)}`,
      `C ${L(p.r6, p.y5)} ${L(p.r5, c(p.y5, p.y6))} ${L(p.r5, p.y5)}`,
      `C ${L(p.r5, c(p.y4, p.y5))} ${L(p.r4, c(p.y4, p.y5))} ${L(p.r4, p.y4)}`,
      `C ${L(p.r4, c(p.y3, p.y4))} ${L(p.r3, c(p.y3, p.y4))} ${L(p.r3, p.y3)}`,
      `C ${L(p.r3, c(p.y2, p.y3))} ${L(p.r2, c(p.y2, p.y3))} ${L(p.r2, p.y2)}`,
      `C ${L(p.r2, c(p.y1, p.y2))} ${L(p.r1, c(p.y1, p.y2))} ${L(p.r1, p.y1)}`,
      `C ${L(p.r1, p.y0)} ${L(p.r0, c(p.y0, p.y1))} ${L(p.r0, p.y0)}`,
      'Z'
    ].join(' ');
  };

  function handlePath(shape, opt = {}, side = 1) {
    const ml = opt.familySize || 330;
    const scale = opt.scale || 1;
    const f = ml === 330 ? shape : familyAdapt(shape, ml);
    const { h, p } = geom(shape, ml);
    const cx = 90;
    const top = opt.top || 16;
    const k = 2.25 * scale;
    const attachRadius = Math.max(p.r3, p.r4 * .94, p.r5 * .90);
    const xInner = cx + side * (attachRadius * k + 1.8);
    const yTop = top + (h - h * .68) * k;
    const yBottom = top + (h - h * .34) * k;
    const yMid = (yTop + yBottom) / 2;
    const handleEnergy = f.handle ?? .52;
    const outerW = (16 + handleEnergy * 15 + (ml <= 240 ? 7 : 3)) * scale;
    const innerW = Math.max(7, outerW * .47);
    const xOuter = xInner + side * outerW;
    const xHole = xInner + side * innerW;
    const topInset = (ml <= 240 ? 5 : 7) * scale;
    const bottomInset = (ml <= 240 ? 5 : 7) * scale;

    const outer = [
      `M ${xInner.toFixed(1)},${yTop.toFixed(1)}`,
      `C ${(xOuter).toFixed(1)},${(yTop - topInset).toFixed(1)} ${(xOuter).toFixed(1)},${(yBottom + bottomInset).toFixed(1)} ${xInner.toFixed(1)},${yBottom.toFixed(1)}`,
      `C ${(xInner + side * 5).toFixed(1)},${(yMid + 4).toFixed(1)} ${(xInner + side * 5).toFixed(1)},${(yMid - 4).toFixed(1)} ${xInner.toFixed(1)},${yTop.toFixed(1)}`
    ].join(' ');
    const inner = [
      `M ${(xInner + side * 5).toFixed(1)},${(yTop + 9 * scale).toFixed(1)}`,
      `C ${xHole.toFixed(1)},${(yTop + 4 * scale).toFixed(1)} ${xHole.toFixed(1)},${(yBottom - 4 * scale).toFixed(1)} ${(xInner + side * 5).toFixed(1)},${(yBottom - 9 * scale).toFixed(1)}`,
      `C ${(xInner + side * 10).toFixed(1)},${(yMid + 1).toFixed(1)} ${(xInner + side * 10).toFixed(1)},${(yMid - 1).toFixed(1)} ${(xInner + side * 5).toFixed(1)},${(yTop + 9 * scale).toFixed(1)}`
    ].join(' ');
    return `${outer} Z ${inner} Z`;
  }

  function handleMarkup(shape, opt = {}) {
    const ml = opt.familySize || 330;
    const sides = ml <= 240 ? [-1, 1] : [1];
    return sides.map((side) => `<path d="${handlePath(shape, opt, side)}" fill="currentColor" fill-rule="evenodd" class="handle-path"/>`).join('');
  }

  svg = function svgCultural(shape, opt = {}) {
    const vb = opt.large ? '0 0 180 260' : '0 0 180 236';
    const ty = opt.large ? 239 : 225;
    const ml = opt.familySize || 330;
    const ad = ml === 330 ? shape : familyAdapt(shape, ml);
    const bodyOnly = Boolean(opt.bodyOnly) || document.body.classList.contains('brutal-mode');
    const cap = opt.large
      ? `<text x="90" y="254" text-anchor="middle" class="svg-caption">H ${Math.round(ad.height)} · base ${Math.round(ad.base)} · rim ${Math.round(ad.rim)} · press ${Math.round((ad.pressSafeScore ?? .8) * 100)}</text>`
      : '';
    return `<svg viewBox="${vb}" role="img" aria-label="${shape.id} silhouette">
      <line x1="24" x2="156" y1="${ty}" y2="${ty}" class="table-line"/>
      ${bodyOnly ? '' : handleMarkup(shape, opt)}
      <path d="${path(shape, opt)}" fill="currentColor" class="body-path"/>
      ${cap}
    </svg>`;
  };

  designerRead = function designerReadCultural(shape) {
    const notes = [shape.archetypeName || 'modern table category'];
    if ((shape.pressSafeScore ?? 0) > .78) notes.push('pressed-steel safe softness');
    if ((shape.angularRisk ?? 0) > .44) notes.push('watch angularity for enamel');
    if (shape.tableScore > .76) notes.push('strong table presence');
    if (shape.soulScore > .76) notes.push('visible soul without shouting');
    if (shape.foot > .70) notes.push('signature foot shadow');
    if (shape.foot < .28) notes.push('weak foot: camping risk');
    if (shape.lip > .68) notes.push('expressive but still modern rim');
    if (shape.waist > .58) notes.push('clear waist tension');
    if (shape.belly > .70) notes.push('warm family belly');
    if (shape.campingRisk > .55) notes.push('camping drift warning');
    return notes.join(' · ') + '.';
  };

  function familyVariantCard(shape, ml, variant) {
    const v = variantShape(shape, variant.id);
    const ad = familyAdapt(v, ml);
    return `<article class="cup-variant-card">
      <div class="cup-variant-head">
        <strong>${ml} ml · ${variant.id}</strong>
        <span>${variant.name}</span>
      </div>
      <div class="cup-variant-art">${svg(v, { familySize: ml, scale: ml === 120 ? 1.10 : ml === 330 ? .92 : 1.00 })}</div>
      <p class="meta">H ${Math.round(ad.height)} · base ${Math.round(ad.base)} · rim ${Math.round(ad.rim)} · ${ml <= 240 ? '2 handles' : '1 handle'}</p>
      <p class="risk ${ad.angularRisk > .45 || ad.familyRisk > .55 ? 'warn' : ''}">${variant.description} · press ${Math.round((ad.pressSafeScore ?? .8) * 100)}</p>
    </article>`;
  }

  renderFamily = function renderFamilyMatrix() {
    const mount = q('#familyBoard');
    const saved = state.shapes
      .filter((shape) => state.decisions[shape.id]?.saved || state.decisions[shape.id]?.rating === 'good')
      .sort((a, b) => {
        const aw = state.decisions[a.id]?.tournamentWins || 0;
        const bw = state.decisions[b.id]?.tournamentWins || 0;
        return bw - aw || b.recommendation - a.recommendation;
      })
      .slice(0, 12);

    if (!saved.length) {
      mount.innerHTML = empty('Save or mark Good candidates first.', 'Family Check now builds 3 body variants across 3 primary sizes: 120 / 240 / 330, with handles included.');
      return;
    }

    mount.innerHTML = '';
    saved.forEach((shape) => {
      const section = document.createElement('section');
      section.className = 'family-row cup-matrix-row';
      section.innerHTML = `
        <div class="family-header">
          <div>
            <div class="eyebrow">${shape.archetypeName}</div>
            <h3>${shape.id}</h3>
            <p class="meta">3 variants × 3 sizes. 120/240 include two handles; 330 includes one handle.</p>
          </div>
          <div class="matrix-actions">
            <button class="secondary" data-more>More like this</button>
            <button class="ghost" data-focus>Focus</button>
          </div>
        </div>
        <div class="cup-matrix">
          ${SIZE_SET.map((ml) => `
            <div class="cup-size-column">
              <h4>${ml} ml</h4>
              ${VARIANTS.map((variant) => familyVariantCard(shape, ml, variant)).join('')}
            </div>
          `).join('')}
        </div>
      `;
      q('[data-more]', section).addEventListener('click', () => moreLike(shape));
      q('[data-focus]', section).addEventListener('click', () => openFocus(state.shapes.indexOf(shape)));
      mount.appendChild(section);
    });
  };

  function patchCultureRender() {
    if (window.__culturalGeometryPatched) return;
    window.__culturalGeometryPatched = true;
    const originalRender = render;
    render = function renderWithCulturalMatrix() {
      originalRender();
      if (state.view === 'family') {
        q('#familyView')?.classList.add('active');
        q('#viewTitle').textContent = 'Build a three-size cup family.';
        renderFamily();
      }
    };
  }

  function extendTags() {
    if (!Array.isArray(critiqueTags)) return;
    CULTURAL_TAGS.forEach((tag) => {
      if (!critiqueTags.includes(tag)) critiqueTags.push(tag);
    });
  }

  function updateStaticCopy() {
    const intro = q('#familyView .section-intro p');
    if (intro) intro.textContent = 'Saved or Good 330 ml DNA expanded into 3 variants for 3 primary sizes: 120 / 240 / 330, with handles included. This tests whether the design can become a real Table Line mini-family.';
    const title = q('#familyView .section-intro h3');
    if (title) title.textContent = 'Family Matrix';
  }

  function bootCulture() {
    installCulturalArchetypes();
    installCulturalControls();
    extendTags();
    updateStaticCopy();
    patchCultureRender();

    const hasCulturalShapes = state.shapes.some((shape) => shape.geometryVersion === 'cultural-soft-pressed-v1');
    if (!hasCulturalShapes || state.settings.geometryVersion !== 'cultural-soft-pressed-v1') {
      state.settings.perCategory = Number(state.settings.perCategory || 500);
      state.settings.geometryVersion = 'cultural-soft-pressed-v1';
      save();
      generateBatch(state.settings.perCategory);
    } else {
      render();
    }
  }

  bootCulture();
})();