# Shape Hunt

A static, silhouette-first discovery app for the Pottery Emaly Project.

The app exists for one job: **browse many cup silhouettes quickly and identify the shapes that feel alive**. It intentionally avoids CAD complexity, material renders, decoration, and manual parameter editing at this stage.

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

## Geometry generation — v2 grammar model

The current generator no longer uses one universal profile with the same points shuffled around.

It uses **distinct cultural-form grammars**, each modernized and softened for pressed steel/enamel:

- **Slavic Modern** — grounded heirloom warmth, ritual table presence, no folk literalism.
- **Viking / Nordic Modern** — low gravity, honest mass, northern restraint.
- **Japan Modern** — quiet low bowl-cup, precise foot, controlled rim.
- **Classic Modern** — balanced table cup, familiar but not generic.
- **French Modern** — restrained salon tulip, lifted rim, elegant tension.
- **Italian Modern** — cafe warmth, cappuccino softness, generous but controlled rim.

Each selected category can generate **500 silhouettes**. Choosing “All modern categories” generates the same count per category.

The engine also adds pressed-steel guardrails:

- softer spline transitions;
- fewer sharp waist/lip/foot breaks;
- implied larger radii for drawing steel;
- press-safe scoring;
- angularity warnings for enamel risk.

## Current MVP

Shape Hunt supports:

- generation of hundreds/thousands of Table Line silhouettes;
- modernized category grammars: Slavic, Viking/Nordic, Japan, Classic, French, Italian;
- Gallery view with fast Good / Bad / Save / More Like This actions;
- Sort modes: recommended, newest, soul score, table presence, strong foot, lower silhouettes, saved first;
- archetype/category filtering;
- hiding rejected shapes from the current batch;
- **Brutal silhouette mode** for evaluating only the black contour;
- Focus dialog with large silhouette, designer read and semantic tags;
- Shortlist view;
- A/B Tournament view;
- **Family Matrix**: 3 variants × 3 primary sizes, with handles included;
- **Shape Map** for seeing where Good / Bad / Saved decisions cluster;
- **Taste Signal** panel comparing selected vs rejected feature tendencies;
- **Review Board** for calmer finalist review;
- review board export to HTML;
- localStorage persistence;
- feedback export to JSON.

## Family Matrix

For saved or Good candidates, the app now shows:

```text
3 variants × 3 sizes

120 ml — two handles
240 ml — two handles
330 ml — one handle
```

Variants:

- **A / Signature** — primary DNA reading;
- **B / Pressed Soft** — larger implied radii, safer steel drawing;
- **C / Table Hero** — stronger table signature.

440 ml remains part of the broader product platform, but the current visual selection focuses on the three primary Table Line sizes so we can judge body + handles more clearly.

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
  → family matrix 120/240/330 with handles
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
