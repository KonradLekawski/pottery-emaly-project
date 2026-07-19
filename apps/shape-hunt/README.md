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

## Geometry generation — v3 research generator

The current generator no longer only adds evidence tags after the fact. **Research now changes the generated geometry itself.**

The v3 generator uses:

- continuous radius fields instead of a small repeated set of rearranged control points;
- smoothing passes before the profile is shown;
- category-specific grammars for Slavic, Viking/Nordic, Japan, Classic, French and Italian directions;
- pre-selection from an oversized pool, keeping the strongest evidence-weighted candidates;
- softer waists, lips, feet and shoulders for pressed steel and enamel;
- family-aware adaptation for 120 / 240 / 330 before candidates are promoted.

Each selected category can generate **500 research-weighted silhouettes**. Choosing “All evidence grammars” generates the same count per grammar.

The generator uses the evidence layer as a prior, not only as a label:

- smooth curvature preference;
- MAYA balance: recognizable cup + one controlled gesture;
- proportion bands for 120 / 240 / 330;
- family coherence;
- pressed-steel / enamel edge safety;
- handle energy that can translate to two child handles and one adult handle.

## Evidence scoring

The app includes a research-backed evidence layer. It does **not** decide the final cup. It ranks candidates using stronger priors from research and manufacturing constraints:

- **Smooth curvature** — curved / rounded contours generally outperform angular contours.
- **MAYA balance** — recognizable as a cup/filiżanka, but with one controlled signature gesture.
- **Ratio band fit** — uses proportion bands, not a golden-ratio dogma.
- **Family coherence** — 120 / 240 / 330 stay related without becoming clones.
- **Handle ergonomics proxy** — checks whether handle energy is plausible across child/adult sizes.
- **Enamel / pressed-steel risk** — penalizes sharp feet, hard waists and knife-like rims.

New filters:

```text
Evidence-backed only
High curvature preference
High MAYA
Strong family coherence
```

New view:

```text
Evidence
```

The Evidence view ranks candidates by `verifiedEvidenceScore` and shows the main research-backed signals.

## Map Lab

Map Lab is the analysis workspace for understanding which variables matter.

Map interaction modes:

```text
Inspect
Good
Bad
Save
More like this
Clear
```

Dots are persistent:

```text
Good  = green, mapScore +1
Bad   = red,   mapScore -1
Saved = gold,  mapScore +2
```

These decisions are stored in browser `localStorage`, reflected in the map colors after reload and included in feedback export via the normal decision object.

## Current MVP

Shape Hunt supports:

- generation of hundreds/thousands of Table Line silhouettes;
- modernized category grammars: Slavic, Viking/Nordic, Japan, Classic, French, Italian;
- Gallery view with fast Good / Bad / Save / More Like This actions;
- immediate **3-model preview** on every card: 120 / 240 / 330, with handles included;
- automatic dimensional filters: All, Table dimension fit, Pressed steel safe, Road / cup-holder potential, Evidence-backed, High curvature, High MAYA, Strong family coherence;
- **Road Fit** view for testing whether saved DNA can translate into cup-holder-compatible travel bodies;
- outsourced closure-system placeholder for travel models;
- **Evidence** view for research-backed candidate ranking;
- **Map Lab** with variable axes, map click modes, persistent Good/Bad/Save coloring and mapScore;
- Sort modes: recommended, newest, soul score, table presence, strong foot, lower silhouettes, saved first;
- archetype/category filtering;
- hiding rejected shapes from the current batch;
- **Brutal silhouette mode** for evaluating only the black contour;
- Focus dialog with large silhouette, designer read, fit system, evidence scoring and semantic tags;
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

For saved or Good candidates, the app shows:

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

## Fit system

The fit system treats dimensions as a design constraint, not a late-stage correction.

Modes:

- **All shapes** — browse everything.
- **Table dimension fit** — only shapes whose 120 / 240 / 330 translations stay in the intended Table Line ranges.
- **Pressed steel safe** — only softer, lower-angularity shapes likely to be safer for drawn steel and enamel.
- **Road / cup-holder potential** — shapes whose DNA can plausibly translate to a travel body.
- **Evidence-backed only** — shapes that pass the research-backed scoring layer.

Road line rules are intentionally separate from Table Line. A travel version should use a more vertical body, a narrow cup-holder base and a closure interface. Closure/lid design is treated as an outsourced module candidate, not solved inside Shape Hunt.

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
  → evidence-weighted silhouette discovery
  → Map Lab / variable-space exploration
  → shortlist 20–40 living silhouettes
  → dimensional / production-safe screening
  → A/B tournament
  → family matrix 120/240/330 with handles
  → Road Fit translation check
  → handle exploration
  → technical geometry/CAD
  → production feasibility
```

## Data model

Feedback is stored in browser `localStorage` and can be exported as JSON. The export includes:

- generated shapes;
- research/evidence scores;
- Good / Bad / Save decisions;
- persistent `mapScore` from Map Lab;
- semantic tags;
- decision history;
- simple preference insight comparing saved/good vs rejected candidates.
