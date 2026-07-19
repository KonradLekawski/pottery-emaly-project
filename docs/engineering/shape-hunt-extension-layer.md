# Shape Hunt Extension Layer

## Purpose

The base Shape Hunt MVP gives us fast silhouette browsing. The extension layer adds the next level of design-review behavior without converting the tool into a CAD editor.

The goal is still the same:

> See many forms quickly, save the living ones, reject dead ones, and understand what the eye is selecting.

## Added capabilities

### 1. Brutal silhouette mode

A mode that removes most card metadata and keeps attention on the black contour.

Use it when the screen starts to feel too rational or metric-driven.

### 2. Taste Signal

A compact panel comparing the average feature tendencies of selected/saved forms against rejected forms.

This turns raw feedback into simple design language:

- selected forms may be lower,
- selected forms may have a stronger foot,
- rejected forms may carry more camping risk,
- saved forms may have more shoulder or waist tension.

This is not a final machine-learning model. It is a readable signal for design direction.

### 3. Shape Map

A two-axis map of the current batch. It helps see clusters of:

- saved candidates,
- good candidates,
- rejected candidates,
- unexplored areas.

Default axes are `tableScore` and `soulScore`, but the map can compare other dimensions such as foot, lip, waist, camping risk, height or rim.

### 4. Review Board

A calmer board for saved silhouettes. The gallery is for hunting; the review board is for conversation.

The board can export an HTML review sheet for design sessions.

## Design principle

The extension layer should never become a complicated parameter editor. The project is still in the discovery phase.

Good interaction:

```text
look → react → save/reject → compare → review
```

Bad interaction at this stage:

```text
open 30 sliders → manually tune one model → rationalize a weak silhouette
```

## Next engineering step

The next major step is to replace the simple heuristic `More Like This` with a preference-guided generator that uses:

- saved candidates,
- rejected candidates,
- semantic tags,
- tournament wins,
- decision speed.
