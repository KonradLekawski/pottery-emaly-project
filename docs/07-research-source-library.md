# Research source library — evidence-backed geometry

This file separates **research-backed design primitives** from taste hypotheses. A geometry rule becomes a strong app prior only when the underlying claim has at least five credible sources or when it is a manufacturing requirement from standards / technical guidance.

## Evidence scale

- **Verified primitive** — 5+ credible sources support the design claim.
- **Directional primitive** — 2–4 sources support the design claim.
- **Manufacturing constraint** — validated by standards, technical manuals or process guidance; not an aesthetic claim.
- **Open hypothesis** — plausible for our brand, but must be validated through Shape Hunt decisions.

---

## 1. Smooth curvature / low angularity

**Status:** Verified primitive.

### Claim

People generally prefer curved / rounded contours over sharp / angular contours. For Table Line this means the generator should strongly prefer continuous curvature, large implied radii and low kink count. Sharp feet, knife-like waists and hard rim breaks should be penalized, even if they look interesting in a single SVG.

### Sources

1. Bar, M. & Neta, M. (2006). *Humans Prefer Curved Visual Objects.* Psychological Science. DOI: `10.1111/j.1467-9280.2006.01759.x`.
2. Bar, M. & Neta, M. (2007). *Visual elements of subjective preference modulate amygdala activation.* Neuropsychologia. DOI: `10.1016/j.neuropsychologia.2007.03.008`.
3. Westerman, S. J. et al. (2012). *Product Design: Preference for Rounded versus Angular Design Elements.* Psychology & Marketing. DOI: `10.1002/mar.20546`.
4. Bertamini, M. et al. (2016). *Do observers like curvature or do they dislike angularity?* British Journal of Psychology. DOI: `10.1111/bjop.12132`.
5. Soranzo, A. et al. (2018). *On the perceptual aesthetics of interactive objects.* Quarterly Journal of Experimental Psychology. DOI: `10.1177/1747021817749228`.
6. Gong, X. et al. (2023). *Circular or angular? How nostalgia affects product shape preference.* Psychology & Marketing. DOI: `10.1002/mar.21757`.

### App rule

```text
smoothCurvatureScore must be a primary score.
angularRisk must be visible in Focus and filters.
low angularity should outrank novelty.
```

---

## 2. Typicality + novelty / MAYA

**Status:** Verified primitive.

### Claim

People prefer artefacts that balance recognizability with novelty. A cup must remain recognizably a cup/filiżanka, but it needs one controlled signature gesture. Too ordinary is dead; too strange is fashion-object risk.

### Sources

1. Hekkert, P., Snelders, D. & Van Wieringen, P. C. W. (2003). *Most advanced, yet acceptable: Typicality and novelty as joint predictors of aesthetic preference in industrial design.* British Journal of Psychology. DOI: `10.1348/000712603762842147`.
2. Reber, R., Schwarz, N. & Winkielman, P. (2004). *Processing Fluency and Aesthetic Pleasure.* Personality and Social Psychology Review. DOI: `10.1207/s15327957pspr0804_3`.
3. Mulder-Nijkamp, M. (2020). *Bridging the gap between design and behavioral research.* Creativity and Innovation Management. DOI: `10.1111/caim.12393`.
4. Suhaimi et al. (2023). *Probing the extremes of aesthetics.* Empirical Studies of the Arts. DOI: `10.1177/02762374221094137`.
5. Wu, Yahaya, Tai & Ren (2026). *MAYA design principles with ceramic products as the carrier.* PLOS ONE. DOI: `10.1371/journal.pone.0342855`.

### App rule

```text
mayaScore = balance(typicalityScore, noveltyScore)
signatureGestureScore should reward exactly one strong gesture.
Reject: generic cylinders.
Reject: novelty that breaks cup recognizability.
```

---

## 3. Processing fluency, symmetry and proportion bands

**Status:** Directional primitive with caution.

### Claim

Fluent, legible, balanced forms are often more pleasing. Symmetry and figure-ground clarity are useful. Golden ratio should **not** be used as a hard rule; evidence is mixed and context-dependent.

### Sources

1. Reber, Schwarz & Winkielman (2004). *Processing Fluency and Aesthetic Pleasure.* DOI: `10.1207/s15327957pspr0804_3`.
2. McManus & Weatherby (1997). *The Golden Section and the Aesthetics of Form and Composition.* Empirical Studies of the Arts. DOI: `10.2190/ABC5-1U46-JV58-T636`.
3. Boselie, F. (1992). *The Golden Section has no Special Aesthetic Attractivity!* Empirical Studies of the Arts. DOI: `10.2190/QB14-NK7B-ARYT-W5QT`.
4. Russell, P. A. (2000). *Testing the Aesthetic Significance of the Golden-Section Rectangle.* Perception. DOI: `10.1068/p3037`.
5. De Bartolo et al. (2022). *The golden ratio as an ecological affordance leading to aesthetic attractiveness.* PsyCh Journal. DOI: `10.1002/pchj.505`.
6. Lucia et al. (2024). *Eye Tracking Study on Symmetry and Golden Ratio in Abstract Art.* Symmetry. DOI: `10.3390/sym16091168`.

### App rule

Use **ratio bands**, not magic constants.

```text
120 ml: H / rimD 0.60–0.78
240 ml: H / rimD 0.68–0.84
330 ml: H / rimD 0.78–0.94
Road line: separate vertical-body ratio logic.
```

---

## 4. Handle ergonomics

**Status:** Directional primitive.

### Claim

Handles must support finger clearance, pressure distribution and center-of-gravity control. For children, two handles should support stable two-hand holding but must read as light wings, not training-bottle grips.

### Sources

1. Agung, I. C. S. et al. (2023). *Ergonomic cup handle design analysis at Naruna Ceramic Studio.* Cogent Engineering. DOI: `10.1080/23311916.2023.2253035`.
2. Canadian Centre for Occupational Health and Safety (CCOHS). *Powered Hand Tools — Ergonomics.*
3. Pheasant & Haslegrave. *Bodyspace: Anthropometry, Ergonomics and the Design of Work.*
4. Applied Ergonomics literature on handle diameter and grip discomfort.
5. General hand-tool design guidance: rounded/padded handles distribute pressure and reduce discomfort.

### App rule

```text
120 / 240 ml: two handles visible from first family preview.
330 ml: one handle.
Travel/Road: no table handle by default; use grip relief, sleeve or lid loop separately.
```

---

## 5. Pressed steel + porcelain enamel manufacturability

**Status:** Manufacturing constraint.

### Claim

Pressed / drawn steel and enamel require soft geometry. Sharp transitions increase forming risk and enamel edge risk. The app must not promote hard ceramic-looking waists, sharp feet or knife-like rims as finalists.

### Sources

1. Machine Design. *Metallic looks that last.* Porcelain-enamel design guidance: enamels pull away from sharp edges; rounded corners improve adhesion and minimize chipping.
2. ASTM C660. *Standard Practices for Production and Preparation of Gray Iron Castings for Porcelain Enameling.* Sharp edges should be avoided; inside and outside corners should be rounded with generous radii.
3. Porcelain Enamel Institute technical guidance referenced by industry manuals.
4. General sheet-metal deep drawing design guidance: use generous radii and avoid sharp corners.
5. Deep drawing process references: draw ratio, punch/die radii and transition geometry affect tearing, thinning and wrinkling.

### App rule

```text
pressSafeScore must be first-class.
enamelEdgeRisk must block finalist promotion.
angularRisk > threshold should create a warning badge.
```

---

## 6. Cup-holder / Road Line constraints

**Status:** Practical product constraint, not aesthetic evidence.

### Claim

Road Line must be separate from Table Line. The base must fit common cup holders, but the table geometry should not be distorted into a travel mug. Closure/lid system should be treated as an outsourced supplier interface.

### Sources

1. HydroJug Size & Cup-Holder Fit Guide: <= 2.80 in / <= 71 mm fits most; 72–77 mm fits many; 78–83 mm larger/adjustable only.
2. EngineerFix: typical contemporary car cup holder internal diameter often falls around 2.5–3.5 in / 63.5–89 mm.
3. Cozy Cup Holder: practical ranges vary by vehicle class; compact cars can be around 2.7–2.9 in, SUVs/trucks larger.
4. Market references from travel tumblers show tapered bases are common for compatibility.
5. User requirement: Road Line must have closure system and fit most car holders.

### App rule

```text
Road base <= 71 mm: strong pass.
72–77 mm: warning / fits many.
78–83 mm: large-holder only.
>83 mm: fail.
Closure system = outsourced module; app shows closure ring only.
```

---

## Implementation status

Already implemented in Shape Hunt:

- cultural grammar generator,
- pressed-steel softness / angular risk guardrails,
- 3-model immediate preview,
- Table dimension filter,
- Pressed steel filter,
- Road Fit screen,
- closure-module placeholder.

Next to implement:

- `evidence-scoring.js`,
- research badges,
- `mayaScore`,
- `smoothCurvatureScore`,
- `familyCoherenceScore`,
- `evidence-backed only` filter,
- Focus explanation: why this form is supported by research vs why it remains only a hypothesis.
