/* Cultural grammar engine for Shape Hunt.
   This layer intentionally moves away from one universal profile with shuffled points.
   Each category has its own silhouette grammar, while all forms remain softened for pressed steel/enamel. */
(function installCulturalGrammarEngine() {
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const SIZE_SET = [120, 240, 330];
  const CATEGORY_COUNT_DEFAULT = 500;

  const CULTURAL_GRAMMARS = [
    {
      id: 'slavic-modern',
      name: 'Slavic Modern',
      short: 'SLA',
      description: 'grounded, warm, ritual table object; folk memory without ornament literalism',
      handle: .58,
      base: { h: 80, base: 78, rim: 102, belly: .70, waist: .34, foot: .78, lip: .44, quiet: .60, shoulder: .52 },
      build: buildSlavic
    },
    {
      id: 'viking-nordic-modern',
      name: 'Viking / Nordic Modern',
      short: 'NOR',
      description: 'low gravity, honest mass, broad stability, northern restraint',
      handle: .42,
      base: { h: 78, base: 84, rim: 98, belly: .42, waist: .18, foot: .62, lip: .30, quiet: .82, shoulder: .32 },
      build: buildNordic
    },
    {
      id: 'japan-modern',
      name: 'Japan Modern',
      short: 'JPN',
      description: 'quiet bowl-cup, precise low stance, restrained wabi-soft transition',
      handle: .34,
      base: { h: 72, base: 74, rim: 104, belly: .30, waist: .12, foot: .48, lip: .26, quiet: .92, shoulder: .22 },
      build: buildJapan
    },
    {
      id: 'classic-modern',
      name: 'Classic Modern',
      short: 'CLA',
      description: 'balanced table cup, familiar but not generic, soft production-safe S line',
      handle: .50,
      base: { h: 82, base: 76, rim: 102, belly: .48, waist: .32, foot: .56, lip: .42, quiet: .68, shoulder: .42 },
      build: buildClassic
    },
    {
      id: 'french-modern',
      name: 'French Modern',
      short: 'FRA',
      description: 'salon tulip, lifted rim, elegant tension, not porcelain cosplay',
      handle: .64,
      base: { h: 84, base: 72, rim: 108, belly: .40, waist: .54, foot: .54, lip: .70, quiet: .46, shoulder: .60 },
      build: buildFrench
    },
    {
      id: 'italian-modern',
      name: 'Italian Modern',
      short: 'ITA',
      description: 'cafe warmth, generous cappuccino softness, sensual but controlled',
      handle: .62,
      base: { h: 78, base: 76, rim: 110, belly: .66, waist: .38, foot: .48, lip: .60, quiet: .46, shoulder: .66 },
      build: buildItalian
    }
  ];

  const VARIANTS = [
    { id: 'A', name: 'Signature', description: 'primary reading of the DNA', map: (s) => ({ ...s }) },
    { id: 'B', name: 'Pressed Soft', description: 'larger implied radii, safer steel drawing', map: (s) => ({ ...s, waist: s.waist * .72, lip: s.lip * .82, shoulder: s.shoulder * .82, quiet: clamp(s.quiet + .10, 0, 1), steelSoftness: clamp((s.steelSoftness || .82) + .10, 0, 1) }) },
    { id: 'C', name: 'Table Hero', description: 'stronger table signature without becoming decorative', map: (s) => ({ ...s, foot: clamp(s.foot * 1.08 + .05, 0, 1), lip: clamp(s.lip * 1.04, 0, 1), handle: clamp((s.handle || .5) + .06, 0, 1), quiet: clamp(s.quiet - .04, 0, 1) }) }
  ];

  const CULTURAL_TAGS = ['slavic modern', 'nordic restraint', 'japan quiet', 'classic balance', 'french elegance', 'italian warmth', 'pressed steel safe', 'too angular', 'too sharp for enamel', 'handle works', 'handle too heavy', 'child handles good', 'three-size family works'];

  function installArchetypeModel() {
    if (Array.isArray(archetypes)) {
      archetypes.splice(0, archetypes.length, ...CULTURAL_GRAMMARS.map((grammar) => ({
        id: grammar.id,
        name: grammar.name,
        description: grammar.description,
        bias: grammar.base
      })));
    }

    const select = q('#archetypeFilter');
    if (select) {
      select.innerHTML = '<option value="all">All modern categories</option>';
      CULTURAL_GRAMMARS.forEach((grammar) => {
        const option = document.createElement('option');
        option.value = grammar.id;
        option.textContent = grammar.name;
        select.appendChild(option);
      });
      if (!CULTURAL_GRAMMARS.some((grammar) => grammar.id === state.settings.archetype)) state.settings.archetype = 'all';
      select.value = state.settings.archetype;
      save();
    }
  }

  function installControls() {
    const density = q('#densityRange');
    const densityValue = q('#densityValue');
    const densityLabel = q('label[for="densityRange"]');
    if (density) {
      state.settings.perCategory = Number(state.settings.perCategory || CATEGORY_COUNT_DEFAULT);
      density.min = '100';
      density.max = '700';
      density.step = '50';
      density.value = state.settings.perCategory;
      density.addEventListener('input', (event) => {
        state.settings.perCategory = Number(event.target.value);
        state.settings.density = Number(event.target.value);
        const fresh = q('#densityValue');
        if (fresh) fresh.textContent = event.target.value;
        save();
      });
    }
    if (densityLabel) densityLabel.textContent = 'Per category batch';
    const readout = q('.range-readout');
    if (readout) readout.innerHTML = `<span id="densityValue">${state.settings.perCategory || CATEGORY_COUNT_DEFAULT}</span> silhouettes / category`;

    if (!q('#generateCulturalBtn')) {
      const button = document.createElement('button');
      button.id = 'generateCulturalBtn';
      button.className = 'secondary';
      button.textContent = 'Generate 500 per category';
      button.addEventListener('click', () => generateBatch(Number(state.settings.perCategory || CATEGORY_COUNT_DEFAULT)));
      q('.sidebar-actions')?.prepend(button);
    }

    if (!q('#cultureNote')) {
      const note = document.createElement('p');
      note.id = 'cultureNote';
      note.className = 'culture-note';
      note.textContent = 'New generator: each category uses a distinct grammar, not the same point system. All profiles are softened for pressed steel and enamel.';
      q('#archetypeFilter')?.closest('.control-block')?.appendChild(note);
    }
  }

  function extendTags() {
    if (!Array.isArray(critiqueTags)) return;
    CULTURAL_TAGS.forEach((tag) => {
      if (!critiqueTags.includes(tag)) critiqueTags.push(tag);
    });
  }

  function selectedShapes() {
    return state.shapes.filter((shape) => state.decisions[shape.id]?.saved || state.decisions[shape.id]?.rating === 'good');
  }

  function tastePull(key, fallback) {
    const selected = selectedShapes();
    if (selected.length < 8) return fallback;
    const avg = selected.reduce((sum, shape) => sum + Number(shape[key] || fallback), 0) / selected.length;
    return fallback + (avg - fallback) * .20;
  }

  function generateFeatures(grammar, r, over = {}) {
    const base = grammar.base;
    const feature = {
      h: clamp(tastePull('height', base.h) + jit(r, 9), 58, 100),
      base: clamp(tastePull('base', base.base) + jit(r, 7), 56, 94),
      rim: clamp(tastePull('rim', base.rim) + jit(r, 9), 82, 122),
      belly: clamp(tastePull('belly', base.belly) + jit(r, .16), .04, .90),
      waist: clamp(tastePull('waist', base.waist) + jit(r, .15), 0, .78),
      foot: clamp(tastePull('foot', base.foot) + jit(r, .14), .08, .95),
      lip: clamp(tastePull('lip', base.lip) + jit(r, .15), .04, .88),
      shoulder: clamp(tastePull('shoulder', base.shoulder) + jit(r, .16), .04, .88),
      quiet: clamp(base.quiet + jit(r, .13), .22, .98),
      handle: clamp(grammar.handle + jit(r, .18), .10, .92),
      steelSoftness: clamp(.78 + base.quiet * .14 + jit(r, .08), .58, .98),
      ...over
    };

    // Pressed steel/enamel guardrails. No blade-like waists or ornamental hard breaks.
    if (feature.waist > .62 && feature.lip > .66) feature.waist *= .84;
    if (feature.foot > .84 && feature.waist > .54) feature.foot *= .94;
    if (feature.belly > .78 && feature.rim > 114) feature.belly *= .92;
    if (feature.h / Math.max(1, feature.rim) > 1.04) feature.h *= .96;
    feature.quiet = clamp(feature.quiet + Math.max(0, feature.waist - .62) * .10 + Math.max(0, feature.lip - .72) * .08, 0, 1);
    return feature;
  }

  function makeCulturalShape(id, grammar, r, over = {}) {
    const f = generateFeatures(grammar, r, over);
    const shape = {
      id,
      archetypeId: grammar.id,
      archetypeName: grammar.name,
      archetypeDescription: grammar.description,
      culturalCategory: grammar.id,
      geometryVersion: 'grammar-v2-soft-pressed-steel',
      grammarName: grammar.name,
      height: f.h,
      base: f.base,
      rim: f.rim,
      belly: f.belly,
      waist: f.waist,
      foot: f.foot,
      lip: f.lip,
      shoulder: f.shoulder,
      quiet: f.quiet,
      handle: f.handle,
      steelSoftness: f.steelSoftness,
      grammarProfile: grammar.build(f)
    };
    return enrich(shape);
  }

  function makeAnchor(grammar) {
    const f = { ...grammar.base, steelSoftness: .90, handle: grammar.handle };
    return enrich({
      id: `${grammar.short}_ANCHOR`,
      archetypeId: grammar.id,
      archetypeName: grammar.name,
      archetypeDescription: grammar.description,
      culturalCategory: grammar.id,
      geometryVersion: 'grammar-v2-soft-pressed-steel',
      grammarName: grammar.name,
      height: f.h,
      base: f.base,
      rim: f.rim,
      belly: f.belly,
      waist: f.waist,
      foot: f.foot,
      lip: f.lip,
      shoulder: f.shoulder,
      quiet: f.quiet,
      handle: f.handle,
      steelSoftness: f.steelSoftness,
      grammarProfile: grammar.build(f)
    });
  }

  function normalizeProfile(points, feature) {
    const h = feature.h;
    const cleaned = points
      .map((point) => ({ y: clamp(point.y, 0, 1) * h, r: Math.max(10, point.r), role: point.role || '' }))
      .sort((a, b) => a.y - b.y);

    // Remove nearly duplicate heights; they create visual corners.
    const out = [];
    cleaned.forEach((point) => {
      const previous = out[out.length - 1];
      if (previous && Math.abs(previous.y - point.y) < h * .018) {
        previous.r = (previous.r + point.r) / 2;
        previous.role = previous.role || point.role;
      } else {
        out.push(point);
      }
    });
    return out;
  }

  function buildSlavic(f) {
    const b = f.base / 2;
    const rim = f.rim / 2;
    const belly = lerp(2.6, 8.2, f.belly);
    const waist = lerp(.3, 3.6, f.waist);
    const foot = lerp(1.0, 4.8, f.foot);
    const lip = lerp(.4, 3.8, f.lip);
    return normalizeProfile([
      { y: 0.00, r: b, role: 'table contact' },
      { y: 0.055, r: b - foot * .42, role: 'soft undercut' },
      { y: 0.155, r: b + foot * .62, role: 'heirloom foot bead' },
      { y: 0.335, r: lerp(b, rim, .32) + belly * .34, role: 'lower warmth' },
      { y: 0.505, r: lerp(b, rim, .48) + belly * .18 - waist, role: 'quiet waist' },
      { y: 0.735, r: lerp(b, rim, .76) + belly * .36 + f.shoulder * 2.4, role: 'generous shoulder' },
      { y: 0.925, r: rim + lip * .14, role: 'rim transition' },
      { y: 1.000, r: rim + lip * .38, role: 'soft open rim' }
    ], f);
  }

  function buildNordic(f) {
    const b = f.base / 2;
    const rim = f.rim / 2;
    const low = lerp(1.0, 4.4, f.belly);
    const foot = lerp(.8, 3.2, f.foot);
    const lip = lerp(.2, 2.2, f.lip);
    return normalizeProfile([
      { y: 0.00, r: b, role: 'wide contact' },
      { y: 0.070, r: b - foot * .20, role: 'minimal shadow' },
      { y: 0.230, r: b + low * .40, role: 'low mass' },
      { y: 0.470, r: lerp(b, rim, .44) + low * .16, role: 'restrained wall' },
      { y: 0.720, r: lerp(b, rim, .72) + low * .10, role: 'honest taper' },
      { y: 0.930, r: rim + lip * .10, role: 'controlled lip' },
      { y: 1.000, r: rim + lip * .24, role: 'quiet rim' }
    ], f);
  }

  function buildJapan(f) {
    const b = f.base / 2;
    const rim = f.rim / 2;
    const bowl = lerp(1.2, 6.2, f.belly);
    const foot = lerp(.7, 3.1, f.foot);
    const lip = lerp(.2, 2.6, f.lip);
    return normalizeProfile([
      { y: 0.00, r: b * .96, role: 'calm foot ring' },
      { y: 0.060, r: b - foot * .30, role: 'fine shadow' },
      { y: 0.175, r: b + foot * .16, role: 'settled base' },
      { y: 0.365, r: lerp(b, rim, .34) + bowl * .18, role: 'low bowl curve' },
      { y: 0.610, r: lerp(b, rim, .66) + bowl * .10 - f.waist * 1.1, role: 'silent transition' },
      { y: 0.850, r: lerp(b, rim, .93) + bowl * .05, role: 'open quiet wall' },
      { y: 1.000, r: rim + lip * .20, role: 'thin composed rim' }
    ], f);
  }

  function buildClassic(f) {
    const b = f.base / 2;
    const rim = f.rim / 2;
    const belly = lerp(1.6, 6.4, f.belly);
    const waist = lerp(.2, 3.5, f.waist);
    const foot = lerp(.8, 4.0, f.foot);
    const lip = lerp(.3, 3.4, f.lip);
    return normalizeProfile([
      { y: 0.00, r: b, role: 'table contact' },
      { y: 0.070, r: b - foot * .34, role: 'small undercut' },
      { y: 0.175, r: b + foot * .38, role: 'foot recovery' },
      { y: 0.385, r: lerp(b, rim, .38) + belly * .30, role: 'classic lower body' },
      { y: 0.560, r: lerp(b, rim, .54) + belly * .12 - waist, role: 'balanced waist' },
      { y: 0.760, r: lerp(b, rim, .78) + belly * .18 + f.shoulder * 2.1, role: 'upper balance' },
      { y: 0.925, r: rim + lip * .12, role: 'drinking edge lead-in' },
      { y: 1.000, r: rim + lip * .30, role: 'soft rim' }
    ], f);
  }

  function buildFrench(f) {
    const b = f.base / 2;
    const rim = f.rim / 2;
    const waist = lerp(.9, 5.0, f.waist);
    const foot = lerp(.8, 4.1, f.foot);
    const tulip = lerp(1.0, 6.2, f.lip);
    const shoulder = lerp(.8, 5.0, f.shoulder);
    return normalizeProfile([
      { y: 0.00, r: b * .98, role: 'lifted contact' },
      { y: 0.065, r: b - foot * .36, role: 'salon shadow' },
      { y: 0.180, r: b + foot * .34, role: 'fine foot' },
      { y: 0.390, r: lerp(b, rim, .36) + shoulder * .10 - waist * .55, role: 'elegant narrowing' },
      { y: 0.610, r: lerp(b, rim, .60) + shoulder * .35 - waist * .28, role: 'lifted wall' },
      { y: 0.800, r: lerp(b, rim, .84) + shoulder * .62, role: 'tulip shoulder' },
      { y: 0.930, r: rim + tulip * .28, role: 'rim opening' },
      { y: 1.000, r: rim + tulip * .56, role: 'salon rim' }
    ], f);
  }

  function buildItalian(f) {
    const b = f.base / 2;
    const rim = f.rim / 2;
    const belly = lerp(2.2, 8.0, f.belly);
    const waist = lerp(.2, 3.4, f.waist);
    const lip = lerp(.7, 5.0, f.lip);
    const foot = lerp(.7, 3.4, f.foot);
    return normalizeProfile([
      { y: 0.00, r: b, role: 'cafe table contact' },
      { y: 0.060, r: b - foot * .24, role: 'soft saucer shadow' },
      { y: 0.150, r: b + foot * .18, role: 'quiet foot' },
      { y: 0.315, r: lerp(b, rim, .34) + belly * .42, role: 'cappuccino belly' },
      { y: 0.520, r: lerp(b, rim, .50) + belly * .22 - waist, role: 'gentle gather' },
      { y: 0.730, r: lerp(b, rim, .74) + belly * .28 + f.shoulder * 2.0, role: 'warm shoulder' },
      { y: 0.905, r: rim + lip * .22, role: 'generous rim lead' },
      { y: 1.000, r: rim + lip * .42, role: 'cafe rim' }
    ], f);
  }

  const previousEnrich = enrich;
  enrich = function enrichGrammar(shape) {
    const stations = shape.grammarProfile || profileFor(shape, 330);
    const height = Number(shape.height || stations[stations.length - 1].y || 82);
    const base = Number(shape.base || stations[0].r * 2);
    const rim = Number(shape.rim || stations[stations.length - 1].r * 2);
    const radii = stations.map((point) => point.r);
    const maxD = Math.max(...radii) * 2;
    const minMid = Math.min(...stations.filter((point) => point.y > height * .25 && point.y < height * .72).map((point) => point.r)) * 2 || base;
    const stability = base / Math.max(1, height);
    const hToRim = height / Math.max(1, rim);
    const waistSignal = clamp((maxD - minMid) / Math.max(1, maxD), 0, 1);
    const angularRisk = estimateAngularRisk(stations, shape);
    const pressSafeScore = clamp(1 - angularRisk * .72 - scoreCampingLocal(shape, hToRim) * .20, 0, 1);
    const tableScore = clamp((1 - Math.abs(hToRim - .82) / .42) * .28 + clamp((stability - .68) / .38, 0, 1) * .28 + Number(shape.foot || .5) * .24 + Number(shape.quiet || .5) * .20, 0, 1);
    const soulScore = clamp(waistSignal * .25 + Number(shape.foot || .5) * .22 + Number(shape.lip || .5) * .18 + Number(shape.belly || .5) * .22 + (1 - Math.abs(Number(shape.quiet || .6) - .58)) * .13, 0, 1);
    const campingRisk = scoreCampingLocal(shape, hToRim);
    const familyRisk = clamp(Math.max(0, Number(shape.lip || 0) - .76) * .30 + Math.max(0, Number(shape.waist || 0) - .68) * .32 + Math.max(0, Number(shape.belly || 0) - .82) * .22 + Math.max(0, .70 - stability) * .24, 0, 1);

    return {
      ...shape,
      height: rnd(height, 1),
      base: rnd(base, 1),
      rim: rnd(rim, 1),
      hToRim: rnd(hToRim, 2),
      stability: rnd(stability, 2),
      tableScore: rnd(tableScore, 2),
      soulScore: rnd(soulScore, 2),
      campingRisk: rnd(campingRisk, 2),
      familyRisk: rnd(familyRisk, 2),
      angularRisk: rnd(angularRisk, 2),
      pressSafeScore: rnd(pressSafeScore, 2),
      massProxy: Math.round(height * (base + rim) * .0102 + Number(shape.foot || .5) * 10 + Number(shape.belly || .5) * 9 + Number(shape.handle || .5) * 5),
      recommendation: rnd(tableScore * .28 + soulScore * .30 + pressSafeScore * .26 + (1 - campingRisk) * .10 + (1 - familyRisk) * .06, 3)
    };
  };

  function estimateAngularRisk(stations, shape) {
    let risk = 0;
    for (let i = 1; i < stations.length - 1; i += 1) {
      const a = stations[i - 1];
      const b = stations[i];
      const c = stations[i + 1];
      const slope1 = (b.r - a.r) / Math.max(1, b.y - a.y);
      const slope2 = (c.r - b.r) / Math.max(1, c.y - b.y);
      risk += Math.min(1, Math.abs(slope2 - slope1) * 3.4);
    }
    risk /= Math.max(1, stations.length - 2);
    risk += Math.max(0, Number(shape.waist || 0) - .62) * .25;
    risk += Math.max(0, Number(shape.lip || 0) - .76) * .20;
    risk += Math.max(0, .32 - Number(shape.quiet || .6)) * .20;
    return clamp(risk, 0, 1);
  }

  function scoreCampingLocal(shape, hToRim) {
    const weakFoot = clamp((.30 - Number(shape.foot || .4)) / .30, 0, 1);
    const cylinder = clamp((.16 - Math.abs((Number(shape.rim || 100) - Number(shape.base || 76)) / Math.max(1, Number(shape.rim || 100)))) / .16, 0, 1);
    const tall = clamp((hToRim - 1.02) / .32, 0, 1);
    const dead = clamp((.18 - Number(shape.waist || 0)) / .18, 0, 1) * clamp((.28 - Number(shape.belly || 0)) / .28, 0, 1);
    return clamp(weakFoot * .34 + cylinder * .22 + tall * .24 + dead * .20, 0, 1);
  }

  function profileFor(shape, ml = 330) {
    const grammar = CULTURAL_GRAMMARS.find((item) => item.id === shape.archetypeId) || CULTURAL_GRAMMARS[3];
    const adapted = ml === 330 ? shape : familyAdapt(shape, ml);
    const f = {
      h: adapted.height,
      base: adapted.base,
      rim: adapted.rim,
      belly: adapted.belly,
      waist: adapted.waist,
      foot: adapted.foot,
      lip: adapted.lip,
      shoulder: adapted.shoulder,
      quiet: adapted.quiet,
      handle: adapted.handle,
      steelSoftness: adapted.steelSoftness
    };
    return grammar.build(f);
  }

  generateBatch = function generateGrammarBatch(n = state.settings.perCategory || CATEGORY_COUNT_DEFAULT) {
    const perCategory = Number(n || CATEGORY_COUNT_DEFAULT);
    const selected = state.settings.archetype || q('#archetypeFilter')?.value || 'all';
    const categories = selected === 'all' ? CULTURAL_GRAMMARS : CULTURAL_GRAMMARS.filter((grammar) => grammar.id === selected);
    const r = rng(state.seed++);
    const out = [];
    categories.forEach((grammar) => {
      out.push(makeAnchor(grammar));
      for (let i = 0; i < perCategory; i += 1) {
        out.push(makeCulturalShape(`${grammar.short}_${String(i + 1).padStart(4, '0')}`, grammar, r));
      }
    });
    state.shapes = out;
    state.settings.perCategory = perCategory;
    state.settings.density = perCategory;
    state.settings.geometryVersion = 'grammar-v2-soft-pressed-steel';
    persistShapes();
    state.focusIndex = 0;
    render();
    toast(`Generated ${out.length} silhouettes from ${categories.length} grammar${categories.length === 1 ? '' : 's'}`);
  };

  moreLike = function moreLikeGrammar(shape, n = 240) {
    const grammar = CULTURAL_GRAMMARS.find((item) => item.id === shape.archetypeId) || CULTURAL_GRAMMARS[3];
    const r = rng(Math.floor(Math.random() * 999999));
    const out = [];
    for (let i = 0; i < n; i += 1) {
      const tight = i < n * .60 ? .10 : .22;
      out.push(makeCulturalShape(`M_${shape.id}_${String(i + 1).padStart(3, '0')}`, grammar, r, {
        h: clamp(Number(shape.height) + jit(r, 18 * tight), 58, 100),
        base: clamp(Number(shape.base) + jit(r, 18 * tight), 56, 94),
        rim: clamp(Number(shape.rim) + jit(r, 20 * tight), 82, 122),
        belly: clamp(Number(shape.belly) + jit(r, .40 * tight), .04, .90),
        waist: clamp(Number(shape.waist) + jit(r, .36 * tight), 0, .78),
        foot: clamp(Number(shape.foot) + jit(r, .38 * tight), .08, .95),
        lip: clamp(Number(shape.lip) + jit(r, .38 * tight), .04, .88),
        shoulder: clamp(Number(shape.shoulder) + jit(r, .40 * tight), .04, .88),
        quiet: clamp(Number(shape.quiet) + jit(r, .30 * tight), .22, .98),
        handle: clamp(Number(shape.handle || grammar.handle) + jit(r, .36 * tight), .10, .92),
        steelSoftness: clamp(Number(shape.steelSoftness || .82) + jit(r, .20 * tight), .58, .98)
      }));
    }
    setDecision(shape.id, { moreLike: (state.decisions[shape.id]?.moreLike || 0) + 1, saved: true });
    addHistory(shape.id, 'more-like-this-grammar', { n, grammar: grammar.id });
    state.shapes = out.concat(state.shapes.filter((item) => item.id !== shape.id));
    persistShapes();
    state.view = 'gallery';
    closeFocus();
    render();
    toast(`Generated ${n} ${grammar.name} variations`);
  };

  familyAdapt = function familyAdaptGrammar(shape, ml) {
    const ratio = {
      120: { height: .62, base: .83, rim: .77, belly: .68, waist: .42, foot: 1.15, lip: .70, shoulder: .64, handle: 1.14, quiet: .06 },
      240: { height: .82, base: .93, rim: .91, belly: .82, waist: .66, foot: 1.07, lip: .84, shoulder: .82, handle: 1.06, quiet: .03 },
      330: { height: 1, base: 1, rim: 1, belly: 1, waist: 1, foot: 1, lip: 1, shoulder: 1, handle: 1, quiet: 0 },
      440: { height: 1.14, base: 1.09, rim: 1.09, belly: 1.02, waist: .88, foot: .96, lip: 1.00, shoulder: 1.00, handle: 1.04, quiet: .02 }
    }[ml] || { height: 1, base: 1, rim: 1, belly: 1, waist: 1, foot: 1, lip: 1, shoulder: 1, handle: 1, quiet: 0 };
    return enrich({
      ...shape,
      id: `${shape.id}_${ml}`,
      height: Number(shape.height) * ratio.height,
      base: Number(shape.base) * ratio.base,
      rim: Number(shape.rim) * ratio.rim,
      belly: clamp(Number(shape.belly) * ratio.belly, 0, 1),
      waist: clamp(Number(shape.waist) * ratio.waist, 0, 1),
      foot: clamp(Number(shape.foot) * ratio.foot, 0, 1),
      lip: clamp(Number(shape.lip) * ratio.lip, 0, 1),
      shoulder: clamp(Number(shape.shoulder) * ratio.shoulder, 0, 1),
      handle: clamp(Number(shape.handle || .5) * ratio.handle, 0, 1),
      quiet: clamp(Number(shape.quiet || .6) + ratio.quiet, 0, 1),
      steelSoftness: clamp(Number(shape.steelSoftness || .82) + (ml <= 240 ? .07 : 0), .58, .98),
      grammarProfile: null
    });
  };

  function catmullPath(points, side, opt = {}) {
    const scale = opt.scale || 1;
    const top = opt.top || 16;
    const k = 2.25 * scale;
    const cx = 90;
    const h = points[points.length - 1].y;
    const XY = (point) => ({ x: cx + side * point.r * k, y: top + (h - point.y) * k });
    const p = points.map(XY);
    const tension = .82;
    const cmds = [`M ${p[0].x.toFixed(1)},${p[0].y.toFixed(1)}`];
    for (let i = 0; i < p.length - 1; i += 1) {
      const p0 = p[Math.max(0, i - 1)];
      const p1 = p[i];
      const p2 = p[i + 1];
      const p3 = p[Math.min(p.length - 1, i + 2)];
      const c1 = { x: p1.x + (p2.x - p0.x) / 6 * tension, y: p1.y + (p2.y - p0.y) / 6 * tension };
      const c2 = { x: p2.x - (p3.x - p1.x) / 6 * tension, y: p2.y - (p3.y - p1.y) / 6 * tension };
      cmds.push(`C ${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`);
    }
    return cmds.join(' ');
  }

  path = function pathGrammar(shape, opt = {}) {
    const ml = opt.familySize || 330;
    const profile = profileFor(shape, ml);
    const right = catmullPath(profile, 1, opt);
    const left = catmullPath([...profile].reverse(), -1, opt).replace(/^M /, 'L ');
    return `${right} ${left} Z`;
  };

  function handlePath(shape, opt = {}, side = 1) {
    const ml = opt.familySize || 330;
    const adapted = ml === 330 ? shape : familyAdapt(shape, ml);
    const profile = profileFor(shape, ml);
    const scale = opt.scale || 1;
    const top = opt.top || 16;
    const k = 2.25 * scale;
    const cx = 90;
    const h = profile[profile.length - 1].y;
    const maxR = Math.max(...profile.filter((point) => point.y > h * .30 && point.y < h * .75).map((point) => point.r));
    const energy = Number(adapted.handle || .52);
    const yTop = top + (h - h * (ml <= 240 ? .66 : .69)) * k;
    const yBottom = top + (h - h * (ml <= 240 ? .33 : .35)) * k;
    const yMid = (yTop + yBottom) / 2;
    const xInner = cx + side * (maxR * k + 2);
    const outer = (14 + energy * 16 + (ml <= 240 ? 7 : 3)) * scale;
    const xOuter = xInner + side * outer;
    const xHole = xInner + side * Math.max(7, outer * .45);
    const soften = 6 * scale;
    const outerPath = `M ${xInner.toFixed(1)},${yTop.toFixed(1)} C ${xOuter.toFixed(1)},${(yTop - soften).toFixed(1)} ${xOuter.toFixed(1)},${(yBottom + soften).toFixed(1)} ${xInner.toFixed(1)},${yBottom.toFixed(1)} C ${(xInner + side * 5).toFixed(1)},${(yMid + 4).toFixed(1)} ${(xInner + side * 5).toFixed(1)},${(yMid - 4).toFixed(1)} ${xInner.toFixed(1)},${yTop.toFixed(1)}`;
    const innerPath = `M ${(xInner + side * 5).toFixed(1)},${(yTop + 9 * scale).toFixed(1)} C ${xHole.toFixed(1)},${(yTop + 4 * scale).toFixed(1)} ${xHole.toFixed(1)},${(yBottom - 4 * scale).toFixed(1)} ${(xInner + side * 5).toFixed(1)},${(yBottom - 9 * scale).toFixed(1)} C ${(xInner + side * 10).toFixed(1)},${(yMid + 1).toFixed(1)} ${(xInner + side * 10).toFixed(1)},${(yMid - 1).toFixed(1)} ${(xInner + side * 5).toFixed(1)},${(yTop + 9 * scale).toFixed(1)}`;
    return `${outerPath} Z ${innerPath} Z`;
  }

  function handleMarkup(shape, opt = {}) {
    const ml = opt.familySize || 330;
    const sides = ml <= 240 ? [-1, 1] : [1];
    return sides.map((side) => `<path d="${handlePath(shape, opt, side)}" fill="currentColor" fill-rule="evenodd" class="handle-path"/>`).join('');
  }

  svg = function svgGrammar(shape, opt = {}) {
    const vb = opt.large ? '0 0 180 260' : '0 0 180 236';
    const ty = opt.large ? 239 : 225;
    const ml = opt.familySize || 330;
    const adapted = ml === 330 ? shape : familyAdapt(shape, ml);
    const bodyOnly = Boolean(opt.bodyOnly) || document.body.classList.contains('brutal-mode');
    const caption = opt.large ? `<text x="90" y="254" text-anchor="middle" class="svg-caption">H ${Math.round(adapted.height)} · base ${Math.round(adapted.base)} · rim ${Math.round(adapted.rim)} · press ${Math.round((adapted.pressSafeScore || .8) * 100)}</text>` : '';
    return `<svg viewBox="${vb}" role="img" aria-label="${shape.id} silhouette"><line x1="24" x2="156" y1="${ty}" y2="${ty}" class="table-line"/>${bodyOnly ? '' : handleMarkup(shape, opt)}<path d="${path(shape, opt)}" fill="currentColor" class="body-path"/>${caption}</svg>`;
  };

  designerRead = function designerReadGrammar(shape) {
    const notes = [shape.archetypeName || 'modern table grammar'];
    if ((shape.pressSafeScore || 0) > .78) notes.push('soft enough for pressed steel');
    if ((shape.angularRisk || 0) > .42) notes.push('watch angularity for enamel');
    if (shape.tableScore > .74) notes.push('strong table presence');
    if (shape.soulScore > .74) notes.push('has controlled soul');
    if (shape.foot > .70) notes.push('signature foot shadow');
    if (shape.foot < .28) notes.push('weak foot: camping drift');
    if (shape.lip > .68) notes.push('expressive rim');
    if (shape.waist > .56) notes.push('visible waist tension');
    if (shape.belly > .70) notes.push('warm family belly');
    if (shape.campingRisk > .55) notes.push('camping warning');
    return `${notes.join(' · ')}.`;
  };

  function variantShape(shape, variant) {
    return enrich({ ...variant.map(shape), id: `${shape.id}_${variant.id}`, variantId: variant.id, variantName: variant.name, grammarProfile: null });
  }

  function familyVariantCard(shape, ml, variant) {
    const candidate = variantShape(shape, variant);
    const adapted = familyAdapt(candidate, ml);
    return `<article class="cup-variant-card"><div class="cup-variant-head"><strong>${ml} ml · ${variant.id}</strong><span>${variant.name}</span></div><div class="cup-variant-art">${svg(candidate, { familySize: ml, scale: ml === 120 ? 1.10 : ml === 330 ? .92 : 1.00 })}</div><p class="meta">H ${Math.round(adapted.height)} · base ${Math.round(adapted.base)} · rim ${Math.round(adapted.rim)} · ${ml <= 240 ? '2 handles' : '1 handle'}</p><p class="risk ${adapted.angularRisk > .44 || adapted.familyRisk > .55 ? 'warn' : ''}">${variant.description} · press ${Math.round((adapted.pressSafeScore || .8) * 100)}</p></article>`;
  }

  renderFamily = function renderFamilyMatrix() {
    const mount = q('#familyBoard');
    if (!mount) return;
    const saved = state.shapes
      .filter((shape) => state.decisions[shape.id]?.saved || state.decisions[shape.id]?.rating === 'good')
      .sort((a, b) => ((state.decisions[b.id]?.tournamentWins || 0) - (state.decisions[a.id]?.tournamentWins || 0)) || b.recommendation - a.recommendation)
      .slice(0, 12);
    if (!saved.length) {
      mount.innerHTML = empty('Save or mark Good candidates first.', 'Family Matrix will show 3 variants × 3 sizes: 120 / 240 / 330, with handles included.');
      return;
    }
    mount.innerHTML = '';
    saved.forEach((shape) => {
      const section = document.createElement('section');
      section.className = 'family-row cup-matrix-row';
      section.innerHTML = `<div class="family-header"><div><div class="eyebrow">${shape.archetypeName}</div><h3>${shape.id}</h3><p class="meta">3 variants × 3 sizes. 120/240 include two handles; 330 includes one handle.</p></div><div class="matrix-actions"><button class="secondary" data-more>More like this</button><button class="ghost" data-focus>Focus</button></div></div><div class="cup-matrix">${SIZE_SET.map((ml) => `<div class="cup-size-column"><h4>${ml} ml</h4>${VARIANTS.map((variant) => familyVariantCard(shape, ml, variant)).join('')}</div>`).join('')}</div>`;
      q('[data-more]', section).addEventListener('click', () => moreLike(shape));
      q('[data-focus]', section).addEventListener('click', () => openFocus(state.shapes.indexOf(shape)));
      mount.appendChild(section);
    });
  };

  function patchRender() {
    if (window.__grammarV2RenderPatched) return;
    window.__grammarV2RenderPatched = true;
    const originalRender = render;
    render = function renderWithGrammarFamily() {
      originalRender();
      if (state.view === 'family') {
        q('#familyView')?.classList.add('active');
        q('#viewTitle').textContent = 'Build a three-size cup family.';
        renderFamily();
      }
    };
  }

  function updateCopy() {
    const intro = q('#familyView .section-intro p');
    const title = q('#familyView .section-intro h3');
    if (title) title.textContent = 'Family Matrix';
    if (intro) intro.textContent = 'Saved or Good DNA expanded into 3 variants for 3 primary sizes: 120 / 240 / 330, with handles included.';
  }

  function boot() {
    installArchetypeModel();
    installControls();
    extendTags();
    updateCopy();
    patchRender();
    const hasGrammarV2 = state.shapes.some((shape) => shape.geometryVersion === 'grammar-v2-soft-pressed-steel');
    if (!hasGrammarV2 || state.settings.geometryVersion !== 'grammar-v2-soft-pressed-steel') {
      state.settings.perCategory = Number(state.settings.perCategory || CATEGORY_COUNT_DEFAULT);
      state.settings.geometryVersion = 'grammar-v2-soft-pressed-steel';
      save();
      generateBatch(state.settings.perCategory);
    } else {
      state.shapes = state.shapes.map(enrich);
      render();
    }
  }

  boot();
})();