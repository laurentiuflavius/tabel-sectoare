/* Generator tabel sectoare — logică aplicație */
'use strict';

const MONTHS = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
const WEEKDAYS = ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'];

let uid = 1;
const nid = () => 'id' + (uid++);

/* ── Stare implicită: configurația Acoperișul Speranței, iulie 2026 ── */
function defaultState() {
  const P = {};
  ['Paula','Denisa','Mihaela','Loredana','Narcisa','Florica','Alex','David','Erkan','Cristi','Luiza']
    .forEach(n => P[n] = nid());
  const S = {};
  ['Vase','Sala de mese','Hol','Camera de zi','Colectare ecologică','Verificare animale']
    .forEach(n => S[n] = nid());
  const girls = ['Paula','Denisa','Mihaela','Loredana','Narcisa','Florica'];
  const boys  = ['Alex','David','Erkan'];
  return {
    month: 6, year: 2026,
    title: 'Tabel sectoare beneficiari',
    options: { birthdayFree: true, maxDays: true, unavail: true, minGap: true },
    persons: Object.entries(P).map(([name, id]) => ({
      id, name, birthday: '',
      unavailFrom: name === 'Loredana' ? 8 : null,
      unavailTo:   name === 'Loredana' ? 31 : null,
      maxDays: (name === 'Cristi' || name === 'Luiza') ? 12 : null,
    })),
    sectors: [
      { id: S['Vase'], name: 'Vase', rotative: true, independent: false, minGap: 3,
        eligible: [...girls, 'Luiza'].map(n => P[n]) },
      { id: S['Sala de mese'], name: 'Sala de mese', rotative: false, independent: false, minGap: 3,
        eligible: [...girls, ...boys, 'Luiza'].map(n => P[n]) },
      { id: S['Hol'], name: 'Hol', rotative: false, independent: false, minGap: 3,
        eligible: [...girls, ...boys, 'Cristi', 'Luiza'].map(n => P[n]) },
      { id: S['Camera de zi'], name: 'Camera de zi', rotative: false, independent: false, minGap: 3,
        eligible: [...girls, ...boys, 'Cristi', 'Luiza'].map(n => P[n]) },
      { id: S['Colectare ecologică'], name: 'Colectare ecologică', rotative: false, independent: false, minGap: 3,
        eligible: ['Florica', ...boys, 'Cristi', 'Luiza'].map(n => P[n]) },
      { id: S['Verificare animale'], name: 'Verificare animale', rotative: true, independent: true, minGap: 1,
        eligible: boys.map(n => P[n]) },
    ],
    weekdayRules: [
      { id: nid(), days: [6], persons: boys.map(n => P[n]),
        allowed: [S['Colectare ecologică'], S['Verificare animale']] },
    ],
  };
}

/* ── Persistență (funcționează pe GitHub Pages; ignorată unde nu e permisă) ── */
function saveState() { try { localStorage.setItem('rota-state', JSON.stringify(state)); } catch (e) {} }
function loadState() {
  try {
    const raw = localStorage.getItem('rota-state');
    if (!raw) return null;
    const s = JSON.parse(raw);
    const maxNum = JSON.stringify(s).match(/"id(\d+)"/g) || [];
    uid = 1 + Math.max(0, ...maxNum.map(m => parseInt(m.match(/\d+/)[0], 10)));
    return s;
  } catch (e) { return null; }
}

let state = loadState() || defaultState();
let lastSchedule = null;

/* ── Utilitare ── */
const $ = sel => document.querySelector(sel);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) n.setAttribute(k, v);
  }
  for (const kid of kids) n.append(kid);
  return n;
};
const daysInMonth = () => new Date(state.year, state.month + 1, 0).getDate();
const personById = id => state.persons.find(p => p.id === id);

/* ═══════════════ RANDARE UI ═══════════════ */

function renderMonth() {
  const sel = $('#month-select');
  sel.innerHTML = '';
  MONTHS.forEach((m, i) => sel.append(el('option', { value: i }, m)));
  sel.value = state.month;
  $('#year-input').value = state.year;
  $('#title-input').value = state.title;
  updateMonthHint();
}
function updateMonthHint() {
  const n = daysInMonth();
  const first = WEEKDAYS[new Date(state.year, state.month, 1).getDay()];
  $('#month-hint').textContent =
    `${MONTHS[state.month]} ${state.year} are ${n} zile și începe într-o zi de ${first.toLowerCase()}.`;
}

function renderPersons() {
  const list = $('#persons-list');
  list.innerHTML = '';
  for (const p of state.persons) {
    const row = el('div', { class: 'person-row' },
      el('input', { type: 'text', value: p.name, 'aria-label': 'Nume',
        oninput: e => { p.name = e.target.value; saveState(); renderSectors(); renderWeekdayRules(); } }),
      el('input', { type: 'text', value: p.birthday, placeholder: 'ZZ.LL', 'aria-label': 'Zi de naștere',
        oninput: e => { p.birthday = e.target.value.trim(); saveState(); } }),
      el('div', { class: 'range' },
        el('input', { type: 'number', min: 1, max: 31, value: p.unavailFrom ?? '', placeholder: '—',
          'aria-label': 'Indisponibil de la',
          oninput: e => { p.unavailFrom = e.target.value ? +e.target.value : null; saveState(); } }),
        '–',
        el('input', { type: 'number', min: 1, max: 31, value: p.unavailTo ?? '', placeholder: '—',
          'aria-label': 'Indisponibil până la',
          oninput: e => { p.unavailTo = e.target.value ? +e.target.value : null; saveState(); } })),
      el('input', { type: 'number', min: 1, max: 31, value: p.maxDays ?? '', placeholder: '—',
        'aria-label': 'Maxim zile pe lună',
        oninput: e => { p.maxDays = e.target.value ? +e.target.value : null; saveState(); } }),
      el('button', { class: 'btn-x', title: 'Șterge persoana', 'aria-label': `Șterge ${p.name}`,
        onclick: () => {
          state.persons = state.persons.filter(x => x !== p);
          state.sectors.forEach(s => s.eligible = s.eligible.filter(id => id !== p.id));
          state.weekdayRules.forEach(r => r.persons = r.persons.filter(id => id !== p.id));
          saveState(); renderPersons(); renderSectors(); renderWeekdayRules();
        } }, '×'));
    list.append(row);
  }
}

function chip(labelText, checked, onchange) {
  const input = el('input', { type: 'checkbox', onchange });
  input.checked = checked;
  return el('label', { class: 'chip' }, input, labelText);
}

function renderSectors() {
  const list = $('#sectors-list');
  list.innerHTML = '';
  for (const s of state.sectors) {
    const rot = el('input', { type: 'checkbox',
      onchange: e => { s.rotative = e.target.checked; saveState(); } });
    rot.checked = s.rotative;
    const ind = el('input', { type: 'checkbox',
      onchange: e => { s.independent = e.target.checked; saveState(); } });
    ind.checked = s.independent;

    const card = el('div', { class: 'sector-card' },
      el('div', { class: 'sector-top' },
        el('label', { class: 'name' }, 'Nume sector',
          el('input', { type: 'text', value: s.name,
            oninput: e => { s.name = e.target.value; saveState(); renderWeekdayRules(); } })),
        el('div', { class: 'badges' },
          el('label', { class: 'badge-toggle' }, rot, 'Rotație fixă'),
          el('label', { class: 'badge-toggle' }, ind, 'Independent'),
          el('label', { class: 'badge-toggle mingap' }, 'Interval minim:',
            el('input', { type: 'number', min: 1, max: 15, value: s.minGap,
              oninput: e => { s.minGap = Math.max(1, +e.target.value || 1); saveState(); } })),
          el('button', { class: 'btn-x', title: 'Șterge sectorul',
            onclick: () => {
              state.sectors = state.sectors.filter(x => x !== s);
              state.weekdayRules.forEach(r => r.allowed = r.allowed.filter(id => id !== s.id));
              saveState(); renderSectors(); renderWeekdayRules();
            } }, '×'))),
      el('div', { class: 'chips-label' }, 'Cine poate face acest sector'),
      el('div', { class: 'chips' },
        ...state.persons.map(p => chip(p.name, s.eligible.includes(p.id), e => {
          if (e.target.checked) s.eligible.push(p.id);
          else s.eligible = s.eligible.filter(id => id !== p.id);
          saveState();
        }))));
    list.append(card);
  }
}

function renderOptions() {
  $('#opt-birthday').checked = state.options.birthdayFree;
  $('#opt-maxdays').checked = state.options.maxDays;
  $('#opt-unavail').checked = state.options.unavail;
  $('#opt-mingap').checked = state.options.minGap;
}

function renderWeekdayRules() {
  const wrap = $('#weekday-rules');
  wrap.innerHTML = '';
  for (const r of state.weekdayRules) {
    const sentence = el('p', { class: 'wd-sentence' });
    const refresh = () => {
      const zile = r.days.map(d => WEEKDAYS[d].toLowerCase()).join(', ') || '—';
      const pers = r.persons.map(id => personById(id)?.name).filter(Boolean).join(', ') || '—';
      const sect = r.allowed.map(id => state.sectors.find(s => s.id === id)?.name).filter(Boolean).join(', ') || 'niciun sector';
      sentence.textContent = `În zilele de ${zile}, ${pers} pot avea doar: ${sect}.`;
    };
    const card = el('div', { class: 'wd-rule' },
      el('button', { class: 'btn-x', title: 'Șterge restricția',
        onclick: () => { state.weekdayRules = state.weekdayRules.filter(x => x !== r); saveState(); renderWeekdayRules(); } }, '×'),
      el('div', { class: 'chips-label' }, 'Zilele săptămânii'),
      el('div', { class: 'chips' }, ...WEEKDAYS.map((w, d) => chip(w, r.days.includes(d), e => {
        if (e.target.checked) r.days.push(d); else r.days = r.days.filter(x => x !== d);
        saveState(); refresh();
      }))),
      el('div', { class: 'chips-label' }, 'Persoanele vizate'),
      el('div', { class: 'chips' }, ...state.persons.map(p => chip(p.name, r.persons.includes(p.id), e => {
        if (e.target.checked) r.persons.push(p.id); else r.persons = r.persons.filter(x => x !== p.id);
        saveState(); refresh();
      }))),
      el('div', { class: 'chips-label' }, 'Sectoarele permise în acele zile'),
      el('div', { class: 'chips' }, ...state.sectors.map(s => chip(s.name, r.allowed.includes(s.id), e => {
        if (e.target.checked) r.allowed.push(s.id); else r.allowed = r.allowed.filter(x => x !== s.id);
        saveState(); refresh();
      }))),
      sentence);
    refresh();
    wrap.append(card);
  }
}

/* ═══════════════ SOLVER ═══════════════ */

function birthdayDay(p) {
  const m = /^(\d{1,2})\.(\d{1,2})$/.exec(p.birthday || '');
  if (!m) return null;
  return (+m[2] === state.month + 1) ? +m[1] : null;
}
function isAvailable(p, day) {
  if (state.options.unavail && p.unavailFrom != null) {
    const to = p.unavailTo ?? 31;
    if (day >= p.unavailFrom && day <= to) return false;
  }
  if (state.options.birthdayFree && birthdayDay(p) === day) return false;
  return true;
}
function weekdayAllows(pid, sid, day) {
  const wd = new Date(state.year, state.month, day).getDay();
  for (const r of state.weekdayRules) {
    if (r.days.includes(wd) && r.persons.includes(pid) && !r.allowed.includes(sid)) return false;
  }
  return true;
}

function solve() {
  const N = daysInMonth();
  const sectors = state.sectors.filter(s => s.name.trim() && s.eligible.length);
  const mulberry = seed => () => {                    // PRNG determinist per încercare
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const attempt = (seedNo) => {
    const rnd = mulberry(seedNo * 7919 + 13);
    const asg = {};                                   // sid -> {day: pid}
    sectors.forEach(s => asg[s.id] = {});
    const last = {};                                  // pid|sid -> ultima zi
    const busy = {};                                  // zi -> Set(pid) pe sectoare ne-independente
    const total = {};                                 // pid -> zile totale
    for (let d = 1; d <= N; d++) busy[d] = new Set();
    let penalty = 0;

    for (let d = 1; d <= N; d++) {
      // sectoarele cu mai puțini candidați se rezolvă primele
      const order = [...sectors].sort((a, b) => a.eligible.length - b.eligible.length);
      for (const s of order) {
        const cands = [];
        for (const pid of s.eligible) {
          const p = personById(pid);
          if (!p || !isAvailable(p, d)) continue;
          if (!s.independent && busy[d].has(pid)) continue;
          if (!weekdayAllows(pid, s.id, d)) continue;
          if (state.options.maxDays && p.maxDays != null && (total[pid] || 0) >= p.maxDays) continue;
          const gap = d - (last[pid + '|' + s.id] ?? -100);
          if (state.options.minGap && gap < s.minGap) continue;
          cands.push({ pid, gap, count: Object.values(asg[s.id]).filter(x => x === pid).length });
        }
        if (!cands.length) return { fail: { day: d, sector: s.name } };
        let pick;
        if (s.rotative) {                             // rotație: cel mai vechi la rând
          cands.sort((a, b) => b.gap - a.gap);
          pick = cands[0];
        } else {                                      // distribuit: echilibru + interval mare
          cands.sort((a, b) => (a.count - b.count) || (b.gap - a.gap) || (rnd() - .5));
          const best = cands.filter(c => c.count === cands[0].count).slice(0, 3);
          pick = best[Math.floor(rnd() * best.length)];
          if (pick.gap < 5) penalty += (5 - pick.gap) * 2;
          else if (pick.gap < 7) penalty += 1;
        }
        asg[s.id][d] = pick.pid;
        last[pick.pid + '|' + s.id] = d;
        if (!s.independent) busy[d].add(pick.pid);
        total[pick.pid] = (total[pick.pid] || 0) + 1;
      }
    }
    // dezechilibru de încărcare per sector
    for (const s of sectors.filter(x => !x.rotative)) {
      const counts = {};
      Object.values(asg[s.id]).forEach(pid => counts[pid] = (counts[pid] || 0) + 1);
      const v = Object.values(counts);
      if (v.length) penalty += (Math.max(...v) - Math.min(...v)) * 2;
    }
    return { asg, penalty };
  };

  let best = null, lastFail = null;
  const deadline = Date.now() + 4000;
  for (let seed = 0; seed < 6000 && Date.now() < deadline; seed++) {
    const r = attempt(seed);
    if (r.fail) { lastFail = r.fail; continue; }
    if (!best || r.penalty < best.penalty) best = r;
    if (best.penalty === 0) break;
  }
  if (!best) return { error: lastFail };
  return { schedule: best.asg, sectors };
}

/* ═══════════════ VERIFICARE + PREVIEW ═══════════════ */

function verify(schedule, sectors) {
  const N = daysInMonth();
  const notes = [];
  notes.push('Fiecare sector are exact o persoană în fiecare zi.');
  notes.push('Nicio persoană nu are două sectoare în aceeași zi (în afara celor independente).');
  if (state.options.birthdayFree) {
    const bd = state.persons.filter(p => birthdayDay(p) != null);
    if (bd.length) notes.push('Zile de naștere libere: ' + bd.map(p => `${p.name} (${birthdayDay(p)})`).join(', ') + '.');
  }
  if (state.options.unavail) {
    const un = state.persons.filter(p => p.unavailFrom != null);
    if (un.length) notes.push('Indisponibilități respectate: ' + un.map(p => `${p.name} (${p.unavailFrom}–${p.unavailTo ?? N})`).join(', ') + '.');
  }
  if (state.options.maxDays) {
    const mx = state.persons.filter(p => p.maxDays != null);
    if (mx.length) {
      const totals = {};
      sectors.forEach(s => Object.values(schedule[s.id]).forEach(pid => totals[pid] = (totals[pid] || 0) + 1));
      notes.push('Limite de zile respectate: ' + mx.map(p => `${p.name} ${totals[p.id] || 0}/${p.maxDays}`).join(', ') + '.');
    }
  }
  if (state.weekdayRules.length) notes.push('Restricțiile pe zile ale săptămânii sunt respectate.');
  if (state.options.minGap) notes.push('Intervalele minime între repetări sunt respectate.');
  return notes;
}

function renderPreview(schedule, sectors) {
  const persons = state.persons.filter(p => p.name.trim());
  const table = $('#preview-table');
  table.innerHTML = '';
  const head = el('tr', {}, el('th', {}, ''));
  persons.forEach(p => head.append(el('th', {}, p.name)));
  table.append(head);
  for (const s of sectors) {
    const tr = el('tr', {}, el('td', { class: 'sector' }, s.name));
    for (const p of persons) {
      const days = Object.entries(schedule[s.id]).filter(([, pid]) => pid === p.id).map(([d]) => +d).sort((a, b) => a - b);
      const td = el('td', {});
      days.forEach(d => td.append(el('span', { class: 'd' }, String(d))));
      tr.append(td);
    }
    table.append(tr);
  }
  $('#preview-title').textContent = `${state.title} – Luna ${MONTHS[state.month]} ${state.year}`;
  $('#preview-wrap').hidden = false;
}

/* ═══════════════ EXPORT WORD ═══════════════ */

async function buildDocx(schedule, sectors) {
  const d = window.docx;
  const persons = state.persons.filter(p => p.name.trim());
  const nCols = persons.length + 1;
  const TOTAL = 16612;                               // A4 landscape − margini (DXA)
  const first = 2000;
  const per = Math.floor((TOTAL - first) / persons.length);
  const widths = [first, ...persons.map(() => per)];

  const cell = (kids, w, opts = {}) => new d.TableCell({
    width: { size: w, type: d.WidthType.DXA },
    verticalAlign: d.VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    shading: opts.shade ? { type: d.ShadingType.CLEAR, fill: 'EDF1F5' } : undefined,
    children: kids,
  });
  const para = (text, bold = false, size = 22) => new d.Paragraph({
    alignment: d.AlignmentType.CENTER,
    children: [new d.TextRun({ text, bold, size })],
  });

  const headRow = new d.TableRow({ tableHeader: true, children: [
    cell([para('', true)], widths[0], { shade: true }),
    ...persons.map((p, i) => cell([para(p.name, true, 24)], widths[i + 1], { shade: true })),
  ]});

  const rows = [headRow];
  for (const s of sectors) {
    const tds = [cell([para(s.name, true, 24)], widths[0], { shade: true })];
    persons.forEach((p, i) => {
      const days = Object.entries(schedule[s.id]).filter(([, pid]) => pid === p.id).map(([dd]) => +dd).sort((a, b) => a - b);
      const paras = [];
      for (let k = 0; k < days.length; k += 3) paras.push(para(days.slice(k, k + 3).join('  '), true));
      if (!paras.length) paras.push(para(''));
      tds.push(cell(paras, widths[i + 1]));
    });
    rows.push(new d.TableRow({ children: tds }));
  }

  const doc = new d.Document({ sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838, orientation: d.PageOrientation.LANDSCAPE },
        margin: { top: 300, bottom: 300, left: 113, right: 113 },
      },
    },
    children: [
      new d.Paragraph({
        alignment: d.AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [new d.TextRun({ text: `${state.title} – Luna ${MONTHS[state.month]} ${state.year}`, bold: true, size: 32 })],
      }),
      new d.Table({ columnWidths: widths, width: { size: TOTAL, type: d.WidthType.DXA }, rows }),
    ],
  }]});

  return d.Packer.toBlob(doc);
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function downloadDoc() {
  if (!lastSchedule) return;
  const blob = await buildDocx(lastSchedule.schedule, lastSchedule.sectors);
  const name = `Tabel_sectoare_-_Luna_${MONTHS[state.month]}_${state.year}.docx`;
  downloadBlob(blob, name);
}

/* ═══════════════ GENERARE ═══════════════ */

async function generate() {
  const report = $('#report');
  report.innerHTML = '';
  $('#preview-wrap').hidden = true;
  $('#download-btn').disabled = true;
  lastSchedule = null;

  if (!state.persons.some(p => p.name.trim())) {
    report.append(el('div', { class: 'error' }, 'Adaugă cel puțin o persoană la pasul 2.')); return;
  }
  const bad = state.sectors.find(s => s.name.trim() && !s.eligible.length);
  if (bad) {
    report.append(el('div', { class: 'error' }, `Sectorul „${bad.name}” nu are nicio persoană bifată — bifează cine îl poate face.`)); return;
  }

  const res = solve();
  if (res.error) {
    report.append(el('div', { class: 'error' },
      `Nu s-a găsit o repartizare validă: în ziua ${res.error.day}, sectorul „${res.error.sector}” nu are nicio persoană disponibilă. ` +
      'Relaxează restricțiile (interval minim, indisponibilități, limite de zile) sau bifează mai multe persoane la acest sector.'));
    return;
  }
  lastSchedule = res;
  const ul = el('ul', { class: 'ok-list' });
  verify(res.schedule, res.sectors).forEach(n => ul.append(el('li', {}, n)));
  report.append(ul);
  renderPreview(res.schedule, res.sectors);
  $('#download-btn').disabled = false;
  await downloadDoc();
}

/* ═══════════════ EVENIMENTE ═══════════════ */

$('#month-select').addEventListener('change', e => { state.month = +e.target.value; saveState(); updateMonthHint(); });
$('#year-input').addEventListener('input', e => { state.year = +e.target.value || state.year; saveState(); updateMonthHint(); });
$('#title-input').addEventListener('input', e => { state.title = e.target.value; saveState(); });
$('#opt-birthday').addEventListener('change', e => { state.options.birthdayFree = e.target.checked; saveState(); });
$('#opt-maxdays').addEventListener('change', e => { state.options.maxDays = e.target.checked; saveState(); });
$('#opt-unavail').addEventListener('change', e => { state.options.unavail = e.target.checked; saveState(); });
$('#opt-mingap').addEventListener('change', e => { state.options.minGap = e.target.checked; saveState(); });
$('#add-person').addEventListener('click', () => {
  state.persons.push({ id: nid(), name: '', birthday: '', unavailFrom: null, unavailTo: null, maxDays: null });
  saveState(); renderPersons(); renderSectors(); renderWeekdayRules();
});
$('#add-sector').addEventListener('click', () => {
  state.sectors.push({ id: nid(), name: '', rotative: false, independent: false, minGap: 3, eligible: [] });
  saveState(); renderSectors(); renderWeekdayRules();
});
$('#add-weekday-rule').addEventListener('click', () => {
  state.weekdayRules.push({ id: nid(), days: [], persons: [], allowed: [] });
  saveState(); renderWeekdayRules();
});
$('#generate-btn').addEventListener('click', generate);
$('#download-btn').addEventListener('click', downloadDoc);

renderMonth(); renderPersons(); renderSectors(); renderOptions(); renderWeekdayRules();
