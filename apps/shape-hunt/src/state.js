const STORAGE_KEY = 'shapeHunt.core.v1';

export const DEFAULT_STATE = {
  seed: 1247,
  view: 'gallery',
  focusId: null,
  shapes: [],
  decisions: {},
  tags: {},
  history: [],
  settings: {
    grammar: 'all',
    perGrammar: 500,
    sort: 'recommended',
    includeRejected: false,
    fitFilter: 'all',
    mapClickMode: 'inspect',
    mapPreset: 'taste',
    mapX: null,
    mapY: null,
    mapSize: null,
    mapColor: null
  }
};

export function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return mergeState(DEFAULT_STATE, parsed);
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    seed: state.seed,
    view: state.view,
    focusId: state.focusId,
    shapes: state.shapes,
    decisions: state.decisions,
    tags: state.tags,
    history: state.history.slice(-2000),
    settings: state.settings
  }));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
}

function mergeState(base, incoming) {
  return {
    ...structuredClone(base),
    ...incoming,
    settings: { ...base.settings, ...(incoming.settings ?? {}) },
    decisions: incoming.decisions ?? {},
    tags: incoming.tags ?? {},
    history: incoming.history ?? [],
    shapes: incoming.shapes ?? []
  };
}

export function decisionFor(state, id) {
  return state.decisions[id] ?? {};
}

export function setDecision(state, id, patch, event = 'decision') {
  const previous = decisionFor(state, id);
  state.decisions[id] = { ...previous, ...patch, updatedAt: new Date().toISOString() };
  state.history.push({ id, event, at: new Date().toISOString(), patch });
  saveState(state);
}
