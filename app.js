// ── norman-rain ──
// Tranquil character rain with depth, sharp glyphs, safe-area support.

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ── Character sets ──
const CHARSETS = [
  // CJK — common kanji / hanja / hanzi
  "的一了是我不在人们有来他这着个到们说去你大为地国口年道我中于心时开始上还都可以新面己后如前所出以及到子比用第高等行手就才年种家也经力工者老早见主产发成性子道做头那同写月方让长本相两您带上花过完月种海打干作向山被声每自意比末及运养土无几三您们年直想度路心话体什快开言条完觉少问生经热晚令其她或秀别再任远只理明夜好怕光很笑写作于称快开言条完觉少问生经热晚令其她或秀别再任远只理明夜好怕光很笑",
  // Korean hangul
  "가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오초코토포호구누두루무부수우주추쿠투푸후기니디리미비시이치키티피히그느드러머버서어저처커터퍼허",
  // Greek
  "αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ",
  // Russian Cyrillic
  "абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ",
  // Swedish (extra chars beyond basic Latin)
  "åäöÅÄÖ",
  // English + symbols
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
];

// Merge into one pool, weighted toward CJK for the Matrix feel
const CJK = CHARSETS[0] + CHARSETS[1];
const OTHER = CHARSETS[2] + CHARSETS[3] + CHARSETS[4] + CHARSETS[5];

function pickChar() {
  // 70% CJK, 30% other
  return Math.random() < 0.7
    ? CJK[Math.floor(Math.random() * CJK.length)]
    : OTHER[Math.floor(Math.random() * OTHER.length)];
}

// ── Column (drop) ──
class Drop {
  constructor(x, colIndex, totalCols, cw, ch) {
    this.x = x;
    this.colIndex = colIndex;
    this.reset(ch, cw);
    // Stagger initial y so they don't all start at top
    this.y = Math.random() * ch * 1.5;
  }

  reset(ch, cw) {
    // Depth factor: 0 = far (slow, dim, small), 1 = near (fast, bright, large)
    this.depth = Math.pow(Math.random(), 1.5); // bias toward nearer
    const baseSpeed = 0.4 + this.depth * 1.8;
    this.speed = baseSpeed * (0.8 + Math.random() * 0.4);
    this.fontSize = Math.round(10 + this.depth * 12);
    this.char = pickChar();
    this.charTimer = 0;
    this.charInterval = 3 + Math.floor(Math.random() * 8);
    this.y = -this.fontSize;
  }

  draw(ctx, w, h) {
    const alpha = 0.15 + this.depth * 0.85;
    const green = Math.round(140 + this.depth * 115);

    ctx.font = `${this.fontSize}px "Hiragino Kaku Gothic Pro", "Yu Gothic", "Meiryo", "Noto Sans JP", "Noto Sans KR", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Glow layer
    ctx.shadowColor = `rgba(0, ${green}, 0, ${alpha * 0.6})`;
    ctx.shadowBlur = 4 + this.depth * 8;
    ctx.fillStyle = `rgba(0, ${green}, 0, ${alpha})`;
    ctx.fillText(this.char, this.x, this.y);

    // Reset shadow for performance
    ctx.shadowBlur = 0;

    // Change character occasionally
    this.charTimer++;
    if (this.charTimer >= this.charInterval) {
      this.charTimer = 0;
      this.char = pickChar();
    }
  }

  update(h) {
    this.y += this.speed;
    if (this.y > h + this.fontSize * 2) {
      this.reset(h, canvas.width);
    }
  }
}

// ── Head character (bright white-green) ──
class DropHead extends Drop {
  draw(ctx) {
    const alpha = 0.7 + this.depth * 0.3;
    const green = Math.round(200 + this.depth * 55);

    ctx.font = `bold ${this.fontSize}px "Hiragino Kaku Gothic Pro", "Yu Gothic", "Meiryo", "Noto Sans JP", "Noto Sans KR", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.shadowColor = `rgba(180, 255, 180, ${alpha})`;
    ctx.shadowBlur = 8 + this.depth * 12;
    ctx.fillStyle = `rgba(${180 + Math.round(this.depth * 75)}, 255, ${160 + Math.round(this.depth * 95)}, ${alpha})`;
    ctx.fillText(this.char, this.x, this.y);
    ctx.shadowBlur = 0;
  }
}

// ── Init ──
let drops = [];
let heads = [];
let cw = 0;
let colCount = 0;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Column width depends on depth — near columns wider
  cw = Math.round(14 + (window.devicePixelRatio > 1 ? 2 : 0));
  colCount = Math.floor(window.innerWidth / cw);

  const w = window.innerWidth;
  const h = window.innerHeight;

  drops = [];
  heads = [];
  for (let i = 0; i < colCount; i++) {
    const x = i * cw + cw / 2;
    const drop = new Drop(x, i, colCount, cw, h);
    drops.push(drop);
    heads.push(new DropHead(x, i, colCount, cw, h));
    // Copy depth from parent
    heads[heads.length - 1].depth = drop.depth;
    heads[heads.length - 1].speed = drop.speed;
    heads[heads.length - 1].fontSize = drop.fontSize;
  }
}

window.addEventListener("resize", resize);
resize();

// ── Animation loop ──
let lastTime = 0;
const TARGET_INTERVAL = 1000 / 60; // 60 fps

function frame(time) {
  requestAnimationFrame(frame);

  const delta = time - lastTime;
  if (delta < TARGET_INTERVAL * 0.7) return; // throttle to ~60fps
  lastTime = time - (delta % TARGET_INTERVAL);

  const w = window.innerWidth;
  const h = window.innerHeight;

  // Fade trail
  ctx.fillStyle = "rgba(8, 12, 8, 0.18)";
  ctx.fillRect(0, 0, w, h);

  // Update and draw drops (back to front by depth for layering)
  for (let i = 0; i < drops.length; i++) {
    drops[i].update(h);
    drops[i].draw(ctx, w, h);
  }

  // Draw heads on top
  for (let i = 0; i < heads.length; i++) {
    heads[i].update(h);
    heads[i].draw(ctx);
  }
}

requestAnimationFrame(frame);

// ── Touch: tap to spawn a burst ──
canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  const x = touch.clientX;
  const col = Math.floor(x / cw);
  if (col >= 0 && col < drops.length) {
    drops[col].y = -10;
    drops[col].char = pickChar();
    heads[col].y = -10;
  }
});
