# Pottery Emaly Project

A product-design repository for a premium family enamelware platform.

The first milestone is **Table Line**: a silhouette-first exploration tool for finding the core geometry of a family of enamel cups:

- **120 ml** — toddler / first cup / two handles
- **240 ml** — child / two handles
- **330 ml** — family daily / one handle / brand DNA
- **440 ml** — large family cup / one handle

The project starts with a deliberate constraint: **before CAD, before decoration, before color, find the silhouette that has soul**.

## Current app

`apps/shape-hunt` is a static browser prototype for quickly browsing hundreds of generated cup silhouettes, saving promising directions, rejecting dead forms, and generating more shapes around a selected candidate.

Run locally:

```bash
cd apps/shape-hunt
python3 -m http.server 5173
```

Open:

```text
http://localhost:5173
```

No build step is required.

## Product philosophy

This is not a camping mug.  
This is not a children’s training cup.  
This is not a porcelain imitation.

The ambition is to create a **new family table object**: durable like enamel, elegant enough for a classic table, warm enough for children, and recognizable enough to become a brand platform.

## Repository structure

```text
apps/
  shape-hunt/          Static silhouette discovery app
data/
  archetypes.json      Shape archetype definitions
docs/
  product and geometry design notes
scripts/
  local utility scripts
```

## Design funnel

```text
Shape Hunt
  → shortlist 20–40 living silhouettes
  → A/B tournament
  → family check 120/240/330/440
  → handle exploration
  → technical geometry/CAD
  → production feasibility
```

## Current status

Early product prototype. The app is for visual direction-finding, not final manufacturable CAD.
