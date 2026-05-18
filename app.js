'use strict';

const KGM = { '100x100': 11.9, '80x40': 5.17 };

let tip = 'stub';
let val = {};

const POLJA = {
  stub: [
    { id: 'nStubova',    label: 'Broj stubova',      unit: 'kom', def: 3,   min: 2,  max: 10, step: 1 },
    { id: 'sirinaGrede', label: 'Širina grede',       unit: 'cm',  def: 300, min: 50, max: 2000 },
    { id: 'visina',      label: 'Visina stuba',       unit: 'cm',  def: 250, min: 30, max: 600 },
    { id: 'profStub',    label: 'Profil stuba',       unit: '',    def: '100x100', tip: 'select', opcije: ['100x100', '80x40'] },
    { id: 'profGreda',   label: 'Profil grede',       unit: '',    def: '100x100', tip: 'select', opcije: ['100x100', '80x40'] },
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

function init() {
  document.querySelectorAll('input[name="tip"]').forEach(r => {
    r.addEventListener('change', () => { tip = r.value; buildForma(); crtaj(); });
  });
  buildForma();
  crtaj();
}

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

function crtaj() {
  document.getElementById('crtez').innerHTML = tip === 'stub' ? svgStub() : svgLkonzola();
  document.getElementById('materijal').innerHTML = materijal();
}

function r(x, y, w, h, fill, stroke, sw) {
  return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill||'#9eaab5'}" stroke="${stroke||'#2c3e50'}" stroke-width="${sw||1}"/>`;
}
function l(x1,y1,x2,y2,stroke,sw,dash) {
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke||'#2c3e50'}" stroke-width="${sw||1}"${dash?` stroke-dasharray="${dash}"`:''}/>` ;
}
function t(x,y,txt,size,anchor,fill,bold) {
  return `<text x="${f(x)}" y="${f(y)}" font-size="${size||8}" text-anchor="${anchor||'middle'}" fill="${fill||'#1a2634'}" font-family="Arial,sans-serif"${bold?' font-weight="700"':''}>${txt}</text>`;
}
function f(v) { return Math.round(v * 10) / 10; }

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

function svgStub() {
  const { nStubova: N, sirinaGrede: SG, visina: H, profStub, profGreda } = val;
  const sw = profStub === '100x100' ? 10 : 8;
  const gw = profGreda === '100x100' ? 10 : 8;
  const SP = (N > 1) ? (SG - sw) / (N - 1) : 0;
  const stopaW = 15, stopaH = 2;

  const MX = 65, MY = 50;
  const GY = MY + H;
  const GredaY = MY;

  const vbW = MX + SG + MX + 30;
  const vbH = MY + H + stopaH + 45;

  let s = DEFS;

  s += l(MX - 15, GY + stopaH, MX + SG + 15, GY + stopaH, '#555', 1.5);
  for (let i = 0; i <= Math.floor((SG + 30) / 12); i++) {
    s += l(MX - 15 + i*12, GY + stopaH, MX - 25 + i*12, GY + stopaH + 10, '#aaa', 0.6);
  }

  s += r(MX, GredaY, SG, gw, '#6c7a86', '#2c3e50', 1.5);

  for (let i = 0; i < N; i++) {
    const sx = MX + i * SP;
    s += r(sx, GredaY + gw, sw, H - gw, '#9eaab5', '#2c3e50', 1.5);
    const stopX = sx - (stopaW - sw) / 2;
    s += r(stopX, GY, stopaW, stopaH, '#6c7a86', '#2c3e50', 1.5);
    s += l(sx + sw*0.25, GY, sx + sw*0.25, GY + stopaH + 5, '#c0392b', 1, '2 2');
    s += l(sx + sw*0.75, GY, sx + sw*0.75, GY + stopaH + 5, '#c0392b', 1, '2 2');
  }

  s += kotaV(MX - 30, GredaY + gw, GY, `${f(H - gw)} cm`, false);
  s += kotaH(MX, MX + SG, GY + stopaH + 22, `${SG} cm`, false);
  if (N > 1) s += kotaH(MX, MX + SP, GredaY - 22, `${f(SP)} cm`);
  s += kotaV(MX + SG + 22, GredaY, GredaY + gw, `${gw*10} mm`, true);

  s += t(MX + SG/2, MY - 22, 'PREDNJI IZGLED', 9, 'middle', '#1a2634', true);
  s += t(MX + SG/2, GredaY + gw/2 + 3, `${profGreda} mm`, 7, 'middle', '#fff');
  s += t(MX + sw + 3, GredaY + gw + H/2, `${profStub} mm`, 7, 'start', '#556');
  s += t(MX + SG/2, GY + stopaH + 10, 'stopa 150×150 mm', 6, 'middle', '#888');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(vbW)} ${f(vbH)}">${s}</svg>`;
}

function svgLkonzola() {
  const { nNosaca: N, razmak: SP, noga: NG, krak: KR, profil, profGreda } = val;
  const pw = profil === '100x100' ? 10 : 8;
  const gw = profGreda === '100x100' ? 10 : 8;
  const ukSpan = (N-1) * SP;
  const wallW = 14;

  const MX = 55, MY = 50;
  const GAP = 70;
  const sidewW = KR + pw + 50;
  const frontX = MX + sidewW + GAP;
  const ceoniW = ukSpan + pw;

  const vbW = frontX + ceoniW + wallW + MX + 30;
  const vbH = MY + NG + 70;

  let s = DEFS;

  // BOČNI POGLED
  const bx = MX, by = MY;

  s += r(bx - wallW, by - 10, wallW, NG + 20, '#d0d8df', '#8898aa', 1);
  for (let i = 0; i < 8; i++) {
    s += l(bx - wallW, by - 10 + i*16, bx, by - 10 + i*16 + 16, '#aaa', 0.6);
  }
  s += t(bx - wallW/2, by + NG/2 + 3, 'ZID', 7, 'middle', '#667');

  s += r(bx, by, pw, NG, '#9eaab5', '#2c3e50', 1.5);
  s += r(bx, by, KR + pw, pw, '#6c7a86', '#2c3e50', 1.5);

  s += r(bx + KR, by, gw, pw, '#aab0b8', '#2c3e50', 1.2);
  s += t(bx + KR + pw + 8, by + pw/2 + 3, profGreda + ' mm', 7, 'start', '#6c7a86');

  for (let i = 0; i < 3; i++) {
    const ay = by + pw + (NG - pw) * i / 2;
    s += l(bx - wallW + 2, ay, bx, ay, '#c0392b', 1.2, '2 2');
    s += r(bx - 3, ay - 1.5, 3, 3, '#c0392b', '#c0392b', 0);
  }

  s += l(bx - wallW - 5, by + NG, bx + pw + 15, by + NG, '#555', 1.5);

  s += kotaH(bx + pw, bx + pw + KR, by - 22, `${KR} cm`);
  s += kotaV(bx + KR + pw + 28, by + pw, by + NG, `${NG - pw} cm`, true);
  s += t(bx + pw/2, by + NG/2 + 3, profil, 7, 'middle', '#556');
  s += t(bx + KR/2 + pw/2, by + NG + 28, 'BOČNI POGLED', 9, 'middle', '#1a2634', true);

  // ČEONI POGLED
  const fx = frontX, fy = MY;

  s += r(fx - wallW, fy - 10, ceoniW + wallW*2, NG + 20, '#e8ecf0', '#c0cdd6', 0.5);
  for (let i = 0; i <= Math.floor((NG + 30) / 14); i++) {
    s += l(fx - wallW, fy - 10 + i*14, fx + ceoniW + wallW, fy - 10 + i*14, '#d0d8df', 0.4);
  }
  s += t(fx + ceoniW/2, fy - 2, 'ZID', 7, 'middle', '#8898a8');

  for (let i = 0; i < N; i++) {
    const nx = fx + i * SP;
    s += r(nx, fy + gw, pw, NG - gw, '#9eaab5', '#2c3e50', 1.5);
    s += r(nx, fy, pw, gw, '#4a5a68', '#2c3e50', 1.2);
  }

  s += r(fx, fy, ceoniW, gw, '#6c7a86', '#2c3e50', 1.8);
  s += t(fx + ceoniW/2, fy + gw/2 + 3, `${profGreda} mm`, 7, 'middle', '#fff');

  s += l(fx - 10, fy + NG, fx + ceoniW + 10, fy + NG, '#555', 1.5);
  for (let i = 0; i <= Math.floor((ceoniW + 20) / 12); i++) {
    s += l(fx - 10 + i*12, fy + NG, fx - 20 + i*12, fy + NG + 10, '#aaa', 0.6);
  }

  s += kotaH(fx, fx + ceoniW, fy + NG + 22, `${ceoniW} cm`, false);
  if (N > 1) s += kotaH(fx, fx + SP, fy + NG + 38, `${SP} cm`, false);
  s += kotaV(fx + ceoniW + 22, fy + gw, fy + NG, `${NG - gw} cm`, true);
  s += kotaV(fx - wallW - 16, fy, fy + gw, `${gw*10} mm`, false);
  s += t(fx + ceoniW/2, fy + NG + 54, 'ČEONI POGLED', 9, 'middle', '#1a2634', true);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(vbW)} ${f(vbH)}">${s}</svg>`;
}

function materijal() {
  const rows = [];

  function red(naziv, profil, kom, duzinaKom) {
    const ukupnoM = kom * duzinaKom / 100;
    const kg = ukupnoM * (KGM[profil] || 11.9);
    rows.push({ naziv, profil, kom, duzinaKom, ukupnoM, kg });
  }

  if (tip === 'stub') {
    const { nStubova: N, sirinaGrede: SG, visina: H, profStub, profGreda } = val;
    red('Stub', profStub, N, H);
    red('Horizontalna greda', profGreda, 1, SG);
    rows.push({ naziv: 'Stopa 150×150×10 mm', profil: 'pločevina', kom: N, duzinaKom: 0, ukupnoM: 0, kg: N * 1.8 });
  } else {
    const { nNosaca: N, razmak: SP, noga: NG, krak: KR, profil, profGreda } = val;
    const pw = profil === '100x100' ? 10 : 8;
    const ukSpan = (N-1)*SP + pw;
    red('L nosač – noga', profil, N, NG);
    red('L nosač – krak', profil, N, KR);
    red('Greda po krakovima', profGreda, 1, ukSpan);
    rows.push({ naziv: 'Anker vijci M12×150', profil: 'anker', kom: N * 3, duzinaKom: 0, ukupnoM: 0, kg: 0 });
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
  rows.forEach(row => {
    if (row.duzinaKom === 0) {
      totalKg += row.kg;
      const kgStr = row.kg > 0 ? row.kg.toFixed(1) : '—';
      html += `<tr><td>${row.naziv}</td><td style="color:#5a6876;font-weight:700">${row.profil}</td><td style="text-align:right">${row.kom}</td><td style="text-align:right;color:#8896a5">—</td><td style="text-align:right;color:#8896a5">—</td><td style="text-align:right">${kgStr}</td></tr>`;
      return;
    }
    totalM += row.ukupnoM; totalKg += row.kg;
    html += `<tr>
      <td>${row.naziv}</td>
      <td style="color:#5a6876;font-weight:700">${row.profil} mm</td>
      <td style="text-align:right">${row.kom}</td>
      <td style="text-align:right">${row.duzinaKom}</td>
      <td style="text-align:right">${row.ukupnoM.toFixed(2)}</td>
      <td style="text-align:right">${row.kg.toFixed(1)}</td>
    </tr>`;
  });

  html += `<tr class="total">
    <td colspan="4"><strong>UKUPNO ČELIK</strong></td>
    <td style="text-align:right"><strong>${totalM.toFixed(2)} m</strong></td>
    <td style="text-align:right"><strong>≈ ${totalKg.toFixed(1)} kg</strong></td>
  </tr></tbody></table>`;

  if (tip === 'stub') {
    const { nStubova: N, sirinaGrede: SG, profStub } = val;
    const sw = profStub === '100x100' ? 10 : 8;
    const SP = N > 1 ? (SG - sw) / (N - 1) : 0;
    html += `<p class="napomena">* Izračunati razmak stubova (c-c): <strong>${f(SP)} cm</strong><br>* Stopa 150×150×10 mm zavarena na dno stuba, anker vijci M12.<br>* Težine okvirne: 100×100×4 = 11.9 kg/m, 80×40×3 = 5.17 kg/m.</p>`;
  } else {
    html += `<p class="napomena">* L nosač: noga + krak zavareni pod 90°. Greda se pomera po krakovima za dotezanje u libelu.<br>* Anker vijci: 3 kom po nosaču, M12×150, hemijski ili mehanički anker.<br>* Težine okvirne: 100×100×4 = 11.9 kg/m, 80×40×3 = 5.17 kg/m.</p>`;
  }

  return html;
}

document.addEventListener('DOMContentLoaded', init);
