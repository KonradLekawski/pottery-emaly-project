# Shape Hunt

A clean, evidence-weighted silhouette discovery app for the Pottery Emaly Project.

The app exists for one job: **browse many cup silhouettes quickly and identify the shapes that feel alive**, while keeping research, manufacturability and family constraints visible from the beginning.

## Run locally

From the repository root:

```bash
npm run serve:shape-hunt
```

Open:

```text
http://localhost:5173
```

No build step is required. The app uses native ES modules.

## Refactor status

The app has been cleaned from the previous layered prototype. The active app now uses one module entrypoint:

```text
apps/shape-hunt/index.html
apps/shape-hunt/src/main.js
apps/shape-hunt/src/geometry.js
apps/shape-hunt/src/state.js
apps/shape-hunt/src/styles.css
```

Legacy patch files may remain in git history, but `index.html` no longer loads the old overlapping extension/stability scripts.

## Checks

Before pushing Shape Hunt changes:

```bash
npm run clean
npm test
npm run validate:shape-hunt
```

Or all at once:

```bash
npm run doctor
```

## Current features

- evidence-weighted geometry generation;
- modernized grammars: Slavic, Viking/Nordic, Japan, Classic, French, Italian;
- immediate 3-model preview on every card: 120 / 240 / 330, with handles included;
- persistent Good / Bad / Save decisions;
- Map Lab with clickable points and persistent green/red/gold decision colors;
- automatic filters: Table dimension fit, Pressed steel safe, Road potential, Evidence, Curvature, MAYA, Family coherence;
- Focus view with evidence and fit panels;
- Family Matrix: 3 variants × 3 primary sizes;
- A/B tournament;
- Road Fit conceptual screen;
- JSON export.

## Design rule

> If the black side profile does not work, 3D rendering, color and ornament will not save the product.

## Development workflow

See:

```text
docs/dev/shape-hunt-workflow-skill.md
```
