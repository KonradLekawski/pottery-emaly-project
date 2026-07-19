# Shape Hunt evidence-driven roadmap

This roadmap translates the research brief into product and engineering work.

## Product principle

Shape Hunt should not simply generate many shapes. It should generate **evidence-weighted candidates** and help us discover which evidence-backed primitives matter for this brand.

The user should feel like they are browsing a refined design archive, not random parametric noise.

---

## Workstream 1 — Evidence scoring layer

### Goal
Every shape receives interpretable scores before it appears in the gallery.

### Scores to add

1. `smoothCurvatureScore`
2. `angularRisk`
3. `pressSafeScore`
4. `mayaScore`
5. `typicalityScore`
6. `noveltyScore`
7. `fluencyScore`
8. `ratioBandScore`
9. `tablePresenceScore`
10. `familyCoherenceScore`
11. `handleErgonomicsScore`
12. `roadPotentialScore`

### UI impact

Each card should show compact evidence badges:

```text
curved 92 · MAYA 71 · press 84 · family 76
```

Focus view should explain why the candidate scored well or badly.

---

## Workstream 2 — Replace raw category labels with geometry grammars

### Goal
Categories must produce genuinely different silhouettes.

### Grammar rules

Each grammar must define:

- height/rim/base target bands,
- profile structure,
- foot behavior,
- belly behavior,
- waist behavior,
- lip behavior,
- handle behavior,
- novelty limit,
- press-safe limit.

### Initial grammars

1. Heirloom Soft / Slavic Modern
2. Nordic Restraint
3. Japan Quiet Bowl-Cup
4. Classic Modern
5. French Soft Tulip
6. Italian Cafe Warmth

### Acceptance criteria

A generated set is accepted only if:

- each grammar has distinguishable distribution in Shape Map,
- angular risk is mostly low,
- the card silhouettes are visibly different across grammars,
- family matrix does not collapse into clones.

---

## Workstream 3 — Human preference loop with semantic tags

### Goal
The app should learn why a form works, not only whether it works.

### Add tag groups

#### Curvature / manufacturability
- too angular
- soft enough
- too sharp for enamel
- pressed steel safe

#### MAYA
- too ordinary
- too strange
- good signature gesture
- overdesigned

#### Table presence
- good foot
- weak foot
- good rim
- rim too loud
- table object
- camping drift

#### Family
- 120 dignified
- 120 toy risk
- 240 works
- 330 DNA strong
- family coherent

#### Handles
- handle works
- handle too heavy
- child handles good
- child handles toy-like

### Data export
Feedback export must include:

- shape parameters,
- evidence scores,
- tags,
- decision time,
- selected grammar,
- A/B wins/losses.

---

## Workstream 4 — Immediate family preview

### Goal
No candidate should be judged as a single 330 ml body only.

### Required on every card

```text
120 ml — two handles
240 ml — two handles
330 ml — one handle
```

### Required in Family Matrix

For each saved/good candidate:

```text
3 variants × 3 sizes
A Signature
B Pressed Soft
C Table Hero
```

### Acceptance criteria

A candidate is not promoted unless:

- 120 is not toy-like,
- 240 bridges child/adult,
- 330 reads as brand DNA,
- handles are visually coherent,
- each size passes dimension fit or is flagged.

---

## Workstream 5 — Automatic dimensional filters

### Goal
Geometry should be constrained early, not after emotional selection.

### Table Line filters

Use current working ranges:

```text
120: H 46–58, base 58–68, rim 74–84
240: H 60–74, base 66–78, rim 86–100
330: H 76–90, base 70–82, rim 94–108
```

### Filter modes

- All shapes
- Table dimension fit
- Pressed steel safe
- Road / cup-holder potential
- Evidence-backed only
- High MAYA only
- Low angularity only

---

## Workstream 6 — Road Line gate

### Goal
Road Line should remain separate but visible as platform potential.

### Rules

- Table Line must not become a travel mug.
- Road Line should use vertical body translation.
- Base <= 71 mm is preferred for most cup holders.
- 72–77 mm is acceptable with warning.
- >77 mm requires larger holder or adapter.
- Closure/lid is outsourced; app should model the interface only.

### Add Road Fit panel

For saved/good candidates show:

```text
350 ml road translation
480 ml road translation
base diameter
cup-holder fit class
closure ring diameter
outsourced lid module warning
```

---

## Workstream 7 — Research validation mode

### Goal
The app should make it obvious what is evidence-backed and what is experimental.

### UI additions

- Research badge per candidate:
  - Verified primitives passed
  - Directional primitives passed
  - Open hypotheses active
- Explanation panel:
  - why the app thinks this candidate is promising,
  - which research primitives support it,
  - which assumptions still need user testing.

### Definition of app-verified geometry

A geometry is app-verified when it satisfies:

1. 5-source-supported primitives where applicable,
2. table dimensions,
3. pressed steel/enamel guardrails,
4. family matrix acceptance,
5. repeated Good/Save user signal,
6. A/B tournament wins,
7. no severe Road Line false promise.

---

## Next implementation steps

### Step 1
Add `evidence-scoring.js` and compute research primitives per shape.

### Step 2
Refactor Shape Map to include evidence axes:

- smoothCurvatureScore
- mayaScore
- pressSafeScore
- familyCoherenceScore

### Step 3
Add Evidence Filter:

```text
All
Verified primitives
High curvature preference
High MAYA
Low angularity
Strong family coherence
```

### Step 4
Improve generator grammar:

- sample from evidence-weighted distributions,
- reject kinks before render,
- ensure smooth curvature continuity,
- use grammar-specific profile builders.

### Step 5
Add user-study export:

```json
{
  "participant": "optional",
  "sessionId": "...",
  "decisions": [],
  "shapes": [],
  "evidenceScores": [],
  "summary": {}
}
```

### Step 6
After enough user feedback, use the app to produce:

- top 20 evidence-backed silhouettes,
- top 5 family candidates,
- top 2 Table Line bodies,
- handoff to Handle Hunt,
- then CAD geometry exploration.
