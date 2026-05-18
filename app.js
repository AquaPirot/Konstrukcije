'use strict';

// Profile dimensions in cm (100x100mm = 10x10cm, 80x40mm = 8x4cm)
const PROF = {
  POST:   { w: 10, h: 10, kgm: 11.9, label: '100×100×4mm' },
  BEAM:   { w: 10, h: 10, kgm: 11.9, label: '100×100×4mm' },
  RAFTER: { w:  4, h:  8, kgm: 5.17, label: '80×40×3mm'  },
};

// Form fields per construction type
const FORM_FIELDS = {
  '4stuba': [
    { id: 'length',   label: 'Dužina',         unit: 'cm', def: 400, min: 100, max: 3000, hint: 'paralelno sa zidom' },
    { id: 'width',    label: 'Dubina',          unit: 'cm', def: 300, min: 100, max: 1500, hint: 'od zida ka dvorištu' },
    { id: 'height',   label: 'Visina stuba',    unit: 'cm', def: 250, min: 150, max: 600,  hint: 'do vrha stuba' },
    { id: 'rspacing', label: 'Razmak nosača',   unit: 'cm', def: 60,  min: 30,  max: 150,  hint: 'centar-centar' },
    { id: 'nPosts',   label: 'Stubovi po strani', unit: 'kom', def: 2, min: 2, max: 6,     hint: 'po jednoj strani' },
  ],
  '2stuba_zid': [
    { id: 'length',   label: 'Dužina',         unit: 'cm', def: 400, min: 100, max: 3000, hint: 'paralelno sa zidom' },
    { id: 'width',    label: 'Dubina',          unit: 'cm', def: 300, min: 100, max: 1500, hint: 'od zida ka dvorištu' },
    { id: 'height',   label: 'Visina stuba',    unit: 'cm', def: 250, min: 150, max: 600,  hint: 'slobodni stubovi' },
    { id: 'heightWall',label:'Visina na zidu',  unit: 'cm', def: 270, min: 150, max: 600,  hint: 'pričvršćenje na zid' },
    { id: 'rspacing', label: 'Razmak nosača',   unit: 'cm', def: 60,  min: 30,  max: 150,  hint: 'centar-centar' },
  ],
  'L': [
    { id: 'length1',  label: 'Krak A – dužina', unit: 'cm', def: 400, min: 100, max: 3000 },
    { id: 'width1',   label: 'Krak A – dubina', unit: 'cm', def: 300, min: 100, max: 1500 },
    { id: 'length2',  label: 'Krak B – dužina', unit: 'cm', def: 300, min: 100, max: 3000 },
    { id: 'width2',   label: 'Krak B – dubina', unit: 'cm', def: 300, min: 100, max: 1500 },
    { id: 'height',   label: 'Visina stuba',    unit: 'cm', def: 250, min: 150, max: 600  },
    { id: 'rspacing', label: 'Razmak nosača',   unit: 'cm', def: 60,  min: 30,  max: 150  },
  ],
  'linijska': [
    { id: 'length',   label: 'Ukupna dužina',   unit: 'cm', def: 600, min: 100, max: 5000 },
    { id: 'height',   label: 'Visina stuba',    unit: 'cm', def: 250, min: 150, max: 600  },
    { id: 'spacing',  label: 'Razmak stubova',  unit: 'cm', def: 200, min: 100, max: 400  },
    { id: 'width',    label: 'Dubina (nosači)',  unit: 'cm', def: 0,   min: 0,   max: 500,  hint: '0 = samo greda, bez nosača' },
  ],
};

// State
const state = {
  type: '4stuba',
  vals: {},
};

// ---------- INIT ----------
function init() {
  // Read type
  document.querySelectorAll('input[name="type"]').forEach(r => {
    r.addEventListener('change', () => {
      state.type = r.value;
      buildForm();
      update();
    });
  });

  buildForm();
  update();
}

// ---------- FORM ----------
function buildForm() {
  const fields = FORM_FIELDS[state.type];
  const container = document.getElementById('dims-form');
  container.innerHTML = '';

  // preserve previous values
  const prev = { ...state.vals };

  state.vals = {};
  fields.forEach(f => {
    state.vals[f.id] = prev[f.id] !== undefined ? prev[f.id] : f.def;

    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = `
      <label for="f_${f.id}">${f.label} <span style="font-weight:400;color:#aaa">(${f.unit})</span></label>
      <input type="number" id="f_${f.id}" value="${state.vals[f.id]}" min="${f.min}" max="${f.max}" step="1">
      ${f.hint ? `<span class="hint">${f.hint}</span>` : ''}
    `;
    div.querySelector('input').addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      if (!isNaN(v) && v >= f.min && v <= f.max) {
        state.vals[f.id] = v;
        update();
      }
    });
    container.appendChild(div);
  });
}

// ---------- UPDATE ----------
function update() {
  const svgStr = generateSVG();
  document.getElementById('drawing-container').innerHTML = svgStr;

  const matHtml = generateMaterials();
  document.getElementById('materials-container').innerHTML = matHtml;
}

// ============================================================
// SVG GENERATION
// ============================================================

const M = 50;   // margin for dimension lines (cm)
const G = 25;   // gap between views (cm)

// SVG element helpers
function r(x, y, w, h, fill, stroke, sw) {
  fill = fill || '#9eaab5';
  stroke = stroke || '#2c3e50';
  sw = sw !== undefined ? sw : 1;
  return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

function ln(x1, y1, x2, y2, stroke, sw, dash) {
  stroke = stroke || '#2c3e50';
  sw = sw !== undefined ? sw : 0.5;
  const da = dash ? ` stroke-dasharray="${dash}"` : '';
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}" stroke-width="${sw}"${da}/>`;
}

function tx(x, y, text, size, anchor, fill, rotate) {
  size = size || 7;
  anchor = anchor || 'middle';
  fill = fill || '#1a2634';
  const rot = rotate ? ` transform="rotate(${rotate},${n(x)},${n(y)})"` : '';
  return `<text x="${n(x)}" y="${n(y)}" font-size="${size}" text-anchor="${anchor}" fill="${fill}" font-family="Arial,sans-serif"${rot}>${text}</text>`;
}

function n(v) { return Math.round(v * 10) / 10; }

// Dimension line horizontal
function dimH(x1, x2, y, label, above) {
  above = above !== false;
  const dir = above ? -1 : 1;
  const ty = y + dir * 14;
  const mid = (x1 + x2) / 2;
  return `
    <line x1="${n(x1)}" y1="${n(y)}" x2="${n(x2)}" y2="${n(y)}" stroke="#c0392b" stroke-width="0.7" marker-start="url(#da)" marker-end="url(#da2)"/>
    <line x1="${n(x1)}" y1="${n(y - 6)}" x2="${n(x1)}" y2="${n(y + 6)}" stroke="#c0392b" stroke-width="0.7"/>
    <line x1="${n(x2)}" y1="${n(y - 6)}" x2="${n(x2)}" y2="${n(y + 6)}" stroke="#c0392b" stroke-width="0.7"/>
    <text x="${n(mid)}" y="${n(ty)}" text-anchor="middle" font-size="7.5" fill="#c0392b" font-family="Arial,sans-serif" font-weight="600">${label}</text>
  `;
}

// Dimension line vertical
function dimV(x, y1, y2, label, right) {
  right = right !== false;
  const dir = right ? 1 : -1;
  const tx2 = x + dir * 16;
  const mid = (y1 + y2) / 2;
  return `
    <line x1="${n(x)}" y1="${n(y1)}" x2="${n(x)}" y2="${n(y2)}" stroke="#c0392b" stroke-width="0.7" marker-start="url(#da)" marker-end="url(#da2)"/>
    <line x1="${n(x - 6)}" y1="${n(y1)}" x2="${n(x + 6)}" y2="${n(y1)}" stroke="#c0392b" stroke-width="0.7"/>
    <line x1="${n(x - 6)}" y1="${n(y2)}" x2="${n(x + 6)}" y2="${n(y2)}" stroke="#c0392b" stroke-width="0.7"/>
    <text x="${n(tx2)}" y="${n(mid + 3)}" text-anchor="middle" font-size="7.5" fill="#c0392b" font-family="Arial,sans-serif" font-weight="600" transform="rotate(-90,${n(tx2)},${n(mid)})">${label}</text>
  `;
}

function svgDefs() {
  return `<defs>
    <marker id="da" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
      <path d="M0,1 L3,3 L0,5" fill="none" stroke="#c0392b" stroke-width="0.8"/>
    </marker>
    <marker id="da2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,1 L3,3 L0,5" fill="none" stroke="#c0392b" stroke-width="0.8"/>
    </marker>
    <pattern id="wall-hatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="8" stroke="#8898aa" stroke-width="3"/>
    </pattern>
  </defs>`;
}

function viewLabel(x, y, text) {
  return `
    <text x="${n(x)}" y="${n(y)}" font-size="9" font-weight="700" text-anchor="middle" fill="#1a2634" font-family="Arial,sans-serif" letter-spacing="1">${text}</text>
    <line x1="${n(x - 30)}" y1="${n(y + 3)}" x2="${n(x + 30)}" y2="${n(y + 3)}" stroke="#1a2634" stroke-width="0.5"/>
  `;
}

// -------- 4 STUBA --------
function draw4stuba(v) {
  const L = v.length, W = v.width, H = v.height, RS = v.rspacing;
  const nPostsSide = Math.max(2, Math.round(v.nPosts || 2));
  const P = PROF.POST, B = PROF.BEAM, RF = PROF.RAFTER;

  // Rafter count and spacing along length
  const nRaf = Math.round(L / RS) + 1;
  const rafS = L / (nRaf - 1);

  // Total visual height: post + beam + rafter above beam
  const totalH = H + B.h + RF.h;

  // Posts along each side (if more than 2 per side)
  const postPositions = [];
  for (let i = 0; i < nPostsSide; i++) {
    postPositions.push(i * L / (nPostsSide - 1));
  }

  // View origins
  const Tx = M, Ty = M;                        // top view
  const Fx = M, Fy = M + W + G;               // front elevation
  const Sx = M + L + G, Sy = M + W + G;       // side elevation

  const vbW = M + L + G + W + M + 20;
  const vbH = M + W + G + totalH + M;

  let s = '';

  // ---- TOP VIEW ----
  // Ground plate
  s += r(Tx, Ty, L, W, '#f4f5f7', '#dee2e6', 0.5);

  // Beams top and bottom (in plan they appear as 10cm strips)
  s += r(Tx, Ty, L, B.h, '#9eaab5', '#2c3e50', 1);               // front beam
  s += r(Tx, Ty + W - B.h, L, B.h, '#9eaab5', '#2c3e50', 1);     // back beam

  // Rafters in plan view (running front→back = along W)
  for (let i = 0; i < nRaf; i++) {
    const rx = Tx + i * rafS - RF.w / 2;
    const clampX = Math.max(Tx, rx);
    s += r(clampX, Ty, RF.w, W, '#b8c4cc', '#2c3e50', 0.5);
  }

  // Posts (overlap beams at corners / along sides)
  postPositions.forEach(px => {
    s += r(Tx + px - P.w / 2, Ty, P.w, P.h, '#5a6876', '#2c3e50', 1.5);          // front row
    s += r(Tx + px - P.w / 2, Ty + W - P.h, P.w, P.h, '#5a6876', '#2c3e50', 1.5); // back row
  });

  // fix: first and last posts flush with edges
  s += r(Tx, Ty, P.w, P.h, '#5a6876', '#2c3e50', 1.5);
  s += r(Tx + L - P.w, Ty, P.w, P.h, '#5a6876', '#2c3e50', 1.5);
  s += r(Tx, Ty + W - P.h, P.w, P.h, '#5a6876', '#2c3e50', 1.5);
  s += r(Tx + L - P.w, Ty + W - P.h, P.w, P.h, '#5a6876', '#2c3e50', 1.5);

  s += viewLabel(Tx + L / 2, Ty - 14, 'TLOCRT  (pogled odozgo)');
  s += dimH(Tx, Tx + L, Ty - 22, `${L} cm`);
  s += dimV(Tx - 22, Ty, Ty + W, `${W} cm`, false);

  // ---- FRONT ELEVATION ----
  // Ground
  s += ln(Fx, Fy + H, Fx + L, Fy + H, '#2c3e50', 1.5);

  // Posts (front row): from ground up
  postPositions.forEach(px => {
    const ppx = px < L / 2 ? px : px - P.w;
    s += r(Fx + ppx, Fy + B.h, P.w, H - B.h, '#9eaab5', '#2c3e50', 1);
  });
  s += r(Fx, Fy + B.h, P.w, H - B.h, '#9eaab5', '#2c3e50', 1);
  s += r(Fx + L - P.w, Fy + B.h, P.w, H - B.h, '#9eaab5', '#2c3e50', 1);

  // Front beam spanning full length
  s += r(Fx, Fy, L, B.h, '#6c7a86', '#2c3e50', 1.2);

  // Rafters visible as cross-sections (8cm tall, 4cm wide) above beam
  for (let i = 0; i < nRaf; i++) {
    const rx = Fx + i * rafS - RF.w / 2;
    s += r(Math.max(Fx, rx), Fy - RF.h, RF.w, RF.h, '#b8c4cc', '#2c3e50', 0.7);
  }

  s += viewLabel(Fx + L / 2, Fy - RF.h - 14, 'PREDNJI IZGLED');
  s += dimH(Fx, Fx + L, Fy + H + 20, `${L} cm`, false);
  s += dimV(Fx + L + 18, Fy - RF.h, Fy + H, `${H} cm`);
  // Rafter spacing dim
  if (nRaf > 2) {
    s += dimH(Fx, Fx + rafS, Fy + H + 35, `${n(rafS)} cm`, false);
  }

  // ---- SIDE ELEVATION (looking along length axis) ----
  // Ground
  s += ln(Sx, Sy + H, Sx + W, Sy + H, '#2c3e50', 1.5);

  // Left and right posts
  s += r(Sx, Sy + B.h, P.w, H - B.h, '#9eaab5', '#2c3e50', 1);
  s += r(Sx + W - P.w, Sy + B.h, P.w, H - B.h, '#9eaab5', '#2c3e50', 1);

  // Side beam
  s += r(Sx, Sy, W, B.h, '#6c7a86', '#2c3e50', 1.2);

  // Rafters in side view — they span from front to back
  // Visible as a single bar (or multiple overlapping)
  s += r(Sx, Sy - RF.h, W, RF.h, '#b8c4cc', '#2c3e50', 0.7);

  s += viewLabel(Sx + W / 2, Sy - RF.h - 14, 'BOČNI IZGLED');
  s += dimH(Sx, Sx + W, Sy + H + 20, `${W} cm`, false);
  s += dimV(Sx - 18, Sy - RF.h, Sy + H, `${H + RF.h} cm`, false);

  // Title block
  const tbY = vbH - M + 10;
  s += ln(0, tbY - 5, vbW, tbY - 5, '#dee2e6', 0.5);
  s += tx(20, tbY + 6, 'PERGOLA – 4 STUBA', 8, 'start', '#1a2634');
  s += tx(20, tbY + 16, `Dužina: ${L}cm  |  Dubina: ${W}cm  |  Visina: ${H}cm  |  Razmak nosača: ≈${n(rafS)}cm`, 7, 'start', '#6b7280');
  s += tx(vbW - 20, tbY + 6, `Nosači: ${nRaf} kom @ ≈${n(rafS)}cm`, 7, 'end', '#6b7280');
  s += tx(vbW - 20, tbY + 16, `Stubovi: ${postPositions.length * 2} kom | Profil: 100×100`, 7, 'end', '#6b7280');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(vbW)} ${n(vbH)}">${svgDefs()}${s}</svg>`;
}

// -------- UZ ZID --------
function draw2stubaZid(v) {
  const L = v.length, W = v.width, H = v.height, HW = v.heightWall || H + 20, RS = v.rspacing;
  const P = PROF.POST, B = PROF.BEAM, RF = PROF.RAFTER;

  const nRaf = Math.round(L / RS) + 1;
  const rafS = L / (nRaf - 1);

  const totalH = Math.max(H, HW) + B.h + RF.h;

  const Tx = M, Ty = M;
  const Fx = M, Fy = M + W + G;
  const Sx = M + L + G, Sy = M + W + G;

  const vbW = M + L + G + W + M + 20;
  const vbH = M + W + G + totalH + M;

  let s = '';

  // ---- TOP VIEW ----
  s += r(Tx, Ty, L, W, '#f4f5f7', '#dee2e6', 0.5);
  // Wall side (back)
  s += r(Tx, Ty, L, B.h, 'url(#wall-hatch)', '#2c3e50', 1.5);
  s += tx(Tx + L / 2, Ty + B.h / 2 + 3, 'ZID', 6, 'middle', '#445');
  // Free beam (front)
  s += r(Tx, Ty + W - B.h, L, B.h, '#9eaab5', '#2c3e50', 1);
  // Rafters
  for (let i = 0; i < nRaf; i++) {
    const rx = Tx + i * rafS - RF.w / 2;
    s += r(Math.max(Tx, rx), Ty, RF.w, W, '#b8c4cc', '#2c3e50', 0.5);
  }
  // Free posts
  s += r(Tx, Ty + W - P.h, P.w, P.h, '#5a6876', '#2c3e50', 1.5);
  s += r(Tx + L - P.w, Ty + W - P.h, P.w, P.h, '#5a6876', '#2c3e50', 1.5);

  s += viewLabel(Tx + L / 2, Ty - 14, 'TLOCRT  (pogled odozgo)');
  s += dimH(Tx, Tx + L, Ty - 22, `${L} cm`);
  s += dimV(Tx - 22, Ty, Ty + W, `${W} cm`, false);

  // ---- FRONT ELEVATION ----
  s += ln(Fx, Fy + H, Fx + L, Fy + H, '#2c3e50', 1.5);
  // 2 free posts
  s += r(Fx, Fy + B.h, P.w, H - B.h, '#9eaab5', '#2c3e50', 1);
  s += r(Fx + L - P.w, Fy + B.h, P.w, H - B.h, '#9eaab5', '#2c3e50', 1);
  // Free beam
  s += r(Fx, Fy, L, B.h, '#6c7a86', '#2c3e50', 1.2);
  // Rafters as cross-sections
  for (let i = 0; i < nRaf; i++) {
    const rx = Fx + i * rafS - RF.w / 2;
    s += r(Math.max(Fx, rx), Fy - RF.h, RF.w, RF.h, '#b8c4cc', '#2c3e50', 0.7);
  }
  s += viewLabel(Fx + L / 2, Fy - RF.h - 14, 'PREDNJI IZGLED  (slobodna strana)');
  s += dimH(Fx, Fx + L, Fy + H + 20, `${L} cm`, false);
  s += dimV(Fx + L + 18, Fy, Fy + H, `${H} cm`);

  // ---- SIDE ELEVATION ----
  s += ln(Sx, Sy + H, Sx + W, Sy + H, '#2c3e50', 1.5);
  // Back = wall side (hatch)
  s += r(Sx, Sy + B.h, P.w, H - B.h, 'url(#wall-hatch)', '#2c3e50', 1);
  // Free post (front)
  s += r(Sx + W - P.w, Sy + B.h, P.w, H - B.h, '#9eaab5', '#2c3e50', 1);
  // Rafter span
  s += r(Sx, Sy - RF.h, W, RF.h, '#b8c4cc', '#2c3e50', 0.7);
  // Angle line (if heights differ)
  if (Math.abs(H - HW) > 5) {
    const wallTopY = Sy + H - HW;
    s += r(Sx, wallTopY, B.h, HW, '#6c7a86', '#2c3e50', 1.2);
    s += ln(Sx + B.h, wallTopY, Sx + W, Sy, '#555', 1, '4 2');
  } else {
    s += r(Sx, Sy, W, B.h, '#6c7a86', '#2c3e50', 1.2);
  }
  s += viewLabel(Sx + W / 2, Sy - RF.h - 14, 'BOČNI IZGLED');
  s += dimH(Sx, Sx + W, Sy + H + 20, `${W} cm`, false);
  s += dimV(Sx - 18, Sy, Sy + H, `${H} cm`, false);

  const tbY = vbH - M + 10;
  s += ln(0, tbY - 5, vbW, tbY - 5, '#dee2e6', 0.5);
  s += tx(20, tbY + 6, 'PERGOLA – UZ ZID', 8, 'start', '#1a2634');
  s += tx(20, tbY + 16, `Dužina: ${L}cm  |  Dubina: ${W}cm  |  Visina: ${H}cm  |  Razmak nosača: ≈${n(rafS)}cm`, 7, 'start', '#6b7280');
  s += tx(vbW - 20, tbY + 6, `Nosači: ${nRaf} kom @ ≈${n(rafS)}cm`, 7, 'end', '#6b7280');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(vbW)} ${n(vbH)}">${svgDefs()}${s}</svg>`;
}

// -------- L FORMA --------
function drawL(v) {
  const L1 = v.length1, W1 = v.width1, L2 = v.length2, W2 = v.width2;
  const H = v.height, RS = v.rspacing;
  const P = PROF.POST, B = PROF.BEAM, RF = PROF.RAFTER;

  // Bounding box for plan
  const totalW = L1;
  const totalD = W1 + L2;

  const nRaf1 = Math.round(L1 / RS) + 1;
  const rafS1 = L1 / (nRaf1 - 1);
  const nRaf2 = Math.round(L2 / RS) + 1;
  const rafS2 = L2 / (nRaf2 - 1);

  const totalH = H + B.h + RF.h;

  const Tx = M, Ty = M;
  const Fx = M, Fy = M + totalD + G;
  const vbW = M + totalW + G + W2 + M + 20;
  const vbH = M + totalD + G + totalH + M;

  let s = '';

  // ---- TOP VIEW (L shape) ----
  // Wing A: top portion (length1 x width1)
  s += r(Tx, Ty, L1, W1, '#f4f5f7', '#dee2e6', 0.5);
  // Beams along Wing A
  s += r(Tx, Ty, L1, B.h, '#9eaab5', '#2c3e50', 1);
  s += r(Tx, Ty + W1 - B.h, L1, B.h, '#9eaab5', '#2c3e50', 1);
  // Rafters Wing A
  for (let i = 0; i < nRaf1; i++) {
    const rx = Tx + i * rafS1 - RF.w / 2;
    s += r(Math.max(Tx, rx), Ty, RF.w, W1, '#b8c4cc', '#2c3e50', 0.5);
  }

  // Wing B: bottom-left (width2 x length2, perpendicular)
  s += r(Tx, Ty + W1, W2, L2, '#eef0f3', '#dee2e6', 0.5);
  s += r(Tx, Ty + W1, B.h, L2, '#9eaab5', '#2c3e50', 1);
  s += r(Tx + W2 - B.h, Ty + W1, B.h, L2, '#9eaab5', '#2c3e50', 1);
  for (let i = 0; i < nRaf2; i++) {
    const ry = Ty + W1 + i * rafS2 - RF.w / 2;
    s += r(Tx, Math.max(Ty + W1, ry), W2, RF.w, '#b8c4cc', '#2c3e50', 0.5);
  }

  // Posts at corners
  const posts = [
    [Tx, Ty], [Tx + L1 - P.w, Ty],
    [Tx, Ty + W1 - P.h], [Tx + W2 - P.w, Ty + W1 - P.h],
    [Tx, Ty + W1 + L2 - P.h], [Tx + W2 - P.w, Ty + W1 + L2 - P.h],
  ];
  posts.forEach(([px, py]) => s += r(px, py, P.w, P.h, '#5a6876', '#2c3e50', 1.5));

  s += viewLabel(Tx + L1 / 2, Ty - 14, 'TLOCRT – L FORMA');
  s += dimH(Tx, Tx + L1, Ty - 22, `${L1} cm`);
  s += dimV(Tx - 22, Ty, Ty + W1, `${W1} cm`, false);
  s += dimV(Tx - 22, Ty + W1, Ty + W1 + L2, `${L2} cm`, false);

  // ---- FRONT ELEVATION (along wing A) ----
  s += ln(Fx, Fy + H, Fx + L1, Fy + H, '#2c3e50', 1.5);
  s += r(Fx, Fy + B.h, P.w, H - B.h, '#9eaab5', '#2c3e50', 1);
  s += r(Fx + L1 - P.w, Fy + B.h, P.w, H - B.h, '#9eaab5', '#2c3e50', 1);
  s += r(Fx, Fy, L1, B.h, '#6c7a86', '#2c3e50', 1.2);
  for (let i = 0; i < nRaf1; i++) {
    const rx = Fx + i * rafS1 - RF.w / 2;
    s += r(Math.max(Fx, rx), Fy - RF.h, RF.w, RF.h, '#b8c4cc', '#2c3e50', 0.7);
  }
  s += viewLabel(Fx + L1 / 2, Fy - RF.h - 14, 'PREDNJI IZGLED – KRAK A');
  s += dimH(Fx, Fx + L1, Fy + H + 20, `${L1} cm`, false);
  s += dimV(Fx + L1 + 18, Fy, Fy + H, `${H} cm`);

  const tbY = vbH - M + 10;
  s += ln(0, tbY - 5, vbW, tbY - 5, '#dee2e6', 0.5);
  s += tx(20, tbY + 6, 'PERGOLA – L FORMA', 8, 'start', '#1a2634');
  s += tx(20, tbY + 16, `Krak A: ${L1}×${W1}cm  |  Krak B: ${L2}×${W2}cm  |  Visina: ${H}cm`, 7, 'start', '#6b7280');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(vbW)} ${n(vbH)}">${svgDefs()}${s}</svg>`;
}

// -------- LINIJSKA --------
function drawLinijska(v) {
  const L = v.length, H = v.height, SP = v.spacing, W = v.width || 0;
  const P = PROF.POST, B = PROF.BEAM, RF = PROF.RAFTER;

  const nPosts = Math.round(L / SP) + 1;
  const actualSP = L / (nPosts - 1);
  const nRaf = W > 0 ? (Math.round(L / 60) + 1) : 0;

  const totalH = H + B.h + (W > 0 ? RF.h : 0);

  const Tx = M, Ty = M;
  const Fx = M, Fy = M + Math.max(W, 30) + G;
  const vbW = M + L + M + 40;
  const vbH = M + Math.max(W, 30) + G + totalH + M;

  let s = '';

  // ---- TOP VIEW ----
  if (W > 0) {
    s += r(Tx, Ty, L, W, '#f4f5f7', '#dee2e6', 0.5);
    s += r(Tx, Ty, L, B.h, '#9eaab5', '#2c3e50', 1);
    for (let i = 0; i < nRaf; i++) {
      const rx = Tx + i * (L / (nRaf - 1)) - RF.w / 2;
      s += r(Math.max(Tx, rx), Ty, RF.w, W, '#b8c4cc', '#2c3e50', 0.5);
    }
    for (let i = 0; i < nPosts; i++) {
      const px = Tx + i * actualSP - P.w / 2;
      s += r(Math.max(Tx, px), Ty, P.w, P.h, '#5a6876', '#2c3e50', 1.5);
    }
  } else {
    // Just beam shown in plan
    s += r(Tx, Ty + 5, L, B.h, '#9eaab5', '#2c3e50', 1);
    for (let i = 0; i < nPosts; i++) {
      const px = Tx + i * actualSP - P.w / 2;
      s += r(Math.max(Tx, px), Ty, P.w, 20, '#5a6876', '#2c3e50', 1.5);
    }
  }

  s += viewLabel(Tx + L / 2, Ty - 14, 'TLOCRT');
  s += dimH(Tx, Tx + L, Ty - 22, `${L} cm`);
  s += dimH(Tx, Tx + actualSP, Ty + (W > 0 ? W : 20) + 18, `${n(actualSP)} cm`, false);

  // ---- FRONT ELEVATION ----
  s += ln(Fx, Fy + H, Fx + L, Fy + H, '#2c3e50', 1.5);
  for (let i = 0; i < nPosts; i++) {
    const px = Fx + i * actualSP;
    s += r(px - P.w / 2, Fy + B.h, P.w, H - B.h, '#9eaab5', '#2c3e50', 1);
  }
  s += r(Fx, Fy, L, B.h, '#6c7a86', '#2c3e50', 1.2);
  if (W > 0) {
    for (let i = 0; i < nRaf; i++) {
      const rx = Fx + i * (L / (nRaf - 1)) - RF.w / 2;
      s += r(Math.max(Fx, rx), Fy - RF.h, RF.w, RF.h, '#b8c4cc', '#2c3e50', 0.7);
    }
  }

  s += viewLabel(Fx + L / 2, Fy - RF.h - 14, 'PREDNJI IZGLED');
  s += dimH(Fx, Fx + L, Fy + H + 20, `${L} cm`, false);
  s += dimV(Fx + L + 18, Fy, Fy + H, `${H} cm`);

  const tbY = vbH - M + 10;
  s += ln(0, tbY - 5, vbW, tbY - 5, '#dee2e6', 0.5);
  s += tx(20, tbY + 6, 'LINIJSKA KONSTRUKCIJA', 8, 'start', '#1a2634');
  s += tx(20, tbY + 16, `Ukupna dužina: ${L}cm  |  Visina: ${H}cm  |  Razmak stubova: ≈${n(actualSP)}cm  |  Stubova: ${nPosts} kom`, 7, 'start', '#6b7280');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(vbW)} ${n(vbH)}">${svgDefs()}${s}</svg>`;
}

// -------- Router --------
function generateSVG() {
  const v = state.vals;
  try {
    switch (state.type) {
      case '4stuba':     return draw4stuba(v);
      case '2stuba_zid': return draw2stubaZid(v);
      case 'L':          return drawL(v);
      case 'linijska':   return drawLinijska(v);
    }
  } catch (e) {
    console.error(e);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><text x="20" y="40" font-size="14" fill="red">Greška: ${e.message}</text></svg>`;
  }
}

// ============================================================
// MATERIALS CALCULATION
// ============================================================

function generateMaterials() {
  const v = state.vals;
  let rows = [];

  function addRow(cat, item, profile, qty, len, unit) {
    const total = qty * len;
    const kg = total / 100 * profile.kgm;
    rows.push({ cat, item, profile: profile.label, qty, len, total, kg, unit: unit || 'kom' });
  }

  const P = PROF.POST, B = PROF.BEAM, RF = PROF.RAFTER;

  if (state.type === '4stuba') {
    const { length: L, width: W, height: H, rspacing: RS } = v;
    const nPostsSide = Math.max(2, Math.round(v.nPosts || 2));
    const nPosts = nPostsSide * 2;
    const postLen = H + 60; // +60cm for foundation / base plate
    const nRaf = Math.round(L / RS) + 1;
    const rafLen = W + 20; // +20cm overhang on each side

    addRow('Stubovi', 'Stub', P, nPosts, postLen);
    addRow('Grede', 'Uzdužna greda', B, 2, L);
    if (nPostsSide > 2) addRow('Grede', 'Poprečna greda (međustub)', B, nPostsSide - 2, W);
    addRow('Nosači', 'Nosač pergole (80×40)', RF, nRaf, rafLen);

  } else if (state.type === '2stuba_zid') {
    const { length: L, width: W, height: H, rspacing: RS } = v;
    const nRaf = Math.round(L / RS) + 1;
    const rafLen = W + 10;
    const postLen = H + 60;

    addRow('Stubovi', 'Slobodan stub', P, 2, postLen);
    addRow('Grede', 'Greda (slobodna strana)', B, 1, L);
    addRow('Grede', 'Zidna letva (npr. HEA ili pljosnat)', B, 1, L);
    addRow('Nosači', 'Nosač pergole (80×40)', RF, nRaf, rafLen);

  } else if (state.type === 'L') {
    const { length1: L1, width1: W1, length2: L2, width2: W2, height: H, rspacing: RS } = v;
    const postLen = H + 60;
    const nRaf1 = Math.round(L1 / RS) + 1;
    const nRaf2 = Math.round(L2 / RS) + 1;

    addRow('Stubovi', 'Stub – ugao i krajevi', P, 5, postLen);
    addRow('Grede', 'Uzdužna greda – krak A', B, 2, L1);
    addRow('Grede', 'Uzdužna greda – krak B', B, 2, L2);
    addRow('Nosači', 'Nosač pergole krak A (80×40)', RF, nRaf1, W1 + 20);
    addRow('Nosači', 'Nosač pergole krak B (80×40)', RF, nRaf2, W2 + 20);

  } else if (state.type === 'linijska') {
    const { length: L, height: H, spacing: SP, width: W } = v;
    const nPosts = Math.round(L / SP) + 1;
    const postLen = H + 60;
    const nRaf = W > 0 ? (Math.round(L / 60) + 1) : 0;

    addRow('Stubovi', 'Stub', P, nPosts, postLen);
    addRow('Grede', 'Horizontalna greda', B, 1, L);
    if (W > 0) addRow('Nosači', 'Nosač pergole (80×40)', RF, nRaf, W + 20);
  }

  if (!rows.length) return '<p style="color:#999;font-size:.9rem">Nema podataka.</p>';

  // Group by category
  const cats = [...new Set(rows.map(r => r.cat))];
  let totalKg = 0;

  let html = `<table class="mat-table">
    <thead><tr>
      <th>Pozicija</th>
      <th>Profil</th>
      <th style="text-align:right">Kom</th>
      <th style="text-align:right">Dužina (cm)</th>
      <th style="text-align:right">Ukupno (m)</th>
      <th style="text-align:right">≈ kg</th>
    </tr></thead><tbody>`;

  cats.forEach(cat => {
    html += `<tr class="cat-row"><td colspan="6">${cat}</td></tr>`;
    rows.filter(r => r.cat === cat).forEach(r => {
      totalKg += r.kg;
      html += `<tr>
        <td>${r.item}</td>
        <td class="tag-steel">${r.profile}</td>
        <td style="text-align:right">${r.qty}</td>
        <td style="text-align:right">${r.len}</td>
        <td style="text-align:right">${n(r.total / 100)}</td>
        <td style="text-align:right">${n(r.kg)}</td>
      </tr>`;
    });
  });

  const totalM = rows.reduce((s, r) => s + r.total / 100, 0);
  html += `<tr class="total-row">
    <td colspan="4"><strong>UKUPNO</strong></td>
    <td style="text-align:right"><strong>${n(totalM)} m</strong></td>
    <td style="text-align:right"><strong>≈ ${n(totalKg)} kg</strong></td>
  </tr>`;

  html += `</tbody></table>
    <p class="tag-note" style="margin-top:10px;padding:0 4px">
      * Dužine stubova uključuju +60cm za ukopavanje / postavljanje na ploče.<br>
      * Nosači pergole uključuju +20cm istek sa obe strane.<br>
      * Težine su okvirne (100×100×4: 11.9 kg/m, 80×40×3: 5.17 kg/m).
    </p>`;

  return html;
}

// Start
document.addEventListener('DOMContentLoaded', init);
