# Shape Hunt workflow skill

Use this checklist for every Shape Hunt change.

## Product rule

Do not add another patch layer unless there is no alternative. Prefer changes inside the clean module core:

```text
apps/shape-hunt/src/
  geometry.js
  state.js
  main.js
  styles.css
```

## Before editing

1. Read `apps/shape-hunt/README.md`.
2. Identify the workstream: geometry, map analysis, interactions, persistence, product docs or tests.
3. Keep the Table Line brief in mind: premium, family, soft, table-oriented, not camping, not toy-like.

## During editing

1. Keep the app single-entry: `index.html` should load only `src/main.js` and `src/styles.css`.
2. No global render monkey-patching.
3. UI actions must use one action contract:

```text
data-action="good"
data-action="bad"
data-action="save"
data-action="more"
data-action="inspect"
```

4. Any new geometry score must be visible in Map Lab and included in exports.
5. Any new generator rule must preserve pressed-steel/enamel softness.

## Required checks before commit

```bash
npm run clean
npm test
npm run validate:shape-hunt
```

## Manual smoke test

1. `npm run serve:shape-hunt`
2. Open `http://localhost:5173`
3. Generate a batch.
4. Click Gallery, Map Lab, Shortlist, A/B, Family Matrix, Evidence, Road Fit.
5. Mark one shape Good, one Bad and one Saved.
6. In Map Lab, switch click mode to Good/Bad/Save and click dots.
7. Reload the page; decisions must persist.
8. Export feedback JSON.

## Red flags

- Tabs stop switching.
- Good/Bad/Save counters do not update.
- Map dots do not open Focus or persist Good/Bad colors.
- New files require a second stability guard.
- Geometry looks sharp, kinked or ceramic-fantasy.
