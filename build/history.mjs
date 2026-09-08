export const HISTORY_LIMIT = 50;

function limitValue(value) {
  const parsed = Number.isFinite(value) ? Math.trunc(value) : HISTORY_LIMIT;
  return Math.max(1, parsed);
}

export function createHistory(present, limit = HISTORY_LIMIT) {
  return {
    past: [],
    present,
    future: [],
    limit: limitValue(limit),
  };
}

export function record(history, present) {
  if (present === history.present) return history;
  return {
    past: [...history.past, history.present].slice(-history.limit),
    present,
    future: [],
    limit: history.limit,
  };
}

export function sync(history, present) {
  if (present === history.present) return history;
  return { ...history, present };
}

export function undo(history) {
  if (history.past.length === 0) return history;
  const present = history.past.at(-1);
  return {
    past: history.past.slice(0, -1),
    present,
    future: [history.present, ...history.future].slice(0, history.limit),
    limit: history.limit,
  };
}

export function redo(history) {
  if (history.future.length === 0) return history;
  const present = history.future[0];
  return {
    past: [...history.past, history.present].slice(-history.limit),
    present,
    future: history.future.slice(1),
    limit: history.limit,
  };
}

export function canUndo(history) {
  return history.past.length > 0;
}

export function canRedo(history) {
  return history.future.length > 0;
}
