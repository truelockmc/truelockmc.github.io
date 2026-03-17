/**
 * app.js
 * Main application logic.
 * Depends on: storage.js, wheel.js
 */

// ─── State ────────────────────────────────────────────────────────────────────

let data = loadData();
let renderer = null;
let debounceTimer = null;

// ─── DOM refs ─────────────────────────────────────────────────────────────────

const $ = (id) => document.getElementById(id);

const els = {
  wheelList: $("wheel-list"),
  newWheelBtn: $("new-wheel-btn"),
  titleArea: $("title-area"),
  entryCount: $("entry-count"),
  canvas: $("wheel-canvas"),
  spinBtn: $("spin-btn"),
  spinNote: $("spin-note"),
  entriesTextarea: $("entries-textarea"),
  shuffleBtn: $("shuffle-btn"),
  sortBtn: $("sort-btn"),
  clearBtn: $("clear-btn"),

  winnerOverlay: $("winner-overlay"),
  winnerName: $("winner-name"),
  spinAgainBtn: $("spin-again-btn"),
  closeWinnerBtn: $("close-winner-btn"),

  newWheelOverlay: $("new-wheel-overlay"),
  newWheelForm: $("new-wheel-form"),
  newWheelInput: $("new-wheel-input"),
  cancelNewWheel: $("cancel-new-wheel"),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function activeWheel() {
  return data.activeId ? data.wheels[data.activeId] : null;
}

function entries() {
  return activeWheel()?.entries ?? [];
}

function save() {
  saveData(data);
}

function setActive(id) {
  data.activeId = id;
  renderer.rotation = 0;
  save();
  render();
}

/** Parse textarea text into an entries array (split on newlines, trim, drop blanks). */
function parseTextarea(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/** Sync textarea value → data.entries, save, redraw (no full re-render to preserve cursor). */
function syncFromTextarea() {
  if (!data.activeId) return;
  data.wheels[data.activeId].entries = parseTextarea(els.entriesTextarea.value);
  save();
  updateEntryCount();
  updateSpinBtn();
  renderer.draw(entries());
}

// ─── Render ───────────────────────────────────────────────────────────────────

function render() {
  renderWheelList();
  renderTitleArea();
  renderTextarea();
  updateEntryCount();
  updateSpinBtn();
  renderer.draw(entries());
}

function renderWheelList() {
  const ids = Object.keys(data.wheels);
  els.wheelList.innerHTML = "";

  ids.forEach((id) => {
    const wheel = data.wheels[id];
    const item = document.createElement("li");
    item.className = "wheel-item" + (id === data.activeId ? " is-active" : "");

    const name = document.createElement("span");
    name.className = "wheel-item__name";
    name.textContent = wheel.name;

    const del = document.createElement("button");
    del.className = "wheel-item__del";
    del.innerHTML = "&times;";
    del.title = "Delete wheel";
    del.setAttribute("aria-label", "Delete " + wheel.name);

    item.appendChild(name);
    if (ids.length > 1) item.appendChild(del);

    item.addEventListener("click", (e) => {
      if (e.target === del) return;
      if (id !== data.activeId) setActive(id);
    });

    del.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!confirm(`Delete "${wheel.name}"?`)) return;
      deleteWheel(data, id);
      save();
      render();
    });

    els.wheelList.appendChild(item);
  });
}

function renderTitleArea() {
  const wheel = activeWheel();
  if (!wheel) {
    els.titleArea.innerHTML =
      '<span class="wheel-title" style="color:var(--text-3)">No wheel selected</span>';
    return;
  }

  const span = document.createElement("span");
  span.className = "wheel-title";
  span.textContent = wheel.name;
  span.title = "Click to rename";
  span.addEventListener("click", () => startRename(wheel.name));

  els.titleArea.innerHTML = "";
  els.titleArea.appendChild(span);
}

function startRename(current) {
  const form = document.createElement("form");
  form.className = "rename-form";

  const input = document.createElement("input");
  input.type = "text";
  input.value = current;
  input.maxLength = 60;

  const ok = document.createElement("button");
  ok.type = "submit";
  ok.className = "btn-icon";
  ok.textContent = "✓";

  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "btn-icon";
  cancel.textContent = "✕";

  form.append(input, ok, cancel);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (val && data.activeId) {
      renameWheel(data, data.activeId, val);
      save();
    }
    render();
  });

  cancel.addEventListener("click", () => render());

  els.titleArea.innerHTML = "";
  els.titleArea.appendChild(form);
  input.focus();
  input.select();
}

/** Set textarea to the current entries (one per line). */
function renderTextarea() {
  els.entriesTextarea.value = entries().join("\n");
}

function updateEntryCount() {
  const n = entries().length;
  els.entryCount.textContent = n === 1 ? "1 entry" : `${n} entries`;
}

function updateSpinBtn() {
  const n = entries().length;
  const spinning = renderer?.isSpinning ?? false;
  els.spinBtn.disabled = spinning || n < 2;
  els.spinNote.textContent =
    n < 2 && !spinning ? "Add at least 2 entries to spin." : "";
}

// ─── Canvas sizing ────────────────────────────────────────────────────────────

function sizeCanvas() {
  const area = $("canvas-area");
  const rect = area.getBoundingClientRect();
  const size = Math.floor(Math.min(rect.width - 20, rect.height - 20, 720));
  const canvas = els.canvas;
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";
  canvas.width = size;
  canvas.height = size;

  const wrap = $("pointer-wrap");
  wrap.style.position = "absolute";
  wrap.style.left = (rect.width - size) / 2 + "px";
  wrap.style.top = (rect.height - size) / 2 + "px";
  wrap.style.width = size + "px";
  wrap.style.height = size + "px";

  const ptr = $("pointer");
  ptr.style.position = "absolute";
  ptr.style.top = "-20px";
  ptr.style.left = size / 2 + "px";
  ptr.style.transform = "translateX(-50%)";

  renderer.draw(entries());
}

// ─── Events ───────────────────────────────────────────────────────────────────

// Textarea: live sync with debounce
els.entriesTextarea.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(syncFromTextarea, 180);
});

// Spin
els.spinBtn.addEventListener("click", () => {
  if (renderer.isSpinning) return;
  els.spinBtn.disabled = true;
  els.spinNote.textContent = "";
  renderer.spin(entries(), (winner) => {
    showWinner(winner);
    updateSpinBtn();
  });
});

// Shuffle
els.shuffleBtn.addEventListener("click", () => {
  if (!data.activeId) return;
  const arr = entries().slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  data.wheels[data.activeId].entries = arr;
  save();
  renderTextarea();
  renderer.draw(entries());
});

// Sort A-Z
els.sortBtn.addEventListener("click", () => {
  if (!data.activeId) return;
  data.wheels[data.activeId].entries = entries()
    .slice()
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  save();
  renderTextarea();
  renderer.draw(entries());
});

// Clear
els.clearBtn.addEventListener("click", () => {
  if (!entries().length) return;
  if (!confirm("Remove all entries from this wheel?")) return;
  clearEntries(data);
  save();
  render();
});

// New wheel button
els.newWheelBtn.addEventListener("click", () => {
  els.newWheelInput.value = "";
  els.newWheelOverlay.classList.remove("hidden");
  setTimeout(() => els.newWheelInput.focus(), 50);
});

els.newWheelForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = els.newWheelInput.value.trim();
  if (!name) return;
  createWheel(data, name);
  save();
  els.newWheelOverlay.classList.add("hidden");
  renderer.rotation = 0;
  render();
});

els.cancelNewWheel.addEventListener("click", () => {
  els.newWheelOverlay.classList.add("hidden");
});

els.newWheelOverlay.addEventListener("click", (e) => {
  if (e.target === els.newWheelOverlay)
    els.newWheelOverlay.classList.add("hidden");
});

// Winner modal
els.closeWinnerBtn.addEventListener("click", closeWinner);

els.winnerOverlay.addEventListener("click", (e) => {
  if (e.target === els.winnerOverlay) closeWinner();
});

els.spinAgainBtn.addEventListener("click", () => {
  closeWinner();
  setTimeout(() => {
    if (!renderer.isSpinning) {
      els.spinBtn.disabled = true;
      renderer.spin(entries(), (winner) => {
        showWinner(winner);
        updateSpinBtn();
      });
    }
  }, 120);
});

// Keyboard
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    els.winnerOverlay.classList.add("hidden");
    els.newWheelOverlay.classList.add("hidden");
    if (els.titleArea.querySelector(".rename-form")) render();
  }
});

// Resize
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(sizeCanvas, 80);
});

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  "#e63946",
  "#2a9d8f",
  "#f4a261",
  "#457b9d",
  "#e9c46a",
  "#6a4c93",
  "#2dc653",
  "#f72585",
];

let confettiAnimId = null;
let confettiParticles = [];

function spawnConfetti() {
  const canvas = $("confetti-canvas");
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const W = canvas.width;
  const H = canvas.height;
  const count = Math.min(180, Math.floor(W * 0.18));

  confettiParticles = Array.from({ length: count }, () => {
    const angle = (Math.random() * 120 - 60) * (Math.PI / 180); // spread upward
    const speed = 6 + Math.random() * 10;
    return {
      x: W * (0.2 + Math.random() * 0.6), // start spread across middle
      y: H * 0.6,
      vx: Math.sin(angle) * speed,
      vy: -Math.cos(angle) * speed,
      w: 5 + Math.random() * 6,
      h: 3 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.25,
      color:
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      alpha: 1,
      gravity: 0.28 + Math.random() * 0.12,
    };
  });

  const ctx = canvas.getContext("2d");

  function tick() {
    ctx.clearRect(0, 0, W, H);
    let alive = false;

    for (const p of confettiParticles) {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;
      if (p.y < H + 20) alive = true;
      if (p.y > H + 20) continue;
      // Fade out in last 20% of screen height
      p.alpha = Math.min(1, Math.max(0, (H - p.y) / (H * 0.25)));

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (alive) {
      confettiAnimId = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, W, H);
    }
  }

  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
  tick();
}

function stopConfetti() {
  if (confettiAnimId) {
    cancelAnimationFrame(confettiAnimId);
    confettiAnimId = null;
  }
  const canvas = $("confetti-canvas");
  if (canvas)
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  confettiParticles = [];
}

// ─── Winner ───────────────────────────────────────────────────────────────────

function showWinner(name) {
  els.winnerName.textContent = name;
  els.winnerOverlay.classList.remove("hidden");
  els.spinAgainBtn.focus();
  // Small delay so the overlay is visible before confetti sizes itself
  setTimeout(spawnConfetti, 40);
}

function closeWinner() {
  stopConfetti();
  els.winnerOverlay.classList.add("hidden");
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  renderer = new WheelRenderer(els.canvas);
  render();
  requestAnimationFrame(() => {
    sizeCanvas();
    render();
  });
}

init();
