import assert from "node:assert/strict";
import test from "node:test";
import { HISTORY_LIMIT, canRedo, canUndo, createHistory, record, redo, sync, undo } from "../history.mjs";

test("history undoes and redoes immutable deck snapshots", () => {
  const first = { id: "one" };
  const second = { id: "two" };
  const third = { id: "three" };
  let history = createHistory(first);
  history = record(history, second);
  history = record(history, third);
  assert.equal(canUndo(history), true);
  assert.equal(undo(history).present, second);
  history = undo(history);
  assert.equal(canRedo(history), true);
  history = redo(history);
  assert.equal(history.present, third);
});

test("recording after undo clears the redo branch", () => {
  let history = createHistory("a");
  history = record(history, "b");
  history = record(history, "c");
  history = undo(history);
  history = record(history, "d");
  assert.equal(history.present, "d");
  assert.equal(canRedo(history), false);
  assert.deepEqual(history.past, ["a", "b"]);
});

test("history keeps only the newest fifty snapshots and syncs selection changes", () => {
  let history = createHistory(0);
  for (let value = 1; value <= HISTORY_LIMIT + 8; value += 1) history = record(history, value);
  assert.equal(history.past.length, HISTORY_LIMIT);
  assert.equal(history.past[0], 8);
  history = sync(history, "selected-slide");
  assert.equal(history.present, "selected-slide");
  assert.equal(canUndo(history), true);
  assert.equal(undo(history).present, HISTORY_LIMIT + 7);
});
