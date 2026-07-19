# Geometry System

## Geometry scope

The current app uses procedural SVG profiles for discovery. This is intentional. At the Shape Hunt stage, we do not need manufacturable CAD. We need hundreds of silhouettes and fast preference capture.

## Profile semantics

Each silhouette is produced from semantic shape features:

- height
- base diameter
- rim diameter
- belly amount
- waist tension
- foot undercut
- foot bead
- lip flare
- archetype bias
- quietness / expression

These are not final CAD parameters; they are visual direction parameters.

## Archetypes

Initial archetypes:

1. Quiet Heirloom
2. Soft Tulip
3. Low Table Cup
4. Noble Belly
5. Footed Classic
6. Modern Heirloom

## Family adaptation

A candidate is tested across the family by applying adaptations:

- 120 ml: lower, more stable, lighter, less waist, two handles later.
- 240 ml: stable child bridge.
- 330 ml: full DNA.
- 440 ml: bigger, controlled, not bucket-like.

## Later CAD path

Finalists should be converted from procedural profiles to a spline-based CAD definition:

- body as surface of revolution
- real wall thickness
- rolled/safe rim
- metal-forming radii
- enamel-compatible transitions
- handle sweep and attachment geometry

Possible future tooling:

- Python + CadQuery/OpenCascade for STEP
- Blender/Three.js for GLB/visualization
- Rhino/Grasshopper if manual industrial-design refinement is needed
