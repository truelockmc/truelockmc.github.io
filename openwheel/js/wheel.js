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

function _textColor(bgHex) {
  return _luminance(bgHex) > 0.32 ? "#1a1916" : "#ffffff";
}

function _shadowColor(bgHex) {
  return _luminance(bgHex) > 0.32
    ? "rgba(255,255,255,0.6)"
    : "rgba(0,0,0,0.55)";
}

// ─── Text helpers ─────────────────────────────────────────────────────────────

function _wrapText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return [text];
  const words = text.split(/\s+/);
  if (words.length === 1) return [text];
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

  draw(entries) {
    const { canvas, ctx } = this;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const r = Math.min(W, H) / 2 - 6;

    ctx.clearRect(0, 0, W, H);

    if (!entries || entries.length === 0) {
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
      return;
    }

    const n = entries.length;
    const arc = TWO_PI / n;
    const capR = Math.max(12, r * 0.075);

    // Drop shadow behind wheel
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.22)";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TWO_PI);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.restore();

    for (let i = 0; i < n; i++) {
      const startAngle = this.rotation + i * arc;
      const endAngle = startAngle + arc;
      const midAngle = startAngle + arc / 2;
      const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];

      // Segment
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

    // Outer ring highlight
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TWO_PI);
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Centre cap
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 6;
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

  spin(entries, onDone) {
    if (this._running || entries.length < 2) return;
    this._running = true;

    const extraRot = (6 + Math.random() * 8) * TWO_PI;
    const duration = 3200 + Math.random() * 1800; // same as original
    const startRot = this.rotation;
    const targetRot = startRot + extraRot;
    const startTime = performance.now();

    const SPLIT = 0.72;
    const FAST_SHARE = 0.88;

    const ease = (t) => {
      if (t <= SPLIT) {
        const t1 = t / SPLIT;
        const p = (1 - Math.cos(t1 * Math.PI)) / 2;
        return p * FAST_SHARE;
      } else {
        const t2 = (t - SPLIT) / (1 - SPLIT);
        const p = 1 - Math.pow(1 - t2, 4);
        return FAST_SHARE + p * (1 - FAST_SHARE);
      }
    };

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

  _drawLabel(ctx, text, cx, cy, r, capR, arc, midAngle, bgColor) {
    const RADIAL_PAD = 10;
    const ANGULAR_PAD = 0.82;

    const innerR = capR + RADIAL_PAD;
    const outerR = r - RADIAL_PAD;
    const textR = outerR - innerR;
    if (textR < 6) return;

    const radialX = (innerR + outerR) / 2;

    // True chord at radialX: hard angular-height budget for the text block
    const chord = 2 * radialX * Math.sin(arc / 2) * ANGULAR_PAD;
    if (chord < 4) return;

    // Font-size: start from the space-driven ideal, cap at 26 px
    const MIN_FS = 7;
    const MAX_FS = 26; // larger than original 18 px, still bounded
    let fs = Math.min(
      MAX_FS,
      Math.max(MIN_FS, Math.min(chord * 0.9, textR * 0.55)),
    );
    let lines = [];

    for (let pass = 0; pass < 12; pass++) {
      ctx.font = `600 ${fs}px ${SANS}`;
      lines = _wrapText(ctx, text, textR);

      const lineH = fs * 1.25;
      const totalH = lines.length * lineH;
      const maxLineW = Math.max(...lines.map((l) => ctx.measureText(l).width));

      if (totalH <= chord && maxLineW <= textR) break;
      if (fs <= MIN_FS) break;

      const hScale = chord / totalH;
      const wScale = textR / maxLineW;
      fs = Math.max(MIN_FS, fs * Math.min(hScale, wScale) * 0.9);
    }

    const txtColor = _textColor(bgColor);
    const shColor = _shadowColor(bgColor);
    const lineH = fs * 1.25;

    ctx.save();

    // Hard clip: no pixel can ever bleed into a neighbouring segment
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, midAngle - arc / 2, midAngle + arc / 2);
    ctx.closePath();
    ctx.clip();

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
