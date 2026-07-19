# Shape Hunt

A static, silhouette-first discovery app for the Pottery Emaly Project.

The app exists for one job: **browse hundreds of cup silhouettes quickly and identify the shapes that feel alive**. It intentionally avoids CAD complexity, material renders, decoration, and manual parameter editing at this stage.

## Run locally

From the repository root:

```bash
npm run serve:shape-hunt
```

Or from this directory:

```bash
python3 -m http.server 5173
```

Open:

```text
http://localhost:5173
```

No build step is required.

## Current MVP

Shape Hunt now supports:

- generation of hundreds of 330 ml Table Line silhouettes;
- curated archetype anchors: Quiet Heirloom, Soft Tulip, Low Table Cup, Noble Belly, Footed Classic, Modern Heirloom, Heirloom Hero;
- Gallery view with fast Good / Bad / Save / More Like This actions;
- Sort modes: recommended, newest, soul score, table presence, strong foot, lower silhouettes, saved first;
- archetype filtering;
- hiding rejected shapes from the current batch;
- **Brutal silhouette mode** for evaluating only the black contour;
- Focus dialog with large silhouette, designer read and semantic tags;
- Shortlist view;
- A/B Tournament view;
- Family Check translating saved 330 ml DNA into 120 / 240 / 330 / 440 ml;
- **Shape Map** for seeing where Good / Bad / Saved decisions cluster;
- **Taste Signal** panel comparing selected vs rejected feature tendencies;
- **Review Board** for calmer finalist review;
- review board export to HTML;
- localStorage persistence;
- feedback export to JSON.

## Keyboard

Open a silhouette first, then use:

- `G` — good
- `B` — bad
- `S` — save / unsave
- `M` — generate more like this
- `←` / `→` — focus previous / next
- `Esc` — close focus

In Gallery, press `Space` to open the first visible candidate.

## Design intent

The application follows the project rule:

> If the black side profile does not work, 3D rendering, color and ornament will not save the product.

The design funnel is:

```text
Shape Hunt
  → shortlist 20–40 living silhouettes
  → A/B tournament
  → family check 120/240/330/440
  → handle exploration
  → technical geometry/CAD
  → production feasibility
```

## Data model

Feedback is stored in browser `localStorage` and can be exported as JSON. The export includes:

- generated shapes,
- Good / Bad / Save decisions,
- semantic tags,
- decision history,
- simple preference insight comparing saved/good vs rejected candidates.
