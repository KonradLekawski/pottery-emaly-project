# Evidence-backed geometry research

This document defines the research layer behind Shape Hunt. The goal is to stop treating geometry as arbitrary taste and begin treating each generated form as a hypothesis with evidence, constraints and test status.

## Verification rule

A geometry primitive is considered **evidence-backed** only when at least five credible sources support the underlying design claim. The app should distinguish:

- **Verified primitive** — 5+ sources support the principle.
- **Directional primitive** — 2–4 sources support the principle.
- **Open hypothesis** — plausible design logic, but needs our own testing.
- **Do not hard-code** — evidence is mixed or context-dependent.

This does not mean a final cup is automatically correct. It means the generator can use the primitive as a stronger prior.

---

## 1. Smooth curvature / low angularity

**Status:** verified primitive.

### Claim
People generally prefer smooth curved contours over sharp/angular contours, and sharp transitions can reduce comfort, trust or visual pleasantness. For our project this supports soft spline continuity, large implied radii, avoidance of kinked waists, and avoidance of sharp foot/rim breaks.

### Sources

1. Bar & Neta, 2006 — Humans Prefer Curved Visual Objects. Psychological Science. DOI: 10.1111/j.1467-9280.2006.01759.x
2. Bar & Neta, 2007 — Visual elements of subjective preference modulate amygdala activation. Neuropsychologia. DOI: 10.1016/j.neuropsychologia.2007.03.008
3. Westerman et al., 2012 — Product Design: Preference for Rounded versus Angular Design Elements. Psychology & Marketing. DOI: 10.1002/mar.20546
4. Bertamini et al., 2016 — Do observers like curvature or do they dislike angularity? British Journal of Psychology. DOI: 10.1111/bjop.12132
5. Soranzo et al., 2018 — On the perceptual aesthetics of interactive objects. Quarterly Journal of Experimental Psychology. DOI: 10.1177/1747021817749228
6. Gong et al., 2023 — Circular or angular? How nostalgia affects product shape preference. Psychology & Marketing. DOI: 10.1002/mar.21757

### App translation

Add these geometry metrics:

- `curvatureContinuityScore`
- `angularRisk`
- `minimumRadiusProxy`
- `kinkCount`
- `splineSmoothness`

Generator rule:

```text
prefer continuous curvature,
avoid adjacent control points that create abrupt radius acceleration,
penalize lip/waist/foot discontinuities,
show angularity warning in Focus and Fit System.
```

---

## 2. Typicality + novelty / MAYA

**Status:** verified primitive.

### Claim
People tend to prefer designs that balance recognizability with novelty. A shape that is too typical is boring; a shape that is too novel becomes unacceptable. For Table Line this means the body must still read as cup/filiżanka, but with one clear signature gesture: foot, rim, waist or handle.

### Sources

1. Hekkert, Snelders & Van Wieringen, 2003 — Most Advanced, Yet Acceptable. British Journal of Psychology. DOI: 10.1348/000712603762842147
2. Mulder-Nijkamp, 2020 — Bridging the gap between design and behavioral research. Creativity and Innovation Management. DOI: 10.1111/caim.12393
3. Suhaimi et al., 2023 — Probing the Extremes of Aesthetics. Empirical Studies of the Arts. DOI: 10.1177/02762374221094137
4. Chen et al., 2025/2026 — Categorization and Aesthetic Preference. Empirical Studies of the Arts. DOI: 10.1177/02762374251371282
5. Wu, Yahaya, Tai & Ren, 2026 — Practical research on the boundaries of MAYA design principles with ceramic products as the carrier. PLOS ONE. DOI: 10.1371/journal.pone.0342855

### App translation

Add these geometry/product metrics:

- `typicalityScore` — cup/filiżanka recognizability.
- `noveltyScore` — difference from baseline category.
- `mayaScore` — high only when both are present.
- `signatureGestureScore` — one gesture without overdesign.

Generator rule:

```text
reject dead generic cylinders,
reject novelty that breaks recognizability,
encourage one signature gesture only,
let category grammars vary in novelty tolerance.
```

---

## 3. Processing fluency, symmetry and harmonic proportion

**Status:** directional primitive with caution.

### Claim
Visual ease, order, symmetry and figure-ground clarity tend to support aesthetic pleasure. Golden-ratio claims are mixed: they should not be treated as a universal law for cups. Use harmonic proportion as a soft attractor, not a hard rule.

### Sources

1. Reber, Schwarz & Winkielman, 2004 — Processing Fluency and Aesthetic Pleasure. Personality and Social Psychology Review. DOI: 10.1207/s15327957pspr0804_3
2. McManus & Weatherby, 1997 — The Golden Section and the Aesthetics of Form and Composition. Empirical Studies of the Arts. DOI: 10.2190/WWCR-VWHV-2Y2W-91EE
3. Boselie, 1992 — The Golden Section has no Special Aesthetic Attractivity. Empirical Studies of the Arts. DOI: 10.2190/QB14-NK7B-ARYT-W5QT
4. Russell, 2000 — Testing the Aesthetic Significance of the Golden-Section Rectangle. Perception. DOI: 10.1068/p3037
5. De Bartolo et al., 2022 — The golden ratio as an ecological affordance. PsyCh Journal. DOI: 10.1002/pchj.505
6. Lucia et al., 2024 — Eye Tracking Study on Symmetry and Golden Ratio in Abstract Art. Symmetry. DOI: 10.3390/sym16091168
7. Iosa et al., 2025 — A Kinetic Ecological Approach to Beauty Perception. European Journal of Neuroscience. DOI: 10.1111/ejn.70119

### App translation

Use ratio bands, not single magic values:

```text
Table Line 120 ml: H/rimD 0.60–0.78
Table Line 240 ml: H/rimD 0.68–0.84
Table Line 330 ml: H/rimD 0.78–0.94
Travel/Road: H/baseD much higher, but separate line
```

Add:

- `fluencyScore`
- `axisClarityScore`
- `ratioBandScore`
- `symmetryScore`

Do not hard-code golden ratio as final truth.

---

## 4. Ergonomic handle comfort

**Status:** directional primitive.

### Claim
A handle must be designed around finger clearance, pressure distribution, grip type and center of gravity, not only aesthetics. For children, two handles should act as light wings and support stable two-hand holding.

### Sources

1. Agung et al., 2023 — Ergonomic cup handle design analysis at Naruna Ceramic Studio. Cogent Engineering. DOI: 10.1080/23311916.2023.2253035
2. CCOHS — Powered Hand Tools: Ergonomics. Recommended handle lengths and grip considerations.
3. Applied Ergonomics, 2017 — Effects of tool handle dimension on torque strength, usability and discomfort. DOI: 10.1016/j.apergo.2016.10.004
4. Designing for People — Hand Tool Design: handle diameter and pressure distribution guidance.
5. EHS Today — Ergonomic Guidelines for Selecting Hand and Power Tools: handle length, diameter and rounded padded handles.

### App translation

Add:

- `handleClearanceScore`
- `handlePressureScore`
- `handleWeightProxy`
- `handleCenterOfGravityDistance`
- `childTwoHandleScore`

Rules:

```text
120/240 ml: two handles shown immediately.
330 ml: one handle.
Travel line: no table handle by default; consider grip relief, sleeve or lid loop separately.
```

---

## 5. Pressed steel + enamel manufacturability

**Status:** verified manufacturing constraint, not aesthetic claim.

### Claim
Pressed/drawn steel and enamel punish sharp edges, abrupt transitions and tight radii. The geometry generator must not output ceramic-fantasy profiles with sharp waists, hard lips or aggressive feet.

### Sources

1. Machine Design — Porcelain enamel tends to pull away from sharp edges; rounded corners improve adhesion and reduce chipping.
2. ASTM C660 references — sharp edges should be avoided for porcelain enameling; corners should be rounded with generous radii.
3. Deep drawing design guidance — use generous radii, avoid sharp corners, gradual transitions.
4. Sheet-metal forming guidelines — internal/external corner radii should be multiples of sheet thickness.
5. Deep draw process references — punch/die radii and draw depth ratio affect tearing, thinning and wrinkling.

### App translation

Add:

- `pressSafeScore`
- `enamelEdgeRisk`
- `drawRatioProxy`
- `minRadiusProxy`
- `transitionSeverity`

Rules:

```text
penalize sharp foot/rim/waist breaks,
prefer large radii and monotonic-ish material flow,
show manufacturability warning before aesthetic score,
separate visual exploration from CAD readiness.
```

---

## Geometry categories for the next generator

The app should stop showing categories as vague styles. Each category should be an evidence-informed grammar.

### Universal evidence-backed primitives

These apply across categories:

1. smooth curvature,
2. recognizability + one novelty gesture,
3. table-stable proportions,
4. no sharp manufacturing-risk transitions,
5. clear family adaptation: 120 / 240 / 330,
6. handle ergonomics visible early,
7. road line screened separately.

### Category grammars

1. **Heirloom Soft / Slavic Modern**
   - High foot signature.
   - Warm belly.
   - Low-to-medium waist.
   - Rounded, ritual, family table.

2. **Nordic Restraint**
   - Low gravity.
   - Broad base.
   - Very quiet rim.
   - Almost no drama; premium through restraint.

3. **Japan Quiet Bowl-Cup**
   - Low, bowl-cup stance.
   - Very high fluency and low angularity.
   - Subtle foot and modest lip.

4. **Classic Modern**
   - Highest typicality.
   - Balanced dimensions.
   - Low novelty; used as acceptability anchor.

5. **French Soft Tulip**
   - More rim/lip gesture.
   - More waist tension.
   - Must be capped to avoid porcelain cosplay.

6. **Italian Cafe Warmth**
   - Warm belly.
   - Generous rim.
   - Cappuccino/cafe feeling, but controlled for steel.

## App roadmap from the research

### Phase 1 — Evidence layer

- Add research weights to generator.
- Show badges: Verified, Directional, Open Hypothesis.
- Add angularity / fluency / MAYA / press scores.

### Phase 2 — Better generated forms

- Replace point-shuffle forms with real grammar families.
- Generate 500 per grammar.
- Smooth splines with radius continuity.
- Penalize sharp control-point acceleration.

### Phase 3 — Human preference loop

- Add explicit tags tied to evidence primitives:
  - smooth/too angular,
  - too generic/too novel,
  - good foot,
  - good rim,
  - handle works,
  - family works,
  - road potential.
- Taste model should infer preferences by primitive, not only by raw dimensions.

### Phase 4 — Family proof

- Every candidate card should show 120 / 240 / 330 immediately.
- Family Matrix should compare three variants per size:
  - Signature,
  - Pressed Soft,
  - Table Hero.
- 440 stays in platform checks, but not in the main fast-selection grid.

### Phase 5 — Road Line gate

- Road Line is not a scaled Table Line.
- It receives a separate vertical body grammar.
- Use cup-holder base thresholds:
  - <= 71 mm broadest fit,
  - 72–77 mm many vehicles,
  - >77 mm risky / larger holders.
- Closure system is a supplier module; app tracks interface requirements only.

### Phase 6 — Validation

A geometry becomes app-verified only when:

1. it passes evidence-backed primitive constraints,
2. it passes dimensional filters,
3. it receives repeated positive user feedback,
4. it wins A/B comparisons,
5. it survives family matrix review,
6. it does not trigger press/enamel risk warnings.
