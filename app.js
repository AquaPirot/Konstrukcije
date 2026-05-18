'use strict';

// kg/m za profile
const KGM = { '100x100': 11.9, '80x40': 5.17 };

// Stanje aplikacije
let tip = 'stub';
let val = {};

// Polja po tipu
const POLJA = {
  stub: [
    { id: 'nStubova',  label: 'Broj stubova',    unit: 'kom', def: 3,   min: 2,  max: 10, step: 1 },
    { id: 'razmak',    label: 'Razmak (c-c)',     unit: 'cm',  def: 150, min: 30, max: 600 },
    { id: 'visina',    label: 'Visina stuba',     unit: 'cm',  def: 250, min: 30, max: 600 },
    { id: 'profStub',  label: 'Profil stuba',     unit: '',    def: '100x100', tip: 'select', opcije: ['100x100', '80x40'] },
    { id: 'profGreda', label: 'Profil grede',     unit: '',    def: '100x100', tip: 'select', opcije: ['100x100', '80x40'] },
  ],
  lkonzola: [
    { id: 'nNosaca',   label: 'Broj L nosača',    unit: 'kom', def: 3,  min: 2,  max: 10, step: 1 },
    { id: 'razmak',    label: 'Razmak (c-c)',     unit: 'cm',  def: 100, min: 30, max: 400 },
    { id: 'noga',      label: 'Visina noge',      unit: 'cm',  def: 100, min: 20, max: 300 },
    { id: 'krak',      label: 'Dužina kraka',     unit: 'cm',  def: 70,  min: 20, max: 200 },
    { id: 'profil',    label: 'Profil L nosača',  unit: '',    def: '100x100', tip: 'select', opcije: ['100x100', '80x40'] },
    { id: 'profGreda', label: 'Profil grede',     unit: '',    def: '100x100', tip: 'select', opcije: ['100x100', '80x40'] },
  ],
};

// ── INIT ──────────────────────────────────────────────
function init() {
  document.querySelectorAll('input[name="tip"]').forEach(r => {
    r.addEventListener('change', () => { tip = r.value; buildForma(); crtaj(); });
  });
  buildForma();
  crtaj();
}

// ── FORMA ─────────────────────────────────────────────
function buildForma() {
  const prev = { ...val };
  val = {};
  const wrap = document.getElementById('forma');
  wrap.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'polja';

  POLJA[tip].forEach(p => {
    val[p.id] = prev[p.id] !== undefined ? prev[p.id] : p.def;
    const g = document.createElement('div');
    g.className = 'polje';

    if (p.tip === 'select') {
      g.innerHTML = `<label>${p.label}</label>
        <select id="f_${p.id}">
          ${p.opcije.map(o => `<option value="${o}" ${val[p.id] === o ? 'selected' : ''}>${o} mm</option>`).join('')}
        </select>`;
      g.querySelector('select').addEventListener('change', e => {
        val[p.id] = e.target.value; crtaj();
      });
    } else {
      g.innerHTML = `<label>${p.label}${p.unit ? ` <span style="font-weight:400;color:#aaa">(${p.unit})</span>` : ''}</label>
        <input type="number" id="f_${p.id}" value="${val[p.id]}" min="${p.min}" max="${p.max}" step="${p.step || 1}">`;
      g.querySelector('input').addEventListener('input', e => {
        const v = parseFloat(e.target.value);
        if (!isNaN(v) && v >= p.min && v <= p.max) { val[p.id] = v; crtaj(); }
      });
    }
    div.appendChild(g);
  });

  wrap.appendChild(div);
}

// ── CRTAJ ─────────────────────────────────────────────
function crtaj() {
  document.getElementById('crtez').innerHTML = tip === 'stub' ? svgStub() : svgLkonzola();
  document.getElementById('materijal').innerHTML = materijal();
}

// ── SVG HELPERS ───────────────────────────────────────
function r(x, y, w, h, fill, stroke, sw) {
  return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill||'#9eaab5'}" stroke="${stroke||'#2c3e50'}" stroke-width="${sw||1}"/>`;
}
function l(x1,y1,x2,y2,stroke,sw,dash) {
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke||'#2c3e50'}" stroke-width="${sw||1}"${dash?` stroke-dasharray="${dash}"`:''}/>`;
}
function t(x,y,txt,size,anchor,fill,bold) {
  return `<text x="${f(x)}" y="${f(y)}" font-size="${size||8}" text-anchor="${anchor||'middle'}" fill="${fill||'#1a2634'}" font-family="Arial,sans-serif"${bold?' font-weight="700"':''}>${txt}</text>`;
}
function f(v) { return Math.round(v * 10) / 10; }

// Kota horizontalna
function kotaH(x1, x2, y, label, gore) {
  gore = gore !== false;
  const dy = gore ? -16 : 16;
  const mid = (x1+x2)/2;
  return `
    <line x1="${f(x1)}" y1="${f(y)}" x2="${f(x2)}" y2="${f(y)}" stroke="#c0392b" stroke-width="0.8" marker-start="url(#a)" marker-end="url(#b)"/>
    <line x1="${f(x1)}" y1="${f(y-6)}" x2="${f(x1)}" y2="${f(y+6)}" stroke="#c0392b" stroke-width="0.8"/>
    <line x1="${f(x2)}" y1="${f(y-6)}" x2="${f(x2)}" y2="${f(y+6)}" stroke="#c0392b" stroke-width="0.8"/>
    <text x="${f(mid)}" y="${f(y+dy)}" text-anchor="middle" font-size="8" fill="#c0392b" font-family="Arial,sans-serif" font-weight="600">${label}</text>`;
}

// Kota vertikalna
function kotaV(x, y1, y2, label, desno) {
  desno = desno !== false;
  const dx = desno ? 18 : -18;
  const mid = (y1+y2)/2;
  const tx = x + dx;
  return `
    <line x1="${f(x)}" y1="${f(y1)}" x2="${f(x)}" y2="${f(y2)}" stroke="#c0392b" stroke-width="0.8" marker-start="url(#a)" marker-end="url(#b)"/>
    <line x1="${f(x-6)}" y1="${f(y1)}" x2="${f(x+6)}" y2="${f(y1)}" stroke="#c0392b" stroke-width="0.8"/>
    <line x1="${f(x-6)}" y1="${f(y2)}" x2="${f(x+6)}" y2="${f(y2)}" stroke="#c0392b" stroke-width="0.8"/>
    <text x="${f(tx)}" y="${f(mid+3)}" text-anchor="middle" font-size="8" fill="#c0392b" font-family="Arial,sans-serif" font-weight="600" transform="rotate(-90,${f(tx)},${f(mid)})">${label}</text>`;
}

const DEFS = `<defs>
  <marker id="a" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto-start-reverse">
    <path d="M1,1 L3.5,3.5 L1,6" fill="none" stroke="#c0392b" stroke-width="1"/>
  </marker>
  <marker id="b" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
    <path d="M1,1 L3.5,3.5 L1,6" fill="none" stroke="#c0392b" stroke-width="1"/>
  </marker>
</defs>`;

// ── SVG: STUB + GREDA ─────────────────────────────────
function svgStub() {
  const { nStubova: N, razmak: SP, visina: H, profStub, profGreda } = val;
  const sw = profStub === '100x100' ? 10 : 8;   // širina profila stuba (cm)
  const sh = profStub === '100x100' ? 10 : 4;   // visina profila stuba (h u pogledu je debljina)
  const gw = profGreda === '100x100' ? 10 : 8;  // visina grede
  const ukW = (N-1) * SP;  // ukupna širina

  const MX = 60, MY = 50;  // margine
  const GY = MY + H;        // y koordinata tla
  const GredaY = MY;        // greda na vrhu

  const vbW = MX + ukW + MX + 30;
  const vbH = MY + H + gw + 50;

  let s = DEFS;

  // Tlo
  s += l(MX - 10, GY, MX + ukW + 10, GY, '#555', 1.5);
  // Tlo šrafe
  for (let i = 0; i <= Math.floor((ukW+20)/12); i++) {
    s += l(MX - 10 + i*12, GY, MX - 20 + i*12, GY+10, '#aaa', 0.6);
  }

  // Greda (ide od prvog do poslednjeg stuba, na vrhu)
  s += r(MX, GredaY, ukW + sw, gw, '#6c7a86', '#2c3e50', 1.5);

  // Stubovi
  for (let i = 0; i < N; i++) {
    const sx = MX + i * SP;
    s += r(sx, GredaY + gw, sw, H - gw, '#9eaab5', '#2c3e50', 1.5);
  }

  // Kote
  // Visina stuba
  s += kotaV(MX - 25, GredaY + gw, GY, `${H - gw} cm`, false);
  // Ukupna širina
  s += kotaH(MX, MX + ukW + sw, GY + 28, `${ukW + sw} cm`, false);
  // Razmak stubova (ako ima više od 2)
  if (N > 1) {
    s += kotaH(MX, MX + SP, GY + 42, `${SP} cm`, false);
  }
  // Visina grede
  s += kotaV(MX + ukW + sw + 20, GredaY, GredaY + gw, `${gw*10} mm`, true);

  // Oznake
  s += t(MX + ukW/2, MY - 20, 'PREDNJI IZGLED', 9, 'middle', '#1a2634', true);
  s += t(MX, GY + 16, profStub, 7, 'start', '#6c7a86');
  s += t(MX + ukW/2, GredaY + gw/2 + 3, profGreda, 7, 'middle', '#fff');

  // Osnov stuba (ankeri)
  for (let i = 0; i < N; i++) {
    const sx = MX + i * SP;
    s += r(sx - 4, GY - 2, sw + 8, 4, '#888', '#555', 1);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(vbW)} ${f(vbH)}">${s}</svg>`;
}

// ── SVG: L KONZOLA ────────────────────────────────────
function svgLkonzola() {
  const { nNosaca: N, razmak: SP, noga: NG, krak: KR, profil, profGreda } = val;
  const pw = profil === '100x100' ? 10 : 8;  // debljina profila L nosača (cm)
  const gw = profGreda === '100x100' ? 10 : 8; // visina grede
  const ukSpan = (N-1) * SP;  // ukupna dužina grede

  // Crtamo dva pogleda:
  // LEVO: bočni pogled - jedan L nosač
  // DESNO: prednji pogled - svi nosači + greda

  const MX = 55, MY = 50;
  const GAP = 60;  // razmak između dva pogleda

  // Bočni pogled dimenzije
  const sidewW = KR + pw + 30;  // širina bočnog pogleda
  const sidewH = NG + pw;       // visina

  // Prednji pogled
  const frontX = MX + sidewW + GAP;
  const frontW = ukSpan + pw;

  const vbW = frontX + frontW + MX + 20;
  const vbH = MY + sidewH + 60;

  let s = DEFS;

  // ─ BOČNI POGLED ─
  const bx = MX;           // x zida / levi rub
  const by = MY;            // vrh nosača
  const grdY = by;          // greda je na vrhu (na kraju kraka)
  const botY = by + NG;     // dno noge

  // Zid (šrafura)
  const wallW = 14;
  s += r(bx - wallW, by - 10, wallW, sidewH + 20, '#d0d8df', '#8898aa', 1);
  for (let i = 0; i < 8; i++) {
    s += l(bx - wallW, by - 10 + i*16, bx, by - 10 + i*16 + 16, '#aaa', 0.6);
  }
  s += t(bx - wallW/2, by + sidewH/2, 'ZID', 7, 'middle', '#667');

  // Noga (vertikalno, uz zid)
  s += r(bx, by, pw, NG, '#9eaab5', '#2c3e50', 1.5);

  // Krak (horizontalno, na vrhu noge, ide u desno)
  s += r(bx, by, KR + pw, pw, '#6c7a86', '#2c3e50', 1.5);

  // Kota noge
  s += kotaV(bx + pw + 15, by + pw, botY, `${NG} cm`, true);
  // Kota kraka
  s += kotaH(bx + pw, bx + pw + KR, by - 22, `${KR} cm`);

  // Tlo
  s += l(bx - wallW - 5, botY, bx + pw + 15, botY, '#555', 1.5);

  // Ankeri u zid (3 tačke)
  for (let i = 0; i < 3; i++) {
    const ay = by + pw + (NG - pw) * i / 2;
    s += l(bx - wallW, ay, bx, ay, '#c0392b', 1, '2 2');
    s += r(bx - 3, ay - 1.5, 3, 3, '#c0392b', '#c0392b', 0);
  }

  // Labela grede na kraju kraka
  s += r(bx + KR, by, gw, pw, '#aab0b8', '#2c3e50', 1);
  s += t(bx + KR + pw + 12, by + pw/2 + 3, profGreda, 7, 'start', '#6c7a86');

  s += t(bx + KR/2 + pw, by + sidewH/2 + 10, 'BOČNI POGLED', 9, 'middle', '#1a2634', true);

  // Profil oznaka
  s += t(bx + pw + 4, by + NG/2 + 3, profil, 7, 'start', '#1a2634');

  // ─ PREDNJI POGLED ─
  const fx = frontX;
  const fy = MY;

  // Zid (leva strana)
  s += r(fx - wallW, fy - 10, wallW, sidewH + 20, '#d0d8df', '#8898aa', 1);
  for (let i = 0; i < 8; i++) {
    s += l(fx - wallW, fy - 10 + i*16, fx, fy - 10 + i*16 + 16, '#aaa', 0.6);
  }

  // Noge svih nosača (vertikalne cevi uz zid)
  for (let i = 0; i < N; i++) {
    s += r(fx, fy, pw, NG, '#9eaab5', '#2c3e50', 1.2);
  }
  // Prikažemo jednu nogu (sve su na istom mestu u prednjem pogledu)
  s += r(fx, fy, pw, NG, '#9eaab5', '#2c3e50', 1.5);

  // Greda (horizontalna, na vrhu krakova)
  s += r(fx, fy, ukSpan + pw, gw, '#6c7a86', '#2c3e50', 1.5);

  // Tačke nosača duž grede
  for (let i = 0; i < N; i++) {
    const nx = fx + i * SP;
    // Noge su uz zid, ne vidimo ih u prednjem pogledu (idu u dubinu)
    // Prikazujemo gde greda leži na krakovima
    s += r(nx, fy, pw, gw, '#4a5a68', '#2c3e50', 1.5);
  }

  // Kota ukupne dužine
  s += kotaH(fx, fx + ukSpan + pw, fy + sidewH + 22, `${ukSpan + pw} cm`, false);
  // Razmak nosača
  if (N > 1) {
    s += kotaH(fx, fx + SP, fy + sidewH + 36, `${SP} cm`, false);
  }
  // Visina nosača
  s += kotaV(fx + ukSpan + pw + 22, fy + gw, fy + NG, `${NG - gw} cm`, true);

  // Tlo
  s += l(fx - wallW - 5, fy + NG, fx + ukSpan + pw + 20, fy + NG, '#555', 1.5);

  s += t(fx + ukSpan/2 + pw, fy + sidewH + 50, 'PREDNJI POGLED', 9, 'middle', '#1a2634', true);
  s += t(fx + ukSpan/2 + pw, fy + gw/2 + 3, `Greda ${profGreda}`, 7, 'middle', '#fff');

  // Napomena kota - visina grede
  s += kotaV(fx - wallW - 16, fy, fy + gw, `${gw*10}mm`, false);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(vbW)} ${f(vbH)}">${s}</svg>`;
}

// ── MATERIJAL ─────────────────────────────────────────
function materijal() {
  const rows = [];

  function red(naziv, profil, kom, duzinaKom) {
    const ukupnoM = kom * duzinaKom / 100;
    const kg = ukupnoM * (KGM[profil] || 11.9);
    rows.push({ naziv, profil, kom, duzinaKom, ukupnoM, kg });
  }

  if (tip === 'stub') {
    const { nStubova: N, razmak: SP, visina: H, profStub, profGreda } = val;
    const ukW = (N-1)*SP + (profStub === '100x100' ? 10 : 8);
    red('Stub', profStub, N, H + 60);         // +60cm za ukopavanje
    red('Horizontalna greda', profGreda, 1, ukW);
  } else {
    const { nNosaca: N, razmak: SP, noga: NG, krak: KR, profil, profGreda } = val;
    const pw = profil === '100x100' ? 10 : 8;
    const ukSpan = (N-1)*SP + pw;
    red('L nosač – noga (100×100)', profil, N, NG);
    red('L nosač – krak (100×100)', profil, N, KR);
    red('Greda po krakovima', profGreda, 1, ukSpan);
    red('Anker vijci M12 (za zid)', 'kom', N * 3, 0);
  }

  let html = `<table class="mat">
    <thead><tr>
      <th>Pozicija</th><th>Profil</th>
      <th style="text-align:right">Kom</th>
      <th style="text-align:right">Dužina (cm)</th>
      <th style="text-align:right">Ukupno (m)</th>
      <th style="text-align:right">≈ kg</th>
    </tr></thead><tbody>`;

  let totalM = 0, totalKg = 0;

  rows.forEach(r => {
    if (r.duzinaKom === 0) {
      html += `<tr><td>${r.naziv}</td><td>—</td><td style="text-align:right">${r.kom}</td><td colspan="3" style="text-align:right;color:#8896a5">—</td></tr>`;
      return;
    }
    totalM += r.ukupnoM;
    totalKg += r.kg;
    html += `<tr>
      <td>${r.naziv}</td>
      <td style="color:#5a6876;font-weight:700">${r.profil} mm</td>
      <td style="text-align:right">${r.kom}</td>
      <td style="text-align:right">${r.duzinaKom}</td>
      <td style="text-align:right">${r.ukupnoM.toFixed(2)}</td>
      <td style="text-align:right">${r.kg.toFixed(1)}</td>
    </tr>`;
  });

  html += `<tr class="total">
    <td colspan="4"><strong>UKUPNO ČELIK</strong></td>
    <td style="text-align:right"><strong>${totalM.toFixed(2)} m</strong></td>
    <td style="text-align:right"><strong>≈ ${totalKg.toFixed(1)} kg</strong></td>
  </tr></tbody></table>`;

  if (tip === 'stub') {
    html += `<p class="napomena">* Stubovi: dužina uključuje +60 cm za ukopavanje ili postavljanje na ploče.<br>* Težine okvirne: 100×100×4 = 11.9 kg/m, 80×40×3 = 5.17 kg/m.</p>`;
  } else {
    html += `<p class="napomena">* L nosač se izrađuje od jednog profila: noga + krak se zavaruju pod 90°.<br>* Anker vijci: 3 kom po nosaču, M12×150, hemijski ili mehanički anker.<br>* Težine okvirne: 100×100×4 = 11.9 kg/m, 80×40×3 = 5.17 kg/m.</p>`;
  }

  return html;
}

document.addEventListener('DOMContentLoaded', init);
