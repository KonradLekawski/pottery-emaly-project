# Shape Hunt product improvement plan

This document captures the next product improvements after the interaction fix and research generator reset.

## 0. Reliability first

### Problem
The app is now layered: base app, extension layer, cultural engine, fit system, evidence scoring and research generator. This is fast for prototyping but fragile if layers disagree on DOM contracts.

### Actions

1. Define a stable card action contract:

```text
button[data-act="good"]
button[data-act="bad"]
button[data-act="save"]
button[data-act="more"]
```

2. Keep `app-interaction-guard.js` until we refactor into modules.
3. Add browser-level Playwright smoke tests:
   - generate batch,
   - click Good,
   - click Save,
   - verify counters update,
   - open focus,
   - press G/B/S/M.

## 1. Visual quality of geometry

### Problem
Even evidence-weighted silhouettes can feel algorithmic if the generator only produces mathematically smooth but emotionally generic shapes.

### Actions

1. Replace profile rendering with true spline/Bézier paths rather than straight-line sampling.
2. Add shape family templates curated by hand:
   - 12 hand-authored anchor silhouettes,
   - each category mutates around anchors, not around random parameters only.
3. Add manual curation mode:
   - mark a silhouette as `anchor`,
   - all future generations can use it as a seed.
4. Add visual anti-pattern filters:
   - cartoon bowl,
   - camping cylinder,
   - porcelain cosplay,
   - bucket large size,
   - toy-like 120 ml.

## 2. Better evaluation flow

### Problem
Good / Bad is fast but too coarse. The app should learn why a shape works.

### Actions

1. Add one-tap reason groups:
   - soul,
   - too angular,
   - good foot,
   - bad handle,
   - too ordinary,
   - too strange,
   - child version works,
   - 440 / road risk.
2. Add A/B tournament prompts by intent:
   - which is more timeless?
   - which is more premium?
   - which is more manufacturable?
   - which is better family DNA?
3. Record decision latency as preference signal.

## 3. Fit and production honesty

### Problem
A beautiful silhouette is not enough if it cannot become pressed steel/enamel.

### Actions

1. Make `pressSafeScore` a hard promotion gate.
2. Add `minRadiusProxy` and `drawDepthProxy` visible in Focus.
3. Add rule: high `soulScore` cannot override high `enamelEdgeRisk`.
4. Add production flags:
   - needs technologist review,
   - likely deep-draw risk,
   - lip needs CAD refinement,
   - handle attachment unresolved.

## 4. Road Line separation

### Problem
Road Line must inherit DNA but not deform Table Line into a travel mug.

### Actions

1. Keep Road Fit as a translation screen, not a gallery default.
2. Add supplier-interface fields:
   - closure ring diameter,
   - gasket seat diameter,
   - sip module type,
   - splash-resistant vs leakproof.
3. Add outsourced closure shortlist later.

## 5. Product polish

### Actions

1. Replace visual clutter in cards with three display modes:
   - Brutal silhouette,
   - Family preview,
   - Evidence preview.
2. Add keyboard-first review mode.
3. Add session summary after 50 decisions:

```text
You prefer lower forms, strong foot, moderate rim, low angularity.
You reject tall/cylindrical/camping forms.
```

4. Export a design-review deck/HTML with top 24 saved forms.

## Near-term priority

1. Add Playwright smoke test for clicking and counters.
2. Improve generator visual quality with curated anchor silhouettes.
3. Add manual anchor mode.
4. Add reason-based Good/Bad tags as first-class data.
5. Refactor layers into modules before more features are added.
