/**
 * wheel.js
 * Canvas-based wheel renderer with spin animation.
 * No external dependencies.
 */

const SEGMENT_COLORS = [
  "#e63946",
  "#2a9d8f",
  "#f4a261",
  "#457b9d",
  "#e9c46a",
  "#6a4c93",
  "#2dc653",
  "#e76f51",
  "#4cc9f0",
  "#f72585",
  "#7cb518",
  "#ff9f1c",
];

const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI / 2;
const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

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

    // Drop shadow behind wheel
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.22)";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TWO_PI);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.restore();

    // Cap radius, text starts just outside this
    const capR = Math.max(12, r * 0.075);

    // Font size: generous when few entries, shrinks as n grows.
    // Segment arc-height at mid-radius gives us a natural ceiling.
    const midR = (capR + r) / 2;
    const chord = 2 * midR * Math.sin(arc / 2); // height available per segment
    const rawFs = chord * 0.42; // fill ~42% of that height
    const fs = Math.max(9, Math.min(rawFs, r * 0.13)); // clamp: never tiny, never huge

    for (let i = 0; i < n; i++) {
      const startAngle = this.rotation + i * arc;
      const endAngle = startAngle + arc;
      const midAngle = startAngle + arc / 2;

      // Segment
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      ctx.fill();

      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label, radial, from centre outward
      // Translate to centre, rotate to segment midpoint, then draw text
      // along the +x axis (which now points toward the segment midpoint).
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(midAngle);

      // How many chars fit? Estimate available radial length.
      const textR = r - capR - 10; // usable length from cap edge to near rim
      const charW = fs * 0.58; // rough per-char width at this font size
      const maxChars = Math.max(3, Math.floor(textR / charW));
      const label =
        entries[i].length > maxChars
          ? entries[i].slice(0, maxChars - 1) + "…"
          : entries[i];

      ctx.font = `600 ${fs}px ${SANS}`;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 3;
      ctx.textAlign = "left"; // draw from inner edge outward
      ctx.textBaseline = "middle";
      ctx.fillText(label, capR + 8, 0); // start just outside the cap

      ctx.restore();
    }

    // Outer ring highlight
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TWO_PI);
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Centre cap
    ctx.beginPath();
    ctx.arc(cx, cy, capR, 0, TWO_PI);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.strokeStyle = "#d0ccc4";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  spin(entries, onDone) {
    if (this._running || entries.length < 2) return;
    this._running = true;

    const extraRot = (6 + Math.random() * 8) * TWO_PI;
    const duration = 3200 + Math.random() * 1800;
    const startRot = this.rotation;
    const targetRot = startRot + extraRot;
    const startTime = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);

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

  _winner(entries) {
    const n = entries.length;
    const arc = TWO_PI / n;
    const angle = (((-HALF_PI - this.rotation) % TWO_PI) + TWO_PI) % TWO_PI;
    return entries[Math.floor(angle / arc) % n];
  }
}
