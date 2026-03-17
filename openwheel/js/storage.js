/**
 * storage.js
 * Handles all persistence via localStorage.
 * No external dependencies.
 */

const STORAGE_KEY = "openwheel_v1";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function defaultData() {
  const id = uid();
  return {
    activeId: id,
    wheels: {
      [id]: {
        name: "My First Wheel",
        entries: ["Alice", "Bob", "Charlie", "Diana", "Evan", "Fiona"],
      },
    },
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const data = JSON.parse(raw);
    // Validate basic shape
    if (!data.wheels || typeof data.wheels !== "object") return defaultData();
    if (!data.activeId || !data.wheels[data.activeId]) {
      const ids = Object.keys(data.wheels);
      data.activeId = ids.length ? ids[0] : null;
    }
    return data;
  } catch (_) {
    return defaultData();
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

function createWheel(data, name) {
  const id = uid();
  data.wheels[id] = { name: name.trim(), entries: [] };
  data.activeId = id;
  return id;
}

function deleteWheel(data, id) {
  delete data.wheels[id];
  const remaining = Object.keys(data.wheels);
  data.activeId = remaining.length ? remaining[remaining.length - 1] : null;
}

function addEntry(data, text) {
  if (!data.activeId) return;
  data.wheels[data.activeId].entries.push(text.trim());
}

function removeEntry(data, index) {
  if (!data.activeId) return;
  data.wheels[data.activeId].entries.splice(index, 1);
}

function clearEntries(data) {
  if (!data.activeId) return;
  data.wheels[data.activeId].entries = [];
}

function renameWheel(data, id, name) {
  if (data.wheels[id]) data.wheels[id].name = name.trim();
}
