/**
 * wheel.js
 * Canvas-based wheel renderer with spin animation.
 * No external dependencies.
 */

// ─── Palette ──────────────────────────────────────────────────────────────────

const SEGMENT_COLORS = [
  "#e03434", // red
  "#1fa888", // teal
  "#f07d28", // orange
  "#3a7fc1", // blue
  "#d4a017", // gold
  "#7c3fa6", // violet
  "#25b847", // green
  "#d9533d", // coral
  "#3bbfdd", // sky
  "#d4217e", // pink
  "#6aad10", // lime
  "#e88c00", // amber
  "#0d9e8a", // emerald
  "#1a78b4", // steel blue
  "#b05cc8", // purple
  "#c63e5a", // crimson
  "#6f50d8", // indigo
  "#2e9e5f", // forest
  "#d46a00", // burnt orange
  "#0872a8", // ocean
];

// ─── Constants ────────────────────────────────────────────────────────────────

const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI / 2;
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

// ─── Colour helpers ───────────────────────────────────────────────────────────

/** Relative luminance (WCAG formula). */
function _luminance(hex) {
  return ["1", "3", "5"]
    .map((_, k) => {
      let c = parseInt(hex.slice(1 + k * 2, 3 + k * 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    })
    .reduce((acc, c, i) => acc + [0.2126, 0.7152, 0.0722][i] * c, 0);
}

/** Return white or near-black depending on segment luminance. */
function _textColor(bgHex) {
  return _luminance(bgHex) > 0.32 ? "#1a1916" : "#ffffff";
}

/** Subtle drop-shadow colour that contrasts with the background. */
function _shadowColor(bgHex) {
  return _luminance(bgHex) > 0.32
    ? "rgba(255,255,255,0.6)"
    : "rgba(0,0,0,0.55)";
}

// ─── Text helpers ─────────────────────────────────────────────────────────────

/**
 * Word-wrap `text` into lines that each fit within `maxWidth` pixels.
 * Falls back to a single-item array if no spaces exist.
 */
function _wrapText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return [text];

  const words = text.split(/\s+/);
  if (words.length === 1) return [text]; // can't wrap a single word

  const lines = [];
  let current = "";

  for (const word of words) {
    const test = current ? current + " " + word : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

class WheelRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.rotation = 0;
    this._animId = null;
    this._running = false;
  }

  // ── Public draw ────────────────────────────────────────────────────────────

  draw(entries) {
    const { canvas, ctx } = this;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const r = Math.min(W, H) / 2 - 6;

    ctx.clearRect(0, 0, W, H);

    if (!entries || entries.length === 0) {
      this._drawEmpty(ctx, cx, cy, r);
      return;
    }

    const n = entries.length;
    const arc = TWO_PI / n;
    const capR = Math.max(12, r * 0.075);

    // Ambient shadow behind the whole wheel
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TWO_PI);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.restore();

    // Segments + labels
    for (let i = 0; i < n; i++) {
      const startAngle = this.rotation + i * arc;
      const endAngle = startAngle + arc;
      const midAngle = startAngle + arc / 2;
      const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];

      // Filled segment
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.10)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      this._drawLabel(ctx, entries[i], cx, cy, r, capR, arc, midAngle, color);
    }

    // Outer gloss ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TWO_PI);
    ctx.strokeStyle = "rgba(255,255,255,0.20)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Centre cap
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.22)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, capR, 0, TWO_PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, capR, 0, TWO_PI);
    ctx.strokeStyle = "#d0ccc4";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // ── Spin ───────────────────────────────────────────────────────────────────

  spin(entries, onDone) {
    if (this._running || entries.length < 2) return;
    this._running = true;

    const extraRot = (7 + Math.random() * 8) * TWO_PI;
    const duration = 3600 + Math.random() * 1600; // 3.6-5.2 s
    const startRot = this.rotation;
    const targetRot = startRot + extraRot;
    const startTime = performance.now();

    // Quintic ease-out
    const ease = (t) => 1 - Math.pow(1 - t, 5);

    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      this.rotation = startRot + (targetRot - startRot) * ease(t);
      this.draw(entries);

      if (t < 1) {
        this._animId = requestAnimationFrame(tick);
      } else {
        this.rotation = ((this.rotation % TWO_PI) + TWO_PI) % TWO_PI;
        this._running = false;
        onDone(this._winner(entries));
      }
    };

    this._animId = requestAnimationFrame(tick);
  }

  stop() {
    if (this._animId) {
      cancelAnimationFrame(this._animId);
      this._animId = null;
    }
    this._running = false;
  }

  get isSpinning() {
    return this._running;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  _drawEmpty(ctx, cx, cy, r) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TWO_PI);
    ctx.fillStyle = "#ece8e0";
    ctx.fill();
    ctx.strokeStyle = "#d0ccc4";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#9a9794";
    ctx.font = `14px ${SANS}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("No entries yet", cx, cy);
  }

  _drawLabel(ctx, text, cx, cy, r, capR, arc, midAngle, bgColor) {
    // ── Available space ──────────────────────────────────────────────────────
    const PADDING_RADIAL = 12;
    const PADDING_ANGULAR = 0.8; // use 80 % of chord as angular budget

    const textR = r - capR - PADDING_RADIAL; // radial length for text
    if (textR < 8) return; // segment too thin

    const midR = (capR + r) / 2;
    const chord = 2 * midR * Math.sin(arc / 2) * PADDING_ANGULAR;
    if (chord < 5) return; // segment too narrow

    // ── Font-size search ─────────────────────────────────────────────────────
    const MIN_FS = 7;
    const MAX_FS = Math.min(
      chord * 0.5, // at most half the angular chord per line
      r * 0.13, // scale with wheel size
      18, // hard cap (no need to go bigger)
    );

    let fs = Math.max(MIN_FS, MAX_FS);
    let lines = [];

    // Iterate: wrap → check height → reduce font if needed
    for (let pass = 0; pass < 8; pass++) {
      ctx.font = `600 ${fs}px ${SANS}`;
      lines = _wrapText(ctx, text, textR);

      const lineH = fs * 1.3;
      const totalH = lines.length * lineH;
      const maxLineW = Math.max(...lines.map((l) => ctx.measureText(l).width));

      const heightOk = totalH <= chord;
      const widthOk = maxLineW <= textR;

      if (heightOk && widthOk) break;

      if (fs <= MIN_FS) break; // can't shrink further

      // Shrink: the binding constraint drives the reduction factor
      const hScale = heightOk ? 1 : chord / totalH;
      const wScale = widthOk ? 1 : textR / maxLineW;
      fs = Math.max(MIN_FS, fs * Math.min(hScale, wScale) * 0.92);
    }

    // ── Draw ─────────────────────────────────────────────────────────────────
    const txtColor = _textColor(bgColor);
    const shColor = _shadowColor(bgColor);
    const lineH = fs * 1.3;
    const radialX = (capR + r) / 2; // radial centre of text block

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(midAngle);

    ctx.font = `600 ${fs}px ${SANS}`;
    ctx.fillStyle = txtColor;
    ctx.shadowColor = shColor;
    ctx.shadowBlur = 3;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    lines.forEach((line, i) => {
      const yOffset = (i - (lines.length - 1) / 2) * lineH;
      ctx.fillText(line, radialX, yOffset);
    });

    ctx.restore();
  }

  _winner(entries) {
    const n = entries.length;
    const arc = TWO_PI / n;
    const angle = (((-HALF_PI - this.rotation) % TWO_PI) + TWO_PI) % TWO_PI;
    return entries[Math.floor(angle / arc) % n];
  }
}
