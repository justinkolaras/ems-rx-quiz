(() => {
  'use strict';

  // ---------- Helpers ----------
  const RX = window.RX;
  const P = window.PATH;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (a) => a[rnd(a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const uniq = (a) => [...new Set(a)];
  const today = () => dayKey(new Date());
  function dayKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  const article = (s) => /^(SSRI|SNRI|NSAID|MAO|H1|H2|HMG|ICS|NMDA|ARB|ARNI|ACE|LMWH)/.test(s) ? 'an' : (/^U/i.test(s) ? 'a' : (/^[aeiou]/i.test(s) ? 'an' : 'a'));
  const lc = (s) => /^[A-Z][a-z]/.test(s) && !/^Parkinson/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s;

  // Take `n` items, preferring up to `nPref` from `pref`, then filling from `rest`.
  function takeMix(pref, rest, n, nPref) {
    const out = shuffle(pref).slice(0, nPref);
    const used = new Set(out);
    for (const x of shuffle(pref.concat(rest))) { if (out.length >= n) break; if (!used.has(x)) { out.push(x); used.add(x); } }
    return out;
  }

  // ---------- Normalize drug data ----------
  const CL = RX.CLASSES;
  for (const k in CL) { CL[k].key = k; CL[k].cf = CL[k].cf || []; }
  for (const k in CL) for (const o of CL[k].cf) if (CL[o] && !CL[o].cf.includes(k)) CL[o].cf.push(k);
  const COND = RX.CONDS;
  const condLabel = (k) => COND[k] ? COND[k][0] : k;
  const condCl = (k) => COND[k] ? COND[k][1] : k;
  const condSys = (k) => COND[k] ? COND[k][2] : '';
  const GROUPS = RX.GROUPS;
  const STEROID_USES = 'Inflammation of many kinds — asthma/COPD flares, severe allergic reactions, autoimmune disease, gout flares, transplant, cerebral edema';

  const DRUGS = RX.DRUGS.map(([g, b, c, conds, x = {}]) => {
    const cls = CL[c];
    if (!cls) console.warn('Unknown class', c, g);
    const brands = b ? b.split(/,\s*(?![^()]*\))/).map((s) => s.trim()).filter(Boolean) : [];
    const cleanBrands = uniq(brands.map((s) => s.replace(/\s*\(.*?\)\s*/g, '').trim()).filter((s) => s && s.toLowerCase() !== g.toLowerCase() && !/^PTU$/.test(s)));
    return {
      id: g.toLowerCase().replace(/[^a-z0-9]+/g, '-'), g, name: cap(g), short: cap(g.replace(/\s*\(.*\)$/, '')), b, brands, cleanBrands, c, cls, sys: cls.s,
      conds, ok: uniq([...(x.ok || []), ...(cls.ok || [])]), nd: cls.nd || [], grp: x.g || cls.g, p: x.p || cls.p, noCond: !!x.noCond,
    };
  });
  const DRUG = Object.fromEntries(DRUGS.map((d) => [d.id, d]));
  const byG = Object.fromEntries(DRUGS.map((d) => [d.g.toLowerCase(), d]));
  const byClass = {};
  for (const d of DRUGS) (byClass[d.c] = byClass[d.c] || []).push(d);
  const CLASS_KEYS = Object.keys(CL).filter((k) => byClass[k]);
  const groupDrugs = {};
  for (const d of DRUGS) d.grp.forEach((g, i) => { if (i < 2) (groupDrugs[g] = groupDrugs[g] || []).push(d); });
  const groupSys = {};
  for (const k of CLASS_KEYS) for (const g of CL[k].g) if (!groupSys[g]) groupSys[g] = CL[k].s;
  for (const d of DRUGS) for (const g of d.grp) if (!groupSys[g]) groupSys[g] = d.sys;
  const GROUP_NAMES = Object.keys(GROUPS).filter((g) => DRUGS.some((d) => d.grp.includes(g)));
  const groupCondSet = {};
  for (const g of GROUP_NAMES) groupCondSet[g] = new Set((groupDrugs[g] || []).flatMap((d) => d.conds));
  const drugLabel = (d) => !d.cleanBrands.length ? d.name : (d.name.includes('(') ? `${d.name} — ${d.cleanBrands[0]}` : `${d.name} (${d.cleanBrands[0]})`);

  // ---------- Learning path ----------
  const CATS = P.CATS;
  const catName = (c) => CATS[c].n;
  const LEVELS = P.LEVELS;
  const LESSONS = [];
  const LESSON = {};
  const PL = {}; // drug id -> { info, lesson, cats, cl }
  for (const lv of LEVELS) {
    lv.lessons.forEach((ls, i) => {
      Object.assign(ls, { level: lv.n, idx: i, num: `${lv.n}.${i + 1}`, drugs: ls.drugs || [], qs: ls.qs || [], sfx: ls.sfx || [], concepts: ls.concepts || [], takeaways: ls.takeaways || [] });
      ls.D = [];
      for (const x of ls.drugs) {
        const d = byG[x.g.toLowerCase()];
        if (!d) { console.warn('Lesson drug missing', x.g); continue; }
        const cats = x.cats || [ls.cat];
        PL[d.id] = { info: x, lesson: ls, cats, cl: new Set([...cats.map((c) => CATS[c].cl), ...(x.nd || [])]) };
        ls.D.push(d);
      }
      LESSONS.push(ls); LESSON[ls.id] = ls;
    });
  }
  const CUR = LESSONS.flatMap((l) => l.D);
  const COMBO_OK = RX.COMBOS.filter((c) => !(P.COMBO_SKIP || []).includes(c.id));
  const PEARL_OK = (P.PEARL_IDS || []).map((id) => RX.PEARLS.find((p) => p.id === id)).filter(Boolean);

  const TOPICS = [
    { id: 'cls', name: 'Drug → Class', desc: 'e.g. lisinopril → ACE inhibitor' },
    { id: 'grp', name: 'Drug → Category', desc: 'e.g. lisinopril → antihypertensive' },
    { id: 'c2d', name: 'Class → Drug', desc: 'Which of these is a beta blocker?' },
    { id: 'cond', name: 'Drug → Pt history', desc: 'What does this med tell you?' },
    { id: 'mlist', name: 'Med list → History', desc: 'Groups of meds → likely PMH' },
    { id: 'pearl', name: 'EMS field scenarios', desc: 'Toxicity, contraindications, red flags' },
    { id: 'brand', name: 'Brand ↔ Generic', desc: 'Eliquis = apixaban' },
    { id: 'sfx', name: 'Suffixes', desc: '-pril, -olol, -statin…' },
  ];
  const TOPIC = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
  const BTYPE = { use: 'What kind of med?', which: 'Spot the med', b2g: 'Brand names', g2b: 'Brand names', cond: 'Patient history', sfx: 'Name clues', q: 'On the call', combo: 'Med list', pearl: 'Field scenario' };

  // ---------- Advanced card catalog (all drugs, medic-level) ----------
  const ML_SKIP = new Set(['edema', 'hypokalemia', 'infection']);
  const ML_CONDS = Object.keys(COND).filter((k) => !ML_SKIP.has(k) && new Set(DRUGS.filter((d) => d.conds.includes(k)).map((d) => d.c)).size >= 2);
  const CARDS = [];
  for (const d of DRUGS) {
    CARDS.push({ key: 'cls:' + d.id, topic: 'cls', sys: d.sys });
    CARDS.push({ key: 'grp:' + d.id, topic: 'grp', sys: d.sys });
    if (!d.noCond && d.conds.length) CARDS.push({ key: 'cond:' + d.id, topic: 'cond', sys: d.sys });
    if (d.cleanBrands.length) {
      CARDS.push({ key: 'b2g:' + d.id, topic: 'brand', sys: d.sys });
      CARDS.push({ key: 'g2b:' + d.id, topic: 'brand', sys: d.sys });
    }
  }
  for (const k of CLASS_KEYS) {
    CARDS.push({ key: 'c2d:' + k, topic: 'c2d', sys: CL[k].s });
    if (CL[k].x) CARDS.push({ key: 'sfx:' + k, topic: 'sfx', sys: CL[k].s });
  }
  for (const g of GROUP_NAMES) CARDS.push({ key: 'g2d:' + g, topic: 'c2d', sys: groupSys[g] });
  for (const k of ML_CONDS) CARDS.push({ key: 'ml:' + k, topic: 'mlist', sys: condSys(k) });
  for (const c of RX.COMBOS) CARDS.push({ key: 'combo:' + c.id, topic: 'mlist', sys: c.s });
  for (const p of RX.PEARLS) CARDS.push({ key: 'pearl:' + p.id, topic: 'pearl', sys: p.s });
  const CARD = Object.fromEntries(CARDS.map((c) => [c.key, c]));

  // Beginner (path) cards are created on demand.
  function cardFor(key) {
    if (CARD[key]) return CARD[key];
    const [, t, a] = key.split('|');
    let sys = '';
    if (DRUG[a]) sys = DRUG[a].sys;
    else if (t === 'combo') sys = (RX.COMBOS.find((c) => c.id === a) || {}).s || '';
    else if (t === 'pearl') sys = (RX.PEARLS.find((p) => p.id === a) || {}).s || '';
    else if (LESSON[a] && LESSON[a].D[0]) sys = LESSON[a].D[0].sys;
    return (CARD[key] = { key, topic: 'learn', t, sys });
  }

  // ---------- Storage ----------
  const KEY = 'rxrapid.v1';
  const DEFAULT_SETTINGS = { topics: TOPICS.map((t) => t.id), systems: Object.keys(RX.SYSTEMS), weakOnly: false, goal: 50, autoNext: false, unlockAll: false };
  function freshState() {
    return { v: 1, created: Date.now(), cards: {}, stats: { answered: 0, correct: 0, streak: 0, best: 0, byTopic: {}, bySys: {}, byDrug: {}, days: {} }, path: { lessons: {}, tests: {} }, settings: { ...DEFAULT_SETTINGS }, savedAt: 0 };
  }
  function normalize(s) {
    const f = freshState();
    if (!s || typeof s !== 'object') return f;
    s.cards = s.cards && typeof s.cards === 'object' ? s.cards : {};
    s.stats = Object.assign(f.stats, s.stats || {});
    s.path = Object.assign(f.path, s.path || {});
    s.settings = Object.assign({ ...DEFAULT_SETTINGS }, s.settings || {});
    s.settings.topics = (s.settings.topics || []).filter((t) => TOPIC[t]);
    s.settings.systems = (s.settings.systems || []).filter((t) => RX.SYSTEMS[t]);
    s.v = 1;
    return s;
  }
  let storageOk = true;
  function load() {
    for (const k of [KEY, KEY + '.bak']) {
      try { const raw = localStorage.getItem(k); if (raw) return normalize(JSON.parse(raw)); } catch (e) { /* try next */ }
    }
    return freshState();
  }
  let S = load();
  function save() {
    S.savedAt = Date.now();
    try {
      const raw = JSON.stringify(S);
      localStorage.setItem(KEY, raw);
      if (S.stats.answered % 20 === 0) localStorage.setItem(KEY + '.bak', raw);
      storageOk = true;
    } catch (e) { storageOk = false; }
  }
  let persistAsked = false;
  function askPersist() {
    if (persistAsked) return; persistAsked = true;
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { /* ignore */ }
  }

  // ---------- Path progress ----------
  const lessonRec = (id) => S.path.lessons[id];
  const lessonDone = (id) => !!(S.path.lessons[id] && S.path.lessons[id].done);
  const testPassed = (n) => !!(S.path.tests[n] && S.path.tests[n].passed);
  const levelUnlocked = (n) => S.settings.unlockAll || n === 1 || testPassed(n - 1);
  const lessonUnlocked = (ls) => S.settings.unlockAll || (levelUnlocked(ls.level) && (ls.idx === 0 || lessonDone(LEVELS[ls.level - 1].lessons[ls.idx - 1].id)));
  const testUnlocked = (lv) => S.settings.unlockAll || (levelUnlocked(lv.n) && lv.lessons.every((l) => lessonDone(l.id)));
  const LESSON_PASS = 0.75, TEST_PASS = 0.8;
  function nextStep() {
    for (const lv of LEVELS) {
      if (testPassed(lv.n)) continue;
      const ls = lv.lessons.find((l) => !lessonDone(l.id));
      if (ls) return { type: 'lesson', ls, lv };
      return { type: 'test', lv };
    }
    return { type: 'done' };
  }

  // ---------- Scheduling (Leitner-style spaced repetition) ----------
  const MIN = 60e3, DAY = 864e5;
  const INTERVAL = [0, 10 * MIN, DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];
  const recent = [];

  function isDue(c, now) { return c.b === 0 ? S.stats.answered >= (c.dueN || 0) : now >= (c.due || 0); }
  function advPool() {
    const st = S.settings;
    const ts = new Set(st.topics), ss = new Set(st.systems);
    let list = CARDS.filter((c) => ts.has(c.topic) && ss.has(c.sys));
    if (st.weakOnly) list = list.filter((c) => { const r = S.cards[c.key]; return r && r.n > 0 && (r.b <= 1 || r.c / r.n < 0.7); });
    return list;
  }
  function reviewPool() {
    const keys = [];
    for (const l of LESSONS) if (lessonDone(l.id)) keys.push(...lessonKeys(l));
    return uniq(keys).map(cardFor);
  }
  function nextCard(list) {
    if (!list.length) return null;
    const now = Date.now();
    const notRecent = list.filter((c) => !recent.includes(c.key));
    const L = notRecent.length ? notRecent : list;
    const missed = [], due = [], fresh = [];
    for (const c of L) {
      const r = S.cards[c.key];
      if (!r) fresh.push(c);
      else if (isDue(r, now)) (r.b === 0 ? missed : due).push(c);
    }
    if (missed.length) return pick(missed);
    if (due.length && (!fresh.length || Math.random() < 0.6)) {
      due.sort((a, b) => (S.cards[a.key].due || 0) - (S.cards[b.key].due || 0));
      return pick(due.slice(0, 6));
    }
    if (fresh.length) {
      const topicOf = (c) => c.t || c.topic;
      const t = pick(uniq(fresh.map(topicOf)));
      return pick(fresh.filter((c) => topicOf(c) === t));
    }
    const seen = L.slice().sort((a, b) => {
      const ra = S.cards[a.key], rb = S.cards[b.key];
      return (ra.b - rb.b) || ((ra.due || 0) - (rb.due || 0));
    });
    return pick(seen.slice(0, 12));
  }
  function dueCount(list) { const now = Date.now(); return list.filter((c) => { const r = S.cards[c.key]; return r && isDue(r, now); }).length; }

  // ---------- Advanced question builders ----------
  function drugCard(d) {
    const uses = d.conds.length ? d.conds.map(condLabel).join(', ') : STEROID_USES;
    const also = d.ok.filter((k) => COND[k] && !d.conds.includes(k)).map(condLabel);
    return `<div class="dcard">
      <div class="dname">${esc(d.name)} <span class="bn">${esc(d.b)}</span></div>
      <div class="drow"><span class="lbl">Class</span><span>${esc(d.cls.n)}${d.cls.x ? ` <span class="sfx">${esc(d.cls.x)}</span>` : ''}</span></div>
      <div class="drow"><span class="lbl">Type</span><span>${d.grp.map(esc).join(' · ')}</span></div>
      <div class="drow"><span class="lbl">Used for</span><span>${esc(uses)}${also.length ? `<br><small>Sometimes also: ${esc(also.join(', '))}</small>` : ''}</span></div>
      <div class="drow"><span class="lbl">How</span><span>${esc(d.cls.m)}</span></div>
      <div class="pearl"><b>🚑 EMS:</b> ${esc(d.p)}</div>
    </div>`;
  }
  const othersList = (items) => items.length ? `<ul class="others">${items.map(([a, b]) => `<li><b>${esc(a)}</b> — ${esc(b)}</li>`).join('')}</ul>` : '';
  function q(o) { o.options = shuffle(o.options); return o; }

  function genCls(d) {
    const bad = new Set([d.c, ...d.cls.cf]);
    const cands = CLASS_KEYS.filter((k) => !bad.has(k));
    const same = cands.filter((k) => CL[k].s === d.sys), other = cands.filter((k) => CL[k].s !== d.sys);
    const ds = takeMix(same, other, 3, 2);
    const mates = byClass[d.c].filter((x) => x !== d).slice(0, 6).map((x) => x.name);
    return q({
      prompt: `<b>${esc(d.name)}</b> belongs to which drug class?`,
      sub: d.b ? `Brand: ${esc(d.b)}` : '',
      options: [{ t: d.cls.n, ok: true }, ...ds.map((k) => ({ t: CL[k].n }))],
      explain: drugCard(d) + (mates.length ? `<div class="also">Same class: ${esc(mates.join(', '))}</div>` : ''),
      drugs: [d.id],
    });
  }
  function genGrp(d) {
    const answer = d.grp[0];
    const badCl = new Set(d.grp.map((g) => GROUPS[g]));
    const cands = GROUP_NAMES.filter((g) => !badCl.has(GROUPS[g]));
    const same = cands.filter((g) => groupSys[g] === d.sys), other = cands.filter((g) => groupSys[g] !== d.sys);
    const ds = takeMix(same, other, 3, 1);
    return q({
      prompt: `What type of medication is <b>${esc(d.name)}</b>?`,
      sub: d.b ? `Brand: ${esc(d.b)}` : '',
      options: [{ t: answer, ok: true }, ...ds.map((g) => ({ t: g }))],
      explain: (d.grp.length > 1 ? `<p>Best answer: <b>${esc(answer)}</b>. It also counts as: ${esc(d.grp.slice(1).join(', '))}.</p>` : '') + drugCard(d),
      drugs: [d.id],
    });
  }
  function genC2D(k) {
    const cls = CL[k];
    const right = pick(byClass[k]);
    const bad = new Set([k, ...cls.cf]);
    const cands = DRUGS.filter((d) => !bad.has(d.c));
    const same = cands.filter((d) => d.sys === cls.s), other = cands.filter((d) => d.sys !== cls.s);
    const ds = takeMix(same, other, 3, 2);
    return q({
      prompt: `Which of these is ${article(cls.n)} <b>${esc(lc(cls.n))}</b>?`,
      sub: cls.x ? 'Hint: watch the suffix.' : '',
      options: [{ t: drugLabel(right), ok: true }, ...ds.map((d) => ({ t: drugLabel(d) }))],
      explain: drugCard(right) + othersList(ds.map((d) => [d.name, d.cls.n])),
      drugs: [right.id, ...ds.map((d) => d.id)],
    });
  }
  function genG2D(g) {
    const right = pick(groupDrugs[g]);
    const cl = GROUPS[g], conds = groupCondSet[g];
    const cands = DRUGS.filter((d) => !d.grp.some((x) => GROUPS[x] === cl) && ![...d.conds, ...d.ok].some((c) => conds.has(c)));
    const same = cands.filter((d) => d.sys === right.sys), other = cands.filter((d) => d.sys !== right.sys);
    const ds = takeMix(same, other, 3, 1);
    return q({
      prompt: `Which of these is ${article(g)} <b>${esc(lc(g))}</b>?`,
      sub: '',
      options: [{ t: drugLabel(right), ok: true }, ...ds.map((d) => ({ t: drugLabel(d) }))],
      explain: drugCard(right) + othersList(ds.map((d) => [d.name, d.grp[0] + ' (' + d.cls.n + ')'])),
      drugs: [right.id, ...ds.map((d) => d.id)],
    });
  }
  function condDistractors(answer, union, n) {
    const badCl = new Set([condCl(answer)]);
    const cands = Object.keys(COND).filter((k) => !union.has(k) && !badCl.has(condCl(k)));
    const sys = condSys(answer);
    const same = cands.filter((k) => condSys(k) === sys), other = cands.filter((k) => condSys(k) !== sys);
    const out = [];
    for (const k of takeMix(same, other, 12, 1)) { if (out.length >= n) break; if (!out.some((o) => condCl(o) === condCl(k))) out.push(k); }
    return out;
  }
  // beginner = learning path: ask only the main use, and use the plain label
  function genCond(d, beginner = false) {
    const card = beginner ? drugCardB : drugCard;
    const answer = beginner ? d.conds[0] : pick([d.conds[0], ...d.conds]);
    const union = new Set([...d.conds, ...d.ok, ...d.nd]);
    for (const c of d.conds) for (const k in COND) if (condCl(k) === condCl(c)) union.add(k);
    const ds = condDistractors(answer, union, 3);
    return q({
      prompt: `Your patient's med list includes <b>${esc(beginner ? dLabel(d, Math.random() < 0.5) : drugLabel(d))}</b>. Which history does this most likely point to?`,
      sub: '',
      options: [{ t: condLabel(answer), ok: true }, ...ds.map((k) => ({ t: condLabel(k) }))],
      explain: (d.conds.length > 1 ? `<p>${esc(d.short)} is used for several things: <b>${esc(d.conds.map(condLabel).join('; '))}</b>. Only one of those was a choice.</p>` : '') + card(d),
      drugs: [d.id],
    });
  }
  function genMl(k) {
    const drugs = DRUGS.filter((d) => d.conds.includes(k));
    const classes = uniq(drugs.map((d) => d.c));
    let best = null;
    for (let i = 0; i < 25; i++) {
      const n = Math.min(classes.length, classes.length >= 3 && Math.random() < 0.55 ? 3 : 2);
      const chosen = shuffle(classes).slice(0, n).map((c) => pick(drugs.filter((d) => d.c === c)));
      const sets = chosen.map((d) => new Set([...d.conds, ...d.ok]));
      const score = [...sets[0]].filter((x) => sets.every((s) => s.has(x))).length;
      if (!best || score < best.score) best = { chosen, score };
      if (score === 1) break;
    }
    const chosen = shuffle(best.chosen);
    const union = new Set(chosen.flatMap((d) => [...d.conds, ...d.ok, ...d.nd]));
    const ds = condDistractors(k, union, 3);
    return q({
      prompt: 'Which history do these home meds most strongly suggest?',
      meds: chosen.map(drugLabel),
      sub: '',
      options: [{ t: condLabel(k), ok: true }, ...ds.map((x) => ({ t: condLabel(x) }))],
      explain: `<p>The common thread is <b>${esc(condLabel(k))}</b>.</p>` + chosen.map((d) => drugCard(d)).join(''),
      drugs: chosen.map((d) => d.id),
    });
  }
  function findDrugs(text) {
    const t = text.toLowerCase();
    return DRUGS.filter((d) => t.startsWith(d.g.toLowerCase().replace(/\s*\(.*\)$/, '')))
      .sort((a, b) => b.g.length - a.g.length).slice(0, 1);
  }
  function genCombo(c) {
    return q({
      prompt: 'Which history do these home meds most strongly suggest?',
      meds: c.meds, sub: '',
      options: [{ t: c.a, ok: true }, ...c.d.map((t) => ({ t }))],
      explain: `<p>${esc(c.e)}</p>`,
      drugs: uniq(c.meds.flatMap(findDrugs)).map((d) => d.id),
    });
  }
  function genPearl(p) {
    return q({ prompt: esc(p.q), sub: '', options: [{ t: p.a, ok: true }, ...p.d.map((t) => ({ t }))], explain: `<p>${esc(p.e)}</p>`, drugs: [] });
  }
  function genSfx(k) {
    const cls = CL[k];
    const bad = new Set([k, ...cls.cf]);
    const cands = CLASS_KEYS.filter((x) => CL[x].x && !bad.has(x));
    const same = cands.filter((x) => CL[x].s === cls.s), other = cands.filter((x) => CL[x].s !== cls.s);
    const ds = takeMix(same, other, 3, 1);
    const ex = byClass[k].slice(0, 5).map((d) => d.name).join(', ');
    const explain = `<p><b>${esc(cls.x)}</b> → <b>${esc(cls.n)}</b>. Examples: ${esc(ex)}.</p><p>${esc(cls.m)}</p><div class="pearl"><b>🚑 EMS:</b> ${esc(cls.p)}</div>`;
    if (Math.random() < 0.6) {
      return q({ prompt: `Drug names ending in <b>${esc(cls.x)}</b> usually belong to which class?`, sub: '', options: [{ t: cls.n, ok: true }, ...ds.map((x) => ({ t: CL[x].n }))], explain, drugs: [] });
    }
    return q({ prompt: `Which name pattern usually marks ${article(cls.n)} <b>${esc(lc(cls.n))}</b>?`, sub: '', options: [{ t: cls.x, ok: true }, ...ds.map((x) => ({ t: CL[x].x }))], explain, drugs: [] });
  }
  function brandDistractors(d) {
    const cands = DRUGS.filter((x) => x !== d && x.cleanBrands.length && x.g.split('/')[0] !== d.g.split('/')[0]);
    const sameClass = cands.filter((x) => x.c === d.c);
    const sameSys = cands.filter((x) => x.c !== d.c && x.sys === d.sys);
    const other = cands.filter((x) => x.sys !== d.sys);
    return takeMix(shuffle(sameClass).slice(0, 2).concat(shuffle(sameSys)), other, 3, 3);
  }
  function genB2G(d) {
    const brand = pick(d.cleanBrands);
    const ds = brandDistractors(d);
    return q({
      prompt: `<b>${esc(brand)}</b> is the brand name of which generic drug?`, sub: '',
      options: [{ t: d.name, ok: true }, ...ds.map((x) => ({ t: x.name }))],
      explain: drugCard(d) + othersList(ds.map((x) => [x.name, x.b])), drugs: [d.id],
    });
  }
  function genG2B(d) {
    const ds = brandDistractors(d);
    return q({
      prompt: `Which is a brand name for <b>${esc(d.name)}</b>?`, sub: '',
      options: [{ t: pick(d.cleanBrands), ok: true }, ...ds.map((x) => ({ t: pick(x.cleanBrands) }))],
      explain: drugCard(d) + othersList(ds.map((x) => [x.b, x.name])), drugs: [d.id],
    });
  }

  // ---------- Beginner (learning path) question builders ----------
  function knownDrugs() {
    const set = new Set();
    for (const l of LESSONS) if (lessonDone(l.id)) l.D.forEach((d) => set.add(d));
    if (sess && sess.lessons) sess.lessons.forEach((l) => l.D.forEach((d) => set.add(d)));
    return set;
  }
  const dLabel = (d, brandFirst) => {
    const b = d.cleanBrands[0];
    if (!b) return d.short;
    return brandFirst ? `${b} (${d.short.toLowerCase()})` : `${d.short} (${b})`;
  };
  function drugCardB(d) {
    const pl = PL[d.id];
    if (!pl) return drugCard(d);
    const x = pl.info, ls = pl.lesson;
    const uses = d.conds.length ? d.conds.map(condLabel).join(', ') : STEROID_USES;
    return `<div class="dcard">
      <div class="dname">${esc(d.short)} <span class="bn">${esc(d.b)}</span></div>
      ${x.say ? `<div class="say">🗣️ ${esc(x.say)}</div>` : ''}
      <div class="drow"><span class="lbl">Type</span><span>${pl.cats.map((c) => esc(catName(c))).join(' · ')}</span></div>
      <div class="drow"><span class="lbl">What</span><span>${esc(x.what)}</span></div>
      <div class="drow"><span class="lbl">For</span><span>${esc(uses)}</span></div>
      ${x.remember ? `<div class="drow"><span class="lbl">Remember</span><span>${esc(x.remember)}</span></div>` : ''}
      ${x.tip ? `<div class="pearl"><b>🚑 On a call:</b> ${esc(x.tip)}</div>` : ''}
      <div class="from">From lesson ${esc(ls.num)}: ${esc(ls.title)}</div>
    </div>`;
  }
  function catDistractors(badCl, known, n = 3) {
    const cands = Object.keys(CATS).filter((c) => !badCl.has(CATS[c].cl));
    const kc = new Set([...known].flatMap((d) => (PL[d.id] ? PL[d.id].cats : [])));
    const out = [], usedCl = new Set();
    for (const c of [...shuffle(cands.filter((c) => kc.has(c))).slice(0, 2), ...shuffle(cands)]) {
      if (out.length >= n) break;
      if (!out.includes(c) && !usedCl.has(CATS[c].cl)) { out.push(c); usedCl.add(CATS[c].cl); }
    }
    return out;
  }
  // Prefer drugs from the same lesson, then ones already learned, then the rest of the course.
  function pathDistractors(d, known, pred, nSame = 2) {
    const same = PL[d.id].lesson.D.filter((x) => x !== d && pred(x));
    const kn = [...known].filter((x) => x !== d && !same.includes(x) && pred(x));
    const rest = CUR.filter((x) => x !== d && !same.includes(x) && !kn.includes(x) && pred(x));
    return uniq([...shuffle(same).slice(0, nSame), ...shuffle(kn), ...shuffle(rest)]).slice(0, 3);
  }
  const typeLine = (x) => (PL[x.id] ? catName(PL[x.id].cats[0]) : x.grp[0]);

  function bUse(d, known) {
    const pl = PL[d.id];
    const ds = catDistractors(pl.cl, known);
    return q({
      prompt: `What kind of medication is <b>${esc(dLabel(d, Math.random() < 0.5))}</b>?`, sub: '',
      options: [{ t: catName(pl.cats[0]), ok: true }, ...ds.map((c) => ({ t: catName(c) }))],
      explain: (pl.cats.length > 1 ? `<p>It also counts as: ${esc(pl.cats.slice(1).map(catName).join(', '))}.</p>` : '') + drugCardB(d),
      drugs: [d.id],
    });
  }
  function bWhich(d, known) {
    const cat = PL[d.id].cats[0], cl = CATS[cat].cl;
    const pred = (x) => !PL[x.id].cl.has(cl);
    const kn = [...known].filter((x) => x !== d && pred(x));
    const rest = CUR.filter((x) => x !== d && !kn.includes(x) && pred(x));
    const ds = takeMix(kn, rest, 3, 2);
    return q({
      prompt: `Which of these is ${article(catName(cat))} <b>${esc(lc(catName(cat)))}</b>?`, sub: '',
      options: [{ t: dLabel(d, false), ok: true }, ...ds.map((x) => ({ t: dLabel(x, false) }))],
      explain: drugCardB(d) + othersList(ds.map((x) => [dLabel(x, false), typeLine(x)])),
      drugs: [d.id, ...ds.map((x) => x.id)],
    });
  }
  const notSimilar = (d) => (x) => x.cleanBrands.length && !x.short.toLowerCase().includes(d.short.toLowerCase()) && !d.short.toLowerCase().includes(x.short.toLowerCase());
  function bB2G(d, known) {
    const brand = d.cleanBrands[0];
    const ds = pathDistractors(d, known, notSimilar(d));
    return q({
      prompt: `<b>${esc(brand)}</b> is the brand name for which drug?`, sub: '',
      options: [{ t: d.short, ok: true }, ...ds.map((x) => ({ t: x.short }))],
      explain: drugCardB(d) + othersList(ds.map((x) => [x.short, `${x.cleanBrands[0]} — ${typeLine(x)}`])),
      drugs: [d.id],
    });
  }
  function bG2B(d, known) {
    const ds = pathDistractors(d, known, (x) => notSimilar(d)(x) && x.cleanBrands[0] !== d.cleanBrands[0]);
    return q({
      prompt: `What's the brand name for <b>${esc(d.short.toLowerCase())}</b>?`, sub: '',
      options: [{ t: d.cleanBrands[0], ok: true }, ...ds.map((x) => ({ t: x.cleanBrands[0] }))],
      explain: drugCardB(d) + othersList(ds.map((x) => [x.cleanBrands[0], `${x.short.toLowerCase()} — ${typeLine(x)}`])),
      drugs: [d.id],
    });
  }
  function bSfx(ls, i, known) {
    const s = ls.sfx[i];
    const ds = catDistractors(new Set([CATS[s.cat].cl]), known);
    const tail = s.x.replace(/^-/, '');
    const ex = CUR.filter((d) => d.short.toLowerCase().endsWith(tail)).map((d) => d.short.toLowerCase()).slice(0, 4);
    return q({
      prompt: `A drug name ending in <b>${esc(s.x)}</b> is most likely a:`, sub: '',
      options: [{ t: catName(s.cat), ok: true }, ...ds.map((c) => ({ t: catName(c) }))],
      explain: `<p><b>${esc(s.x)}</b> → <b>${esc(catName(s.cat))}</b>.${ex.length ? ` Examples: ${esc(ex.join(', '))}.` : ''}</p><div class="from">From lesson ${esc(ls.num)}: ${esc(ls.title)}</div>`,
      drugs: [],
    });
  }
  function bHand(ls, i) {
    const h = ls.qs[i];
    return q({ prompt: esc(h.q), sub: '', options: [{ t: h.a, ok: true }, ...h.d.map((t) => ({ t }))], explain: `<p>${esc(h.e)}</p><div class="from">From lesson ${esc(ls.num)}: ${esc(ls.title)}</div>`, drugs: ls.D.map((d) => d.id) });
  }
  function buildB(key) {
    const [, t, a, b] = key.split('|');
    const known = knownDrugs();
    switch (t) {
      case 'use': return bUse(DRUG[a], known);
      case 'which': return bWhich(DRUG[a], known);
      case 'b2g': return bB2G(DRUG[a], known);
      case 'g2b': return bG2B(DRUG[a], known);
      case 'cond': return genCond(DRUG[a], true);
      case 'sfx': return bSfx(LESSON[a], +b, known);
      case 'q': return bHand(LESSON[a], +b);
      case 'combo': return genCombo(RX.COMBOS.find((c) => c.id === a));
      case 'pearl': return genPearl(RX.PEARLS.find((p) => p.id === a));
    }
    return null;
  }
  function build(card) {
    if (card.key.startsWith('B|')) return buildB(card.key);
    const [type, ...rest] = card.key.split(':');
    const id = rest.join(':');
    switch (type) {
      case 'cls': return genCls(DRUG[id]);
      case 'grp': return genGrp(DRUG[id]);
      case 'c2d': return genC2D(id);
      case 'g2d': return genG2D(id);
      case 'cond': return genCond(DRUG[id]);
      case 'ml': return genMl(id);
      case 'combo': return genCombo(RX.COMBOS.find((c) => c.id === id));
      case 'pearl': return genPearl(RX.PEARLS.find((p) => p.id === id));
      case 'sfx': return genSfx(id);
      case 'b2g': return genB2G(DRUG[id]);
      case 'g2b': return genG2B(DRUG[id]);
    }
    return null;
  }

  // ---------- Quiz composition ----------
  function drugKeys(d) {
    const k = ['B|use|' + d.id, 'B|which|' + d.id];
    if (d.cleanBrands.length) k.push('B|b2g|' + d.id, 'B|g2b|' + d.id);
    if (!d.noCond && d.conds.length) k.push('B|cond|' + d.id);
    return k;
  }
  function lessonKeys(ls) {
    if (ls.pool === 'combos') return COMBO_OK.map((c) => 'B|combo|' + c.id);
    if (ls.pool === 'pearls') return PEARL_OK.map((p) => 'B|pearl|' + p.id);
    return [...ls.D.flatMap(drugKeys), ...ls.qs.map((_, i) => `B|q|${ls.id}|${i}`), ...ls.sfx.map((_, i) => `B|sfx|${ls.id}|${i}`)];
  }
  const subjectOf = (k) => k.split('|')[2];
  function lessonQuiz(ls) {
    if (ls.pool) return shuffle(lessonKeys(ls)).slice(0, 8);
    const hw = ls.qs.map((_, i) => `B|q|${ls.id}|${i}`);
    // One question per med. "What kind of med?" is asked once per category so the quiz
    // doesn't repeat the same answer; the other meds get brand/history/spot-it questions.
    const first = [], usedCat = new Set();
    for (const d of shuffle(ls.D)) {
      const cat = PL[d.id].cats[0];
      if (!usedCat.has(cat)) { usedCat.add(cat); first.push('B|use|' + d.id); }
      else first.push(pick(drugKeys(d).filter((k) => !k.startsWith('B|use|'))));
    }
    const extra = shuffle([...ls.D.flatMap((d) => drugKeys(d).filter((k) => !k.startsWith('B|use|'))), ...ls.sfx.map((_, i) => `B|sfx|${ls.id}|${i}`)])
      .filter((k) => !first.includes(k));
    const target = Math.min(12, Math.max(8, first.length + hw.length + 2));
    const nExtra = Math.max(0, target - first.length - hw.length);
    const picked = [], seen = new Set();
    for (const k of extra) { if (picked.length >= nExtra) break; if (!seen.has(subjectOf(k))) { picked.push(k); seen.add(subjectOf(k)); } }
    for (const k of extra) { if (picked.length >= nExtra) break; if (!picked.includes(k)) picked.push(k); }
    return [...first, ...shuffle(picked), ...shuffle(hw)];
  }
  function levelTest(lv) {
    const all = shuffle(lv.lessons.flatMap(lessonKeys));
    const out = [], seen = new Set();
    for (const k of all) { if (out.length >= 15) break; if (!seen.has(subjectOf(k))) { out.push(k); seen.add(subjectOf(k)); } }
    for (const k of all) { if (out.length >= 15) break; if (!out.includes(k)) out.push(k); }
    return shuffle(out);
  }

  // ---------- Views ----------
  const VIEWS = ['home', 'lesson', 'quiz', 'result'];
  let view = 'home';
  function showView(name) {
    view = name;
    for (const v of VIEWS) $('#view-' + v).hidden = v !== name;
    $('#quizBar').hidden = name !== 'quiz';
    window.scrollTo(0, 0);
  }

  // ---------- Home / learning path ----------
  const lessonScore = (id) => (lessonRec(id) ? Math.round(lessonRec(id).best * 100) : null);
  function renderHome() {
    const step = nextStep();
    const done = LESSONS.filter((l) => lessonDone(l.id)).length;
    const rp = reviewPool();
    const due = dueCount(rp);
    let hero;
    if (step.type === 'lesson') {
      const fresh = done === 0 && !Object.keys(S.path.lessons).length;
      hero = `<div class="hero-k">Level ${step.lv.n} · ${esc(step.lv.title)}</div>
        <h1>${step.ls.emoji} ${esc(step.ls.title)}</h1>
        <p>${fresh ? 'Start here — no experience needed. Read a quick lesson (about 3 minutes), then answer a few questions about it.' : `Next up: lesson ${step.ls.num}. Read it, then pass the quiz (75%) to move on.`}</p>
        <button class="primary big" data-go="lesson:${step.ls.id}">${fresh ? 'Start learning' : 'Start lesson ' + step.ls.num} ▶</button>`;
    } else if (step.type === 'test') {
      const nxt = LEVELS[step.lv.n];
      hero = `<div class="hero-k">Level ${step.lv.n} · ${esc(step.lv.title)}</div>
        <h1>🏁 Level ${step.lv.n} test</h1>
        <p>You finished every lesson in this level. 15 questions — score 80% to ${nxt ? `unlock Level ${nxt.n}` : 'finish the course'}.</p>
        <button class="primary big" data-go="test:${step.lv.n}">Take the test ▶</button>`;
    } else {
      hero = `<div class="hero-k">All ${LEVELS.length} levels complete</div><h1>🎓 You did it!</h1>
        <p>Keep it fresh with rapid-fire review, or try advanced practice with all ${DRUGS.length} drugs.</p>
        <button class="primary big" data-go="review">⚡ Rapid-fire review</button>`;
    }
    const pctAll = Math.round((done / LESSONS.length) * 100);
    let levels = '';
    for (const lv of LEVELS) {
      const unlocked = levelUnlocked(lv.n);
      const nDone = lv.lessons.filter((l) => lessonDone(l.id)).length;
      const passed = testPassed(lv.n);
      const isCur = step.lv && step.lv.n === lv.n;
      const pill = passed ? '<span class="pill good">Passed ✓</span>' : !unlocked ? '<span class="pill">🔒 Locked</span>' : `<span class="pill cur">${nDone}/${lv.lessons.length}</span>`;
      const rows = lv.lessons.map((ls) => {
        const ok = lessonUnlocked(ls), dn = lessonDone(ls.id), sc = lessonScore(ls.id);
        const icon = dn ? '✓' : ok ? ls.emoji : '🔒';
        return `<div class="lrow${dn ? ' done' : ''}${ok ? '' : ' locked'}">
          <button class="lmain" ${ok ? `data-go="lesson:${ls.id}"` : 'disabled'}>
            <span class="licon">${icon}</span>
            <span class="ltext"><span class="lnum">${ls.num}</span> ${esc(ls.title)}${ls.D.length ? `<small>${ls.D.length} meds</small>` : ''}</span>
            ${sc != null ? `<span class="lscore${dn ? '' : ' fail'}">${sc}%</span>` : ''}
          </button>
          ${dn ? `<button class="lquiz" data-go="quiz:${ls.id}" aria-label="Retake quiz for ${esc(ls.title)}">Quiz</button>` : ''}
        </div>`;
      }).join('');
      const tOk = testUnlocked(lv), tRec = S.path.tests[lv.n];
      const testRow = `<div class="lrow test${passed ? ' done' : ''}${tOk ? '' : ' locked'}">
        <button class="lmain" ${tOk ? `data-go="test:${lv.n}"` : 'disabled'}>
          <span class="licon">${passed ? '✓' : tOk ? '🏁' : '🔒'}</span>
          <span class="ltext">Level ${lv.n} test<small>15 questions · pass with 80%</small></span>
          ${tRec ? `<span class="lscore${passed ? '' : ' fail'}">${Math.round(tRec.best * 100)}%</span>` : ''}
        </button></div>`;
      levels += `<details class="level${unlocked ? '' : ' locked'}${passed ? ' passed' : ''}" ${isCur ? 'open' : ''}>
        <summary><span class="lv-emoji">${lv.emoji}</span><span class="lv-t"><span class="lv-n">Level ${lv.n}</span>${esc(lv.title)}</span>${pill}</summary>
        <p class="lv-desc">${esc(lv.desc)}</p>
        ${rows}${testRow}
      </details>`;
    }
    $('#view-home').innerHTML = `
      <section class="hero">${hero}</section>
      <button class="review-btn" data-go="review" ${rp.length ? '' : 'disabled'}>
        <span class="rb-ico">⚡</span>
        <span class="rb-t"><b>Rapid-fire review</b><small>${rp.length ? `Drill what you've learned · ${due} due now` : 'Unlocks after your first lesson'}</small></span>
        <span class="rb-go">›</span>
      </button>
      <div class="overall"><span>Course progress</span><span>${done}/${LESSONS.length} lessons</span></div>
      <div class="bigprog"><i style="width:${pctAll}%"></i></div>
      <div class="levels">${levels}</div>
      <button class="adv-btn" data-go="adv">Advanced practice — all ${DRUGS.length} drugs, medic-level questions ›</button>
      <p class="fine">Study aid only — follow your local protocols and medical direction.</p>`;
  }
  function goHome() { clearAuto(); sess = null; renderHome(); showView('home'); renderTop(); }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (!b || b.disabled) return;
    const [what, arg] = b.dataset.go.split(':');
    if (what === 'lesson') openLesson(LESSON[arg]);
    else if (what === 'quiz') startLessonQuiz(LESSON[arg]);
    else if (what === 'test') startTest(LEVELS[+arg - 1]);
    else if (what === 'review') startReview();
    else if (what === 'adv') startAdv();
    else if (what === 'home') goHome();
  });
  const leaveOk = () => !(view === 'quiz' && sess && (sess.mode === 'lesson' || sess.mode === 'test') && sess.answered > 0) ||
    confirm('Leave this quiz? Your answers so far still count toward your stats, but the quiz won\'t be scored.');
  document.querySelectorAll('[data-nav="home"]').forEach((b) => b.addEventListener('click', () => { if (leaveOk()) goHome(); }));

  // ---------- Lesson slides ----------
  let LS = null; // { ls, slides, i }
  function buildSlides(ls) {
    const slides = [];
    const meds = ls.D.map((d) => d.short.toLowerCase());
    slides.push(`<div class="slide-emoji">${ls.emoji}</div><div class="slide-k">Level ${ls.level} · Lesson ${ls.num}</div><h1>${esc(ls.title)}</h1>
      <p>${meds.length ? `You'll learn <b>${meds.length} meds</b>: ${esc(meds.join(', '))}.` : 'No new meds — this lesson puts together everything you\'ve learned.'}</p>
      <p class="hint">Read through (about 3 minutes), then take a short quiz. Score 75% to complete the lesson. Missed questions come back until you get them.</p>`);
    for (const c of ls.concepts) {
      slides.push(`<h2>${c.h}</h2>${(c.p || []).map((p) => `<p>${p}</p>`).join('')}${c.list ? `<ul class="blist">${c.list.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''}${c.after ? `<p>${c.after}</p>` : ''}`);
    }
    if (ls.why) slides.push(`<div class="why"><div class="why-k">🚑 Why EMTs care</div><p>${ls.why}</p></div>`);
    ls.D.forEach((d, i) => {
      const pl = PL[d.id], x = pl.info;
      const uses = d.conds.length ? d.conds.map(condLabel).join(' · ') : STEROID_USES;
      slides.push(`<div class="slide-k">Med ${i + 1} of ${ls.D.length}</div>
        <div class="drug-hero">
          <div class="dg">${esc(d.short)}</div>
          ${x.say ? `<div class="say">🗣️ ${esc(x.say)}</div>` : ''}
          <div class="brands"><span class="bl">Brand:</span> ${d.brands.map((b) => `<span class="bchip">${esc(b)}</span>`).join('')}</div>
        </div>
        <div class="dtype">${pl.cats.map((c) => `<span class="tag">${esc(catName(c))}</span>`).join('')}</div>
        <p class="dwhat">${esc(x.what)}</p>
        <div class="drow"><span class="lbl">Used for</span><span>${esc(uses)}</span></div>
        ${x.remember ? `<div class="remember">🧠 Remember: ${esc(x.remember)}</div>` : ''}
        ${x.tip ? `<div class="pearl"><b>🚑 On a call:</b> ${esc(x.tip)}</div>` : ''}`);
    });
    slides.push(`<h2>✅ Key takeaways</h2><ul class="checks">${ls.takeaways.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <p class="hint">Quiz time — ${ls.pool ? '8 questions' : 'about ' + lessonQuiz(ls).length + ' questions'}. Score 75% to complete the lesson.</p>`);
    return slides;
  }
  function openLesson(ls) {
    if (!ls) return;
    clearAuto();
    sess = null;
    LS = { ls, slides: buildSlides(ls), i: 0 };
    $('#lessonSkip').hidden = !lessonDone(ls.id);
    renderSlide();
    showView('lesson');
  }
  function renderSlide() {
    const { slides, i } = LS;
    const box = $('#slide');
    box.innerHTML = slides[i];
    box.classList.remove('in'); void box.offsetWidth; box.classList.add('in');
    $('#lessonProg').style.width = ((i + 1) / slides.length) * 100 + '%';
    $('#slideBack').disabled = i === 0;
    $('#slideNext .next-label').textContent = i === slides.length - 1 ? 'Start quiz ▶' : 'Next';
    window.scrollTo(0, 0);
  }
  function slideStep(dir) {
    if (!LS) return;
    const n = LS.i + dir;
    if (n < 0) return;
    if (n >= LS.slides.length) { startLessonQuiz(LS.ls); return; }
    LS.i = n; renderSlide();
  }
  $('#slideNext').addEventListener('click', () => slideStep(1));
  $('#slideBack').addEventListener('click', () => slideStep(-1));
  $('#lessonExit').addEventListener('click', goHome);
  $('#lessonSkip').addEventListener('click', () => startLessonQuiz(LS.ls));

  // ---------- Sessions ----------
  // modes: lesson | test (fixed queue, scored) · review | adv (endless spaced repetition)
  let sess = null;
  function startSession(o) {
    clearAuto();
    recent.length = 0;
    sess = Object.assign({ answered: 0, correct: 0, first: {}, queue: [], missedDrugs: new Set() }, o);
    sess.total = sess.queue.length;
    $('#sessTopics').hidden = sess.mode !== 'adv';
    $('#sessProgWrap').hidden = !(sess.mode === 'lesson' || sess.mode === 'test');
    showView('quiz');
    nextQuestion();
  }
  function startLessonQuiz(ls) { startSession({ mode: 'lesson', ls, lessons: [ls], title: `Lesson ${ls.num} · ${ls.title}`, queue: lessonQuiz(ls) }); }
  function startTest(lv) { startSession({ mode: 'test', lv, lessons: lv.lessons, title: `Level ${lv.n} test`, queue: levelTest(lv) }); }
  function startReview() { startSession({ mode: 'review', title: '⚡ Rapid-fire review' }); }
  function startAdv() { startSession({ mode: 'adv', title: 'Advanced practice' }); }
  const scored = () => sess && (sess.mode === 'lesson' || sess.mode === 'test');

  // ---------- Quiz UI ----------
  const el = {
    topic: $('#qTopic'), sys: $('#qSys'), status: $('#qStatus'), prompt: $('#qPrompt'), sub: $('#qSub'),
    meds: $('#qMeds'), options: $('#qOptions'), explain: $('#qExplain'), next: $('#nextBtn'), fill: $('#nextFill'),
  };
  let cur = null; // { card, q, answered }
  let autoTimer = null, autoRaf = 0;

  function statusFor(key) {
    const r = S.cards[key];
    if (!r) return ['New', 'new'];
    if (r.b === 0) return ['Missed before', 'miss'];
    if (r.b >= 4) return ['Mastered', ''];
    return ['Learning', ''];
  }
  function renderSessBar() {
    $('#sessTitle').textContent = sess.title;
    if (scored()) {
      const left = new Set(sess.queue).size;
      const doneN = sess.total - left;
      $('#sessProg').style.width = (doneN / sess.total) * 100 + '%';
      $('#sessCount').textContent = `${doneN}/${sess.total}`;
    } else {
      $('#sessCount').textContent = sess.answered ? `${sess.correct}/${sess.answered}` : '';
    }
  }
  function emptyState(title, sub, btn) {
    cur = null;
    el.topic.textContent = ''; el.sys.textContent = ''; el.status.textContent = ''; el.status.className = 'tag status';
    el.prompt.textContent = title; el.sub.textContent = sub;
    el.meds.hidden = true; el.explain.hidden = true;
    el.options.innerHTML = btn || '';
    el.next.disabled = true;
  }

  function nextQuestion() {
    clearAuto();
    let card;
    if (scored()) {
      if (!sess.queue.length) return finishSession();
      card = cardFor(sess.queue[0]);
    } else if (sess.mode === 'review') {
      card = nextCard(reviewPool());
      if (!card) { renderSessBar(); return emptyState('Nothing to review yet', 'Finish your first lesson to unlock rapid-fire review.', '<button class="opt" data-go="home"><span class="t">Back to the learning path</span></button>'); }
    } else {
      card = nextCard(advPool());
      if (!card) {
        renderSessBar();
        return emptyState(S.settings.weakOnly ? 'No weak spots right now 🎉' : 'Nothing selected',
          S.settings.weakOnly ? 'Turn off "Weak spots only" or answer more questions.' : 'Pick at least one question type and body system.',
          '<button class="opt" id="openTopics"><span class="t">Choose topics</span></button>');
      }
    }
    let qq = null;
    try { qq = build(card); } catch (e) { console.error(card.key, e); }
    if (!qq || qq.options.length < 2) {
      if (scored()) { sess.queue.shift(); sess.total--; }
      recent.push(card.key); if (recent.length > 8) recent.shift();
      return nextQuestion();
    }
    cur = { card, q: qq, answered: false };
    if (!scored()) { recent.push(card.key); if (recent.length > 8) recent.shift(); }
    renderSessBar();

    const isB = card.key.startsWith('B|');
    el.topic.textContent = isB ? BTYPE[card.t] || '' : TOPIC[card.topic].name;
    el.sys.textContent = isB ? '' : RX.SYSTEMS[card.sys] || '';
    el.sys.hidden = isB;
    if (sess.mode === 'lesson' && sess.first[card.key] === false) { el.status.textContent = 'Try again'; el.status.className = 'tag status miss'; }
    else { const [st, stc] = statusFor(card.key); el.status.textContent = st; el.status.className = 'tag status ' + stc; }
    el.prompt.innerHTML = qq.prompt;
    el.sub.innerHTML = qq.sub || '';
    if (qq.meds) { el.meds.innerHTML = qq.meds.map((m) => `<li>${esc(cap(m))}</li>`).join(''); el.meds.hidden = false; }
    else el.meds.hidden = true;
    el.options.innerHTML = qq.options.map((o, i) => `<button class="opt" data-i="${i}"><span class="k">${i + 1}</span><span class="t">${esc(o.t)}</span></button>`).join('');
    el.explain.hidden = true; el.explain.innerHTML = '';
    el.next.disabled = true;
    el.next.querySelector('.next-label').textContent = 'Next';
    window.scrollTo(0, 0);
  }

  function answer(i) {
    if (!cur || cur.answered) return;
    const qq = cur.q, opt = qq.options[i];
    if (!opt) return;
    cur.answered = true;
    const ok = !!opt.ok;
    [...el.options.children].forEach((b, j) => {
      b.disabled = true;
      if (qq.options[j].ok) b.classList.add('correct');
      else if (j === i) b.classList.add('wrong');
      else b.classList.add('dim');
    });
    const key = cur.card.key;
    record(cur.card, ok, qq.drugs);
    sess.answered++; if (ok) sess.correct++;
    let finished = false;
    if (scored()) {
      if (!(key in sess.first)) sess.first[key] = ok;
      if (!ok && qq.drugs && qq.drugs[0]) sess.missedDrugs.add(qq.drugs[0]);
      sess.queue.shift();
      // In lessons, a missed question comes back a few questions later until you get it right.
      if (!ok && sess.mode === 'lesson') sess.queue.splice(Math.min(sess.queue.length, 3), 0, key);
      finished = !sess.queue.length;
      el.next.querySelector('.next-label').textContent = finished ? 'See results' : 'Next';
    }
    const right = qq.options.find((o) => o.ok).t;
    el.explain.innerHTML = `<div class="verdict ${ok ? 'good' : 'bad'}">${ok ? '✓ Correct' : '✗ Not quite'}</div>` +
      (ok ? '' : `<p>Answer: <b>${esc(right)}</b>${sess.mode === 'lesson' ? ' <small class="again">— this one will come back in a moment.</small>' : ''}</p>`) + qq.explain;
    el.explain.hidden = false;
    el.next.disabled = false;
    if (navigator.vibrate && !ok) { try { navigator.vibrate(40); } catch (e) { /* ignore */ } }
    if (ok && S.settings.autoNext && !finished) startAuto();
    else el.explain.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    renderTop();
    renderSessBar();
  }

  function record(card, ok, drugs) {
    const now = Date.now();
    const st = S.stats;
    st.answered++; if (ok) st.correct++;
    st.streak = ok ? st.streak + 1 : 0; st.best = Math.max(st.best, st.streak);
    const bump = (obj, k) => { if (!k) return; const r = obj[k] || (obj[k] = { n: 0, c: 0 }); r.n++; if (ok) r.c++; };
    bump(st.byTopic, card.topic); bump(st.bySys, card.sys); bump(st.days, today());
    for (const id of drugs || []) bump(st.byDrug, id);
    const r = S.cards[card.key] || { b: -1, n: 0, c: 0 };
    const first = r.n === 0;
    r.n++; r.last = now;
    if (ok) { r.c++; r.b = first ? 2 : Math.min(Math.max(r.b, 0) + 1, INTERVAL.length - 1); r.due = now + INTERVAL[r.b]; }
    else { r.b = 0; r.dueN = st.answered + 3 + rnd(3); r.due = now; }
    S.cards[card.key] = r;
    save(); askPersist();
  }

  function startAuto() {
    clearAuto();
    const ms = 1400;
    el.fill.style.setProperty('--auto', ms + 'ms');
    autoRaf = requestAnimationFrame(() => el.fill.classList.add('run'));
    autoTimer = setTimeout(() => { autoTimer = null; nextQuestion(); }, ms);
  }
  function clearAuto() {
    if (autoTimer) clearTimeout(autoTimer);
    cancelAnimationFrame(autoRaf);
    autoTimer = null;
    el.fill.classList.remove('run');
  }

  el.options.addEventListener('click', (e) => {
    if (e.target.closest('#openTopics')) { openDlg('topics'); return; }
    const b = e.target.closest('.opt[data-i]'); if (b) answer(+b.dataset.i);
  });
  el.next.addEventListener('click', () => { if (cur && cur.answered) nextQuestion(); });
  el.explain.addEventListener('pointerdown', () => { if (autoTimer) { clearAuto(); toast('Paused — tap Next when ready'); } });
  $('#sessExit').addEventListener('click', () => { if (leaveOk()) goHome(); });
  $('#sessTopics').addEventListener('click', () => openDlg('topics'));
  document.addEventListener('keydown', (e) => {
    if (document.querySelector('dialog[open]') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (view === 'lesson') {
      if (e.key === 'ArrowRight' || e.key === 'Enter') { slideStep(1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { slideStep(-1); e.preventDefault(); }
      return;
    }
    if (view !== 'quiz') return;
    if (/^[1-4]$/.test(e.key)) { answer(+e.key - 1); e.preventDefault(); }
    else if (/^[a-d]$/i.test(e.key)) { answer(e.key.toLowerCase().charCodeAt(0) - 97); e.preventDefault(); }
    else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') && cur && cur.answered) { nextQuestion(); e.preventDefault(); }
  });

  // ---------- Results ----------
  function finishSession() {
    clearAuto();
    const total = Math.max(1, sess.total);
    const right = Object.values(sess.first).filter(Boolean).length;
    const pct = right / total;
    const pctTxt = Math.round(pct * 100) + '%';
    const missed = [...sess.missedDrugs].map((id) => DRUG[id]).filter(Boolean);
    const missedHtml = missed.length ? `<div class="missed"><div class="mk">Meds to review</div>${missed.map((d) => `<span class="bchip">${esc(d.short)}${d.cleanBrands[0] ? ' (' + esc(d.cleanBrands[0]) + ')' : ''}</span>`).join('')}</div>` : '';
    let html;
    if (sess.mode === 'lesson') {
      const ls = sess.ls;
      const pass = pct >= LESSON_PASS;
      const rec = S.path.lessons[ls.id] || (S.path.lessons[ls.id] = { done: false, best: 0, n: 0 });
      const wasDone = rec.done;
      rec.n++; rec.best = Math.max(rec.best, pct); rec.last = Date.now();
      if (pass) rec.done = true;
      save();
      const nx = nextStep();
      let nextBtn = '';
      if (pass) {
        if (nx.type === 'lesson') nextBtn = `<button class="primary big" data-go="lesson:${nx.ls.id}">Next: ${esc(nx.ls.num + ' ' + nx.ls.title)} ▶</button>`;
        else if (nx.type === 'test') nextBtn = `<button class="primary big" data-go="test:${nx.lv.n}">Take the Level ${nx.lv.n} test ▶</button>`;
        else nextBtn = `<button class="primary big" data-go="review">⚡ Rapid-fire review</button>`;
      }
      html = pass
        ? `<div class="res-emoji">${pct === 1 ? '🏆' : '🎉'}</div><h1>${wasDone ? 'Nice review!' : 'Lesson complete!'}</h1>
           <p class="res-score">${right}/${total} right on the first try · <b>${pctTxt}</b></p>
           <p>${pct === 1 ? 'Perfect score.' : 'Missed questions came back until you got them — that\'s how it sticks.'} These meds are now in your ⚡ rapid-fire review.</p>
           ${missedHtml}
           ${nextBtn}
           <button class="secondary wide" data-go="home">Back to the path</button>`
        : `<div class="res-emoji">💪</div><h1>Almost there</h1>
           <p class="res-score">${right}/${total} right on the first try · <b>${pctTxt}</b></p>
           <p>You need <b>75%</b> to complete this lesson. Skim the lesson again (focus on the meds below), then retry — the questions shuffle each time.</p>
           ${missedHtml}
           <button class="primary big" data-go="quiz:${ls.id}">Retry quiz</button>
           <button class="secondary wide" data-go="lesson:${ls.id}">Re-read the lesson</button>
           <button class="link wide" data-go="home">Back to the path</button>`;
    } else {
      const lv = sess.lv;
      const pass = pct >= TEST_PASS;
      const rec = S.path.tests[lv.n] || (S.path.tests[lv.n] = { passed: false, best: 0, n: 0 });
      rec.n++; rec.best = Math.max(rec.best, pct); rec.last = Date.now();
      const firstPass = pass && !rec.passed;
      if (pass) rec.passed = true;
      save();
      const nextLv = LEVELS[lv.n];
      html = pass
        ? `<div class="res-emoji">🏅</div><h1>Level ${lv.n} passed!</h1>
           <p class="res-score">${right}/${total} · <b>${pctTxt}</b></p>
           ${nextLv ? `<p>${firstPass ? '🔓 ' : ''}<b>Level ${nextLv.n}: ${esc(nextLv.title)}</b> is unlocked.</p>${missedHtml}<button class="primary big" data-go="lesson:${nextLv.lessons[0].id}">Start Level ${nextLv.n} ▶</button>`
            : `<p>That was the final level. You've covered every med in the course — keep it sharp with rapid-fire review.</p>${missedHtml}<button class="primary big" data-go="review">⚡ Rapid-fire review</button>`}
           <button class="secondary wide" data-go="home">Back to the path</button>`
        : `<div class="res-emoji">📚</div><h1>Not yet</h1>
           <p class="res-score">${right}/${total} · <b>${pctTxt}</b></p>
           <p>You need <b>80%</b> to pass the Level ${lv.n} test. Drill the meds below with ⚡ rapid-fire review or redo their lessons, then try again.</p>
           ${missedHtml}
           <button class="primary big" data-go="test:${lv.n}">Retry test</button>
           <button class="secondary wide" data-go="review">⚡ Rapid-fire review</button>
           <button class="link wide" data-go="home">Back to the path</button>`;
    }
    $('#view-result').innerHTML = `<section class="result">${html}</section>`;
    sess = null; cur = null;
    showView('result');
    renderTop();
  }

  // ---------- Header stats ----------
  function dayStreak() {
    const days = S.stats.days;
    const d = new Date();
    if (!days[dayKey(d)]) d.setDate(d.getDate() - 1);
    let n = 0;
    while (days[dayKey(d)] && days[dayKey(d)].n > 0) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function renderTop() {
    const t = S.stats.days[today()] || { n: 0, c: 0 };
    $('#dayStreak').textContent = '🔥 ' + dayStreak();
    const goal = Math.max(1, S.settings.goal || 50);
    $('#goalText').textContent = t.n;
    $('#goal').title = `Today: ${t.n} / ${goal}`;
    $('#goalRing').style.strokeDashoffset = String(97.4 * (1 - Math.min(1, t.n / goal)));
    $('#runStreak').textContent = S.stats.streak;
    $('#todayAcc').textContent = t.n ? Math.round((t.c / t.n) * 100) + '%' : '–';
    if (t.n === goal && cur && cur.answered) toast(`🎯 Daily goal hit — ${goal} questions!`);
  }

  // ---------- Dialogs ----------
  function openDlg(name) {
    const d = $('#dlg-' + name);
    if (name === 'topics') renderTopics();
    if (name === 'stats') renderStats();
    if (name === 'library') renderLibrary();
    if (name === 'settings') renderSettings();
    clearAuto();
    d.showModal();
  }
  document.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => openDlg(b.dataset.open)));
  document.querySelectorAll('dialog').forEach((d) => {
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  });
  let poolChanged = false;
  $('#dlg-topics').addEventListener('close', () => {
    if (!poolChanged) return;
    poolChanged = false; save(); recent.length = 0;
    if (sess && sess.mode === 'adv') nextQuestion();
  });
  $('#dlg-settings').addEventListener('close', () => { if (view === 'home') renderHome(); });

  function renderTopics() {
    const st = S.settings;
    const counts = {};
    for (const c of CARDS) counts[c.topic] = (counts[c.topic] || 0) + 1;
    $('#topicChips').innerHTML = TOPICS.map((t) => `<button class="pick" data-t="${t.id}" aria-pressed="${st.topics.includes(t.id)}" title="${esc(t.desc)}">${esc(t.name)} <small>${counts[t.id] || 0}</small></button>`).join('');
    $('#sysChips').innerHTML = Object.entries(RX.SYSTEMS).map(([k, v]) => `<button class="pick" data-s="${k}" aria-pressed="${st.systems.includes(k)}">${esc(v)}</button>`).join('');
    $('#weakOnly').checked = !!st.weakOnly;
    updatePoolInfo();
  }
  function updatePoolInfo() {
    const n = advPool().length;
    $('#poolInfo').textContent = n ? `${n} cards in your current mix.` : 'No cards match — pick more topics or systems.';
  }
  $('#topicChips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-t]'); if (!b) return;
    const t = b.dataset.t, a = S.settings.topics;
    S.settings.topics = a.includes(t) ? a.filter((x) => x !== t) : [...a, t];
    b.setAttribute('aria-pressed', S.settings.topics.includes(t)); poolChanged = true; updatePoolInfo();
  });
  $('#sysChips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-s]'); if (!b) return;
    const s = b.dataset.s, a = S.settings.systems;
    S.settings.systems = a.includes(s) ? a.filter((x) => x !== s) : [...a, s];
    b.setAttribute('aria-pressed', S.settings.systems.includes(s)); poolChanged = true; updatePoolInfo();
  });
  $('#sysAll').onclick = () => { S.settings.systems = Object.keys(RX.SYSTEMS); poolChanged = true; renderTopics(); };
  $('#sysNone').onclick = () => { S.settings.systems = []; poolChanged = true; renderTopics(); };
  $('#weakOnly').onchange = (e) => { S.settings.weakOnly = e.target.checked; poolChanged = true; updatePoolInfo(); };

  function pct(c, n) { return n ? Math.round((c / n) * 100) : 0; }
  function meter(label, r) {
    const p = pct(r.c, r.n);
    return `<div class="meter"><span>${esc(label)}</span><span class="trk"><i style="width:${p}%"></i></span><span class="num">${r.n ? p + '% · ' + r.n : '—'}</span></div>`;
  }
  function renderStats() {
    const st = S.stats;
    const now = Date.now();
    const lessonsDone = LESSONS.filter((l) => lessonDone(l.id)).length;
    const levelsPassed = LEVELS.filter((l) => testPassed(l.n)).length;
    const rp = reviewPool();
    let mastered = 0, learning = 0, missed = 0, due = 0;
    for (const c of rp) {
      const r = S.cards[c.key]; if (!r) continue;
      if (r.b === 0) missed++; else if (r.b >= 4) mastered++; else learning++;
      if (isDue(r, now)) due++;
    }
    const total = rp.length, fresh = total - mastered - learning - missed;
    const days = [];
    const d = new Date(); d.setDate(d.getDate() - 13);
    for (let i = 0; i < 14; i++) { const k = dayKey(d); days.push({ k, n: (st.days[k] || {}).n || 0, l: 'SMTWTFS'[d.getDay()] }); d.setDate(d.getDate() + 1); }
    const maxN = Math.max(10, ...days.map((x) => x.n));
    const weak = Object.entries(st.byDrug).filter(([id, r]) => DRUG[id] && r.n >= 2 && r.c < r.n)
      .sort((a, b) => (a[1].c / a[1].n) - (b[1].c / b[1].n) || b[1].n - a[1].n).slice(0, 10);
    const w = (x) => (total ? (x / total) * 100 : 0);
    $('#statsBody').innerHTML = `
      <div class="kpis">
        <div class="kpi"><div class="v">${lessonsDone}<small>/${LESSONS.length}</small></div><div class="l">Lessons complete</div></div>
        <div class="kpi"><div class="v">${levelsPassed}<small>/${LEVELS.length}</small></div><div class="l">Levels passed</div></div>
        <div class="kpi"><div class="v">${st.answered}</div><div class="l">Questions answered</div></div>
        <div class="kpi"><div class="v">${st.answered ? pct(st.correct, st.answered) + '%' : '–'}</div><div class="l">All-time accuracy</div></div>
        <div class="kpi"><div class="v">${dayStreak()}</div><div class="l">Day streak</div></div>
        <div class="kpi"><div class="v">${st.best}</div><div class="l">Best run in a row</div></div>
      </div>
      <h3>Last 14 days</h3>
      <div class="days">${days.map((x, i) => `<div class="day${i === 13 ? ' today' : ''}" title="${x.k}: ${x.n}"><i style="height:${(x.n / maxN) * 100}%"></i></div>`).join('')}</div>
      <div class="day-l">${days.map((x) => `<span>${x.l}</span>`).join('')}</div>
      <h3>What you've learned (${total} review cards)</h3>
      ${total ? `<div class="stack"><i style="width:${w(mastered)}%;background:var(--good)"></i><i style="width:${w(learning)}%;background:var(--accent)"></i><i style="width:${w(missed)}%;background:var(--bad)"></i></div>
      <div class="legend"><span style="--c:var(--good)">Mastered ${mastered}</span><span style="--c:var(--accent)">Learning ${learning}</span><span style="--c:var(--bad)">Missed ${missed}</span><span style="--c:var(--surface-2)">Not seen ${fresh}</span></div>
      <p class="hint">${due} cards due for review now. Missed cards come back within a few questions; correct ones space out (10 min → 1 day → 3 days → 1 week …).</p>` : '<p class="empty">Finish a lesson and its meds show up here.</p>'}
      <h3>By question type</h3>
      ${meter('Lessons, tests & review', st.byTopic.learn || { n: 0, c: 0 })}
      ${TOPICS.map((t) => meter('Advanced: ' + t.name, st.byTopic[t.id] || { n: 0, c: 0 })).join('')}
      <h3>By body system</h3>
      ${Object.entries(RX.SYSTEMS).map(([k, v]) => meter(v, st.bySys[k] || { n: 0, c: 0 })).join('')}
      <h3>Meds to review</h3>
      ${weak.length ? `<ul class="weak">${weak.map(([id, r]) => `<li><span><b>${esc(DRUG[id].short)}</b> <small>${esc(DRUG[id].cleanBrands[0] || '')} · ${esc(typeLine(DRUG[id]))}</small></span><small>${r.c}/${r.n} right</small></li>`).join('')}</ul>` : '<p class="empty">Miss a few and they’ll show up here.</p>'}
    `;
  }

  let libBuilt = false;
  function renderLibrary() {
    if (libBuilt) return;
    libBuilt = true;
    let html = '';
    for (const [sk, sv] of Object.entries(RX.SYSTEMS)) {
      const keys = CLASS_KEYS.filter((k) => CL[k].s === sk);
      if (!keys.length) continue;
      html += `<div class="lib-sys">${esc(sv)}</div>`;
      for (const k of keys) {
        const c = CL[k];
        const drugs = byClass[k];
        html += `<details class="lib-class" data-text="${esc((c.n + ' ' + (c.x || '') + ' ' + c.g.join(' ')).toLowerCase())}">
          <summary>${esc(c.n)} ${c.x ? `<span class="sfx">${esc(c.x)}</span>` : ''}<span class="cnt">${drugs.length}</span></summary>
          <div class="lib-inner">
            <p class="how">${esc(c.m)}</p>
            <div class="pearl"><b>🚑 EMS:</b> ${esc(c.p)}</div>
            ${drugs.map((d) => {
              const pl = PL[d.id];
              return `<div class="lib-drug" data-text="${esc((d.g + ' ' + d.b + ' ' + d.conds.map(condLabel).join(' ') + (pl ? ' ' + pl.cats.map(catName).join(' ') : '')).toLowerCase())}">
              <b>${esc(d.name)}</b> <span class="bn">${esc(d.b)}</span>${pl ? ` <span class="lvl-tag">L${pl.lesson.num}</span>` : ''}
              ${pl && pl.info.say ? `<div class="uses">🗣️ ${esc(pl.info.say)}</div>` : ''}
              <div class="uses">${esc(d.conds.length ? d.conds.map(condLabel).join(' · ') : STEROID_USES)}</div>
              ${pl && pl.info.what ? `<div class="dp">${esc(pl.info.what)}</div>` : (d.p !== c.p ? `<div class="dp">${esc(d.p)}</div>` : '')}
            </div>`;
            }).join('')}
          </div>
        </details>`;
      }
    }
    $('#libBody').innerHTML = html + '<p class="fine">Tags like <span class="lvl-tag">L1.2</span> show the lesson that teaches a med. Simplified for EMS-level study — follow local protocols and medical direction.</p>';
  }
  $('#libSearch').addEventListener('input', (e) => {
    const t = e.target.value.trim().toLowerCase();
    const body = $('#libBody');
    body.querySelectorAll('.lib-class').forEach((det) => {
      if (!t) { det.hidden = false; det.open = false; det.querySelectorAll('.lib-drug').forEach((x) => (x.hidden = false)); return; }
      const classHit = det.dataset.text.includes(t);
      let any = false;
      det.querySelectorAll('.lib-drug').forEach((x) => { const hit = classHit || x.dataset.text.includes(t); x.hidden = !hit; any = any || hit; });
      det.hidden = !any; det.open = any;
    });
    body.querySelectorAll('.lib-sys').forEach((h) => {
      let n = h.nextElementSibling, any = false;
      while (n && !n.classList.contains('lib-sys')) { if (n.classList.contains('lib-class') && !n.hidden) any = true; n = n.nextElementSibling; }
      h.hidden = !any;
    });
  });

  async function renderSettings() {
    $('#goalInput').value = S.settings.goal;
    $('#autoAdv').checked = !!S.settings.autoNext;
    $('#unlockAll').checked = !!S.settings.unlockAll;
    let persisted = false;
    try { persisted = !!(navigator.storage && navigator.storage.persisted && await navigator.storage.persisted()); } catch (e) { /* ignore */ }
    const box = $('#saveStatus');
    const when = S.savedAt ? new Date(S.savedAt).toLocaleString() : 'not yet';
    box.className = 'save-status' + (storageOk ? '' : ' warn');
    box.innerHTML = storageOk
      ? `<span>✅</span><span><b>Saving on this device.</b> ${S.stats.answered} answers stored · last saved ${esc(when)}.${persisted ? ' Storage is marked persistent.' : ''}<br><small>Clearing Safari's history/website data erases progress — download a backup first. On iPhone, use Share → “Add to Home Screen”; the home-screen app keeps its own separate progress from Safari.</small></span>`
      : `<span>⚠️</span><span><b>This browser is blocking storage</b> (private mode?). Progress won't survive closing the tab — download a backup.</span>`;
  }
  $('#goalInput').addEventListener('change', (e) => { const v = Math.max(5, Math.min(500, parseInt(e.target.value, 10) || 50)); S.settings.goal = v; e.target.value = v; save(); renderTop(); });
  $('#autoAdv').addEventListener('change', (e) => { S.settings.autoNext = e.target.checked; save(); });
  $('#unlockAll').addEventListener('change', (e) => { S.settings.unlockAll = e.target.checked; save(); });
  $('#exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rxrapid-backup-${today()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Backup downloaded');
  });
  $('#importInput').addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!data || data.v !== 1 || !data.cards || !data.stats) throw new Error('bad');
      if (!confirm(`Replace current progress (${S.stats.answered} answers) with this backup (${data.stats.answered} answers)?`)) return;
      S = normalize(data); save(); renderSettings(); goHome();
      toast('Backup restored');
    } catch (err) { toast("That file isn't an RxRapid backup"); }
    finally { e.target.value = ''; }
  });
  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('Erase ALL progress — lessons, levels, and stats — on this device? Download a backup first if you might want it.')) return;
    const settings = S.settings;
    S = freshState(); S.settings = { ...settings, unlockAll: false }; save(); renderSettings(); goHome();
    toast('Progress reset');
  });

  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2200);
  }

  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
  window.addEventListener('storage', (e) => { if (e.key === KEY && e.newValue) { try { S = normalize(JSON.parse(e.newValue)); renderTop(); if (view === 'home') renderHome(); } catch (err) { /* ignore */ } } });

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // QA hook
  window.__rx = { CARDS, build, buildB, DRUGS, LESSONS, LEVELS, lessonKeys, lessonQuiz, levelTest, cardFor, state: () => S, current: () => cur };

  renderTop();
  goHome();
})();
