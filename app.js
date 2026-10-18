(() => {
  'use strict';

  // ---------- Helpers ----------
  const RX = window.RX;
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
  const lc = (s) => /^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s;

  // Take `n` items, preferring up to `nPref` from `pref`, then filling from `rest`.
  function takeMix(pref, rest, n, nPref) {
    const out = shuffle(pref).slice(0, nPref);
    const used = new Set(out);
    for (const x of shuffle(pref.concat(rest))) { if (out.length >= n) break; if (!used.has(x)) { out.push(x); used.add(x); } }
    return out;
  }

  // ---------- Normalize data ----------
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
      id: g.toLowerCase().replace(/[^a-z0-9]+/g, '-'), g, name: cap(g), b, brands, cleanBrands, c, cls, sys: cls.s,
      conds, ok: uniq([...(x.ok || []), ...(cls.ok || [])]), nd: cls.nd || [], grp: x.g || cls.g, p: x.p || cls.p, noCond: !!x.noCond,
    };
  });
  const DRUG = Object.fromEntries(DRUGS.map((d) => [d.id, d]));
  const byClass = {};
  for (const d of DRUGS) (byClass[d.c] = byClass[d.c] || []).push(d);
  const CLASS_KEYS = Object.keys(CL).filter((k) => byClass[k]);
  const groupDrugs = {};
  for (const d of DRUGS) d.grp.forEach((g, i) => { if (i < 2) (groupDrugs[g] = groupDrugs[g] || []).push(d); });
  const groupSys = {};
  for (const k of CLASS_KEYS) for (const g of CL[k].g) if (!groupSys[g]) groupSys[g] = CL[k].s;
  for (const d of DRUGS) for (const g of d.grp) if (!groupSys[g]) groupSys[g] = d.sys;
  const GROUP_NAMES = Object.keys(GROUPS).filter((g) => DRUGS.some((d) => d.grp.includes(g)));
  // conditions treated by drugs whose top categories include g — used to keep "Which is an X?" fair
  const groupCondSet = {};
  for (const g of GROUP_NAMES) groupCondSet[g] = new Set((groupDrugs[g] || []).flatMap((d) => d.conds));
  const drugLabel = (d) => !d.cleanBrands.length ? d.name : (d.name.includes('(') ? `${d.name} — ${d.cleanBrands[0]}` : `${d.name} (${d.cleanBrands[0]})`);

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

  // ---------- Card catalog ----------
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

  // ---------- Storage ----------
  const KEY = 'rxrapid.v1';
  const DEFAULT_SETTINGS = { topics: TOPICS.map((t) => t.id), systems: Object.keys(RX.SYSTEMS), weakOnly: false, goal: 50, auto: true };
  function freshState() {
    return { v: 1, created: Date.now(), cards: {}, stats: { answered: 0, correct: 0, streak: 0, best: 0, byTopic: {}, bySys: {}, byDrug: {}, days: {} }, settings: { ...DEFAULT_SETTINGS }, savedAt: 0 };
  }
  function normalize(s) {
    const f = freshState();
    if (!s || typeof s !== 'object') return f;
    s.cards = s.cards && typeof s.cards === 'object' ? s.cards : {};
    s.stats = Object.assign(f.stats, s.stats || {});
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

  // ---------- Scheduling (Leitner-style spaced repetition) ----------
  const MIN = 60e3, DAY = 864e5;
  const INTERVAL = [0, 10 * MIN, DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];
  const recent = [];

  function isDue(c, now) { return c.b === 0 ? S.stats.answered >= (c.dueN || 0) : now >= (c.due || 0); }
  function pool() {
    const st = S.settings;
    const ts = new Set(st.topics), ss = new Set(st.systems);
    let list = CARDS.filter((c) => ts.has(c.topic) && ss.has(c.sys));
    if (st.weakOnly) list = list.filter((c) => { const r = S.cards[c.key]; return r && r.n > 0 && (r.b <= 1 || r.c / r.n < 0.7); });
    return list;
  }
  function nextCard() {
    const list = pool();
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
      // balance across question types
      const topics = uniq(fresh.map((c) => c.topic));
      const t = pick(topics);
      return pick(fresh.filter((c) => c.topic === t));
    }
    // Everything is learned and nothing is due — review whatever is closest to due / weakest.
    const seen = L.slice().sort((a, b) => {
      const ra = S.cards[a.key], rb = S.cards[b.key];
      return (ra.b - rb.b) || ((ra.due || 0) - (rb.due || 0));
    });
    return pick(seen.slice(0, 12));
  }

  // ---------- Question builders ----------
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
    const rights = groupDrugs[g];
    const right = pick(rights);
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
    // keep the wrong answers from looking alike
    const out = [];
    for (const k of takeMix(same, other, 12, 1)) { if (out.length >= n) break; if (!out.some((o) => condCl(o) === condCl(k))) out.push(k); }
    return out;
  }

  function genCond(d) {
    const weighted = [d.conds[0], ...d.conds];
    const answer = pick(weighted);
    const union = new Set([...d.conds, ...d.ok, ...d.nd]);
    for (const c of d.conds) for (const k in COND) if (condCl(k) === condCl(c)) union.add(k);
    const ds = condDistractors(answer, union, 3);
    return q({
      prompt: `Your patient's med list includes <b>${esc(drugLabel(d))}</b>. Which history does this most likely point to?`,
      sub: '',
      options: [{ t: condLabel(answer), ok: true }, ...ds.map((k) => ({ t: condLabel(k) }))],
      explain: (d.conds.length > 1 ? `<p>${esc(d.name)} is used for several things: <b>${esc(d.conds.map(condLabel).join('; '))}</b>. Only one of those was a choice.</p>` : '') + drugCard(d),
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
      const inter = [...sets[0]].filter((x) => sets.every((s) => s.has(x)));
      const score = inter.length;
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
      explain: `<p>The common thread is <b>${esc(condLabel(k))}</b>.</p>` + chosen.map(drugCard).join(''),
      drugs: chosen.map((d) => d.id),
    });
  }

  function findDrugs(text) {
    const t = text.toLowerCase();
    return DRUGS.filter((d) => t.startsWith(d.g.toLowerCase().replace(/\s*\(.*\)$/, '')))
      .sort((a, b) => b.g.length - a.g.length).slice(0, 1);
  }
  function genCombo(c) {
    const drugs = uniq(c.meds.flatMap(findDrugs));
    return q({
      prompt: 'Which history do these home meds most strongly suggest?',
      meds: c.meds,
      sub: '',
      options: [{ t: c.a, ok: true }, ...c.d.map((t) => ({ t }))],
      explain: `<p>${esc(c.e)}</p>`,
      drugs: drugs.map((d) => d.id),
    });
  }

  function genPearl(p) {
    return q({
      prompt: esc(p.q),
      sub: '',
      options: [{ t: p.a, ok: true }, ...p.d.map((t) => ({ t }))],
      explain: `<p>${esc(p.e)}</p>`,
      drugs: [],
    });
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
      return q({
        prompt: `Drug names ending in <b>${esc(cls.x)}</b> usually belong to which class?`,
        sub: '',
        options: [{ t: cls.n, ok: true }, ...ds.map((x) => ({ t: CL[x].n }))],
        explain, drugs: [],
      });
    }
    return q({
      prompt: `Which name pattern usually marks ${article(cls.n)} <b>${esc(lc(cls.n))}</b>?`,
      sub: '',
      options: [{ t: cls.x, ok: true }, ...ds.map((x) => ({ t: CL[x].x }))],
      explain, drugs: [],
    });
  }

  function brandDistractors(d) {
    const cands = DRUGS.filter((x) => x !== d && x.cleanBrands.length && x.g.split('/')[0] !== d.g.split('/')[0]);
    const sameClass = cands.filter((x) => x.c === d.c);
    const sameSys = cands.filter((x) => x.c !== d.c && x.sys === d.sys);
    const other = cands.filter((x) => x.sys !== d.sys);
    const first = shuffle(sameClass).slice(0, 2);
    return takeMix(first.concat(shuffle(sameSys)), other, 3, 3);
  }
  function genB2G(d) {
    const brand = pick(d.cleanBrands);
    const ds = brandDistractors(d);
    return q({
      prompt: `<b>${esc(brand)}</b> is the brand name of which generic drug?`,
      sub: '',
      options: [{ t: d.name, ok: true }, ...ds.map((x) => ({ t: x.name }))],
      explain: drugCard(d) + othersList(ds.map((x) => [x.name, x.b])),
      drugs: [d.id],
    });
  }
  function genG2B(d) {
    const ds = brandDistractors(d);
    return q({
      prompt: `Which is a brand name for <b>${esc(d.name)}</b>?`,
      sub: '',
      options: [{ t: pick(d.cleanBrands), ok: true }, ...ds.map((x) => ({ t: pick(x.cleanBrands) }))],
      explain: drugCard(d) + othersList(ds.map((x) => [x.b, x.name])),
      drugs: [d.id],
    });
  }

  function build(card) {
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

  // ---------- Quiz UI ----------
  const el = {
    topic: $('#qTopic'), sys: $('#qSys'), status: $('#qStatus'), prompt: $('#qPrompt'), sub: $('#qSub'),
    meds: $('#qMeds'), options: $('#qOptions'), explain: $('#qExplain'), next: $('#nextBtn'), fill: $('#nextFill'),
  };
  let cur = null; // { card, q, answered }
  let autoTimer = null;

  function statusFor(key) {
    const r = S.cards[key];
    if (!r) return ['New', 'new'];
    if (r.b === 0) return ['Missed before', 'miss'];
    if (r.b >= 4) return ['Mastered', ''];
    return ['Learning', ''];
  }

  function show() {
    clearAuto();
    const card = nextCard();
    if (!card) {
      cur = null;
      el.topic.textContent = ''; el.sys.textContent = ''; el.status.textContent = ''; el.status.className = 'tag status';
      el.prompt.textContent = S.settings.weakOnly ? 'No weak spots right now 🎉' : 'Nothing selected';
      el.sub.textContent = S.settings.weakOnly ? 'Turn off "Weak spots only" or answer more questions.' : 'Pick at least one question type and body system.';
      el.meds.hidden = true; el.options.innerHTML = ''; el.explain.hidden = true;
      el.options.innerHTML = '<button class="opt" id="openTopics"><span class="t">Choose topics</span></button>';
      $('#openTopics').onclick = () => openDlg('topics');
      el.next.disabled = true;
      return;
    }
    let qq = null;
    try { qq = build(card); } catch (e) { console.error(card.key, e); }
    if (!qq || qq.options.length < 2) { recent.push(card.key); if (recent.length > 8) recent.shift(); return show(); }
    cur = { card, q: qq, answered: false };
    recent.push(card.key); if (recent.length > 8) recent.shift();

    el.topic.textContent = TOPIC[card.topic].name;
    el.sys.textContent = RX.SYSTEMS[card.sys] || '';
    const [st, stc] = statusFor(card.key);
    el.status.textContent = st; el.status.className = 'tag status ' + stc;
    el.prompt.innerHTML = qq.prompt;
    el.sub.innerHTML = qq.sub || '';
    if (qq.meds) { el.meds.innerHTML = qq.meds.map((m) => `<li>${esc(cap(m))}</li>`).join(''); el.meds.hidden = false; }
    else el.meds.hidden = true;
    el.options.innerHTML = qq.options.map((o, i) => `<button class="opt" data-i="${i}"><span class="k">${i + 1}</span><span class="t">${esc(o.t)}</span></button>`).join('');
    el.explain.hidden = true; el.explain.innerHTML = '';
    el.next.disabled = true;
    el.next.querySelector('.next-label').textContent = 'Next';
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  function answer(i) {
    if (!cur || cur.answered) return;
    cur.answered = true;
    const qq = cur.q, opt = qq.options[i], ok = !!opt.ok;
    [...el.options.children].forEach((b, j) => {
      b.disabled = true;
      if (qq.options[j].ok) b.classList.add('correct');
      else if (j === i) b.classList.add('wrong');
      else b.classList.add('dim');
    });
    record(cur.card, ok, qq.drugs);
    const right = qq.options.find((o) => o.ok).t;
    el.explain.innerHTML = `<div class="verdict ${ok ? 'good' : 'bad'}">${ok ? '✓ Correct' : '✗ Not quite'}</div>` +
      (ok ? '' : `<p>Answer: <b>${esc(right)}</b></p>`) + qq.explain;
    el.explain.hidden = false;
    el.next.disabled = false;
    if (navigator.vibrate && !ok) { try { navigator.vibrate(40); } catch (e) { /* ignore */ } }
    if (ok && S.settings.auto) startAuto();
    else el.explain.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    renderTop();
  }

  function record(card, ok, drugs) {
    const now = Date.now();
    const st = S.stats;
    st.answered++; if (ok) st.correct++;
    st.streak = ok ? st.streak + 1 : 0; st.best = Math.max(st.best, st.streak);
    const bump = (obj, k) => { const r = obj[k] || (obj[k] = { n: 0, c: 0 }); r.n++; if (ok) r.c++; };
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
    requestAnimationFrame(() => el.fill.classList.add('run'));
    autoTimer = setTimeout(() => { autoTimer = null; show(); }, ms);
  }
  function clearAuto() {
    if (autoTimer) clearTimeout(autoTimer);
    autoTimer = null;
    el.fill.classList.remove('run');
  }

  el.options.addEventListener('click', (e) => { const b = e.target.closest('.opt[data-i]'); if (b) answer(+b.dataset.i); });
  el.next.addEventListener('click', () => { if (cur && cur.answered) show(); });
  el.explain.addEventListener('pointerdown', () => { if (autoTimer) { clearAuto(); toast('Paused — tap Next when ready'); } });
  document.addEventListener('keydown', (e) => {
    if (document.querySelector('dialog[open]') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^[1-4]$/.test(e.key)) { answer(+e.key - 1); e.preventDefault(); }
    else if (/^[a-d]$/i.test(e.key)) { answer(e.key.toLowerCase().charCodeAt(0) - 97); e.preventDefault(); }
    else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') && cur && cur.answered) { show(); e.preventDefault(); }
  });

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
    if (t.n === goal && cur && cur.answered && S.stats.streak >= 0) toast(`🎯 Daily goal hit — ${goal} questions!`);
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
  $('#dlg-topics').addEventListener('close', () => { if (poolChanged) { poolChanged = false; save(); recent.length = 0; show(); } });

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
    const n = pool().length;
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
    let mastered = 0, learning = 0, missed = 0, due = 0;
    for (const c of CARDS) {
      const r = S.cards[c.key]; if (!r) continue;
      if (r.b === 0) missed++; else if (r.b >= 4) mastered++; else learning++;
      if (isDue(r, now)) due++;
    }
    const total = CARDS.length, fresh = total - mastered - learning - missed;
    const days = [];
    const d = new Date(); d.setDate(d.getDate() - 13);
    for (let i = 0; i < 14; i++) { const k = dayKey(d); days.push({ k, n: (st.days[k] || {}).n || 0, l: 'SMTWTFS'[d.getDay()] }); d.setDate(d.getDate() + 1); }
    const maxN = Math.max(10, ...days.map((x) => x.n));
    const weak = Object.entries(st.byDrug).filter(([id, r]) => DRUG[id] && r.n >= 2 && r.c < r.n)
      .sort((a, b) => (a[1].c / a[1].n) - (b[1].c / b[1].n) || b[1].n - a[1].n).slice(0, 10);
    const w = (x) => (x / total) * 100;
    $('#statsBody').innerHTML = `
      <div class="kpis">
        <div class="kpi"><div class="v">${st.answered}</div><div class="l">Questions answered</div></div>
        <div class="kpi"><div class="v">${st.answered ? pct(st.correct, st.answered) + '%' : '–'}</div><div class="l">All-time accuracy</div></div>
        <div class="kpi"><div class="v">${dayStreak()}</div><div class="l">Day streak</div></div>
        <div class="kpi"><div class="v">${st.best}</div><div class="l">Best run in a row</div></div>
      </div>
      <h3>Last 14 days</h3>
      <div class="days">${days.map((x, i) => `<div class="day${i === 13 ? ' today' : ''}" title="${x.k}: ${x.n}"><i style="height:${(x.n / maxN) * 100}%"></i></div>`).join('')}</div>
      <div class="day-l">${days.map((x) => `<span>${x.l}</span>`).join('')}</div>
      <h3>Card mastery (${total} cards)</h3>
      <div class="stack"><i style="width:${w(mastered)}%;background:var(--good)"></i><i style="width:${w(learning)}%;background:var(--accent)"></i><i style="width:${w(missed)}%;background:var(--bad)"></i></div>
      <div class="legend"><span style="--c:var(--good)">Mastered ${mastered}</span><span style="--c:var(--accent)">Learning ${learning}</span><span style="--c:var(--bad)">Missed ${missed}</span><span style="--c:var(--surface-2)">New ${fresh}</span></div>
      <p class="hint">${due} cards due for review now. Missed cards come back within a few questions; correct ones space out (10 min → 1 day → 3 days → 1 week …).</p>
      <h3>By question type</h3>
      ${TOPICS.map((t) => meter(t.name, st.byTopic[t.id] || { n: 0, c: 0 })).join('')}
      <h3>By body system</h3>
      ${Object.entries(RX.SYSTEMS).map(([k, v]) => meter(v, st.bySys[k] || { n: 0, c: 0 })).join('')}
      <h3>Drugs to review</h3>
      ${weak.length ? `<ul class="weak">${weak.map(([id, r]) => `<li><span><b>${esc(DRUG[id].name)}</b> <small>${esc(DRUG[id].cls.n)}</small></span><small>${r.c}/${r.n} right</small></li>`).join('')}</ul>` : '<p class="empty">Miss a few and they’ll show up here.</p>'}
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
      html += `<div class="lib-sys" data-sys>${esc(sv)}</div>`;
      for (const k of keys) {
        const c = CL[k];
        const drugs = byClass[k];
        html += `<details class="lib-class" data-text="${esc((c.n + ' ' + (c.x || '') + ' ' + c.g.join(' ')).toLowerCase())}">
          <summary>${esc(c.n)} ${c.x ? `<span class="sfx">${esc(c.x)}</span>` : ''}<span class="cnt">${drugs.length}</span></summary>
          <div class="lib-inner">
            <p class="how">${esc(c.m)}</p>
            <div class="pearl"><b>🚑 EMS:</b> ${esc(c.p)}</div>
            ${drugs.map((d) => `<div class="lib-drug" data-text="${esc((d.g + ' ' + d.b + ' ' + d.conds.map(condLabel).join(' ')).toLowerCase())}">
              <b>${esc(d.name)}</b> <span class="bn">${esc(d.b)}</span>
              <div class="uses">${esc(d.conds.length ? d.conds.map(condLabel).join(' · ') : STEROID_USES)}</div>
              ${d.p !== c.p ? `<div class="dp">${esc(d.p)}</div>` : ''}
            </div>`).join('')}
          </div>
        </details>`;
      }
    }
    $('#libBody').innerHTML = html + '<p class="fine">Simplified for EMS-level study. Follow local protocols and medical direction.</p>';
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
    $('#autoAdv').checked = !!S.settings.auto;
    let persisted = false;
    try { persisted = !!(navigator.storage && navigator.storage.persisted && await navigator.storage.persisted()); } catch (e) { /* ignore */ }
    const box = $('#saveStatus');
    const when = S.savedAt ? new Date(S.savedAt).toLocaleString() : 'not yet';
    box.className = 'save-status' + (storageOk ? '' : ' warn');
    box.innerHTML = storageOk
      ? `<span>✅</span><span><b>Saving on this device.</b> ${S.stats.answered} answers stored · last saved ${esc(when)}.${persisted ? ' Storage is marked persistent.' : ''}<br><small>Tip: on iPhone, use Share → “Add to Home Screen” so iOS doesn't clear it. The home-screen app keeps its own separate progress from Safari.</small></span>`
      : `<span>⚠️</span><span><b>This browser is blocking storage</b> (private mode?). Progress won't survive closing the tab — download a backup.</span>`;
  }
  $('#goalInput').addEventListener('change', (e) => { const v = Math.max(5, Math.min(500, parseInt(e.target.value, 10) || 50)); S.settings.goal = v; e.target.value = v; save(); renderTop(); });
  $('#autoAdv').addEventListener('change', (e) => { S.settings.auto = e.target.checked; save(); });
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
      S = normalize(data); save(); renderSettings(); renderTop(); recent.length = 0; show();
      toast('Backup restored');
    } catch (err) { toast("That file isn't an RxRapid backup"); }
    finally { e.target.value = ''; }
  });
  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('Erase ALL progress and stats on this device? Download a backup first if you might want it.')) return;
    const settings = S.settings;
    S = freshState(); S.settings = settings; save(); renderSettings(); renderTop(); recent.length = 0; show();
    toast('Progress reset');
  });

  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2200);
  }

  // Save when the app is backgrounded (belt and braces — we also save after every answer).
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
  window.addEventListener('storage', (e) => { if (e.key === KEY && e.newValue) { try { S = normalize(JSON.parse(e.newValue)); renderTop(); } catch (err) { /* ignore */ } } });

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // Debug/QA hook
  window.__rx = { CARDS, build, DRUGS, state: () => S };

  renderTop();
  show();
})();
