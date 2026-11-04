/* Nosewise — quiz scoring, results, and browse. No backend, no API calls.
   Everything runs in the visitor's browser. */

const INTENSITY_LEVEL = { light: 0, noticeable: 1, bold: 2 };

// Note matching: normalize so "Oak Moss" == "Oakmoss", "Lily-of-the-Valley"
// == "Lily of the Valley", "Cedarwood" == "Cedar", "Tonka Bean" == "Tonka".
function normNote(s) {
  let k = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (k === "cedarwood") k = "cedar";
  if (k === "tonkabean") k = "tonka";
  return k;
}

function perfumeNoteKeys(p) {
  const keys = new Set();
  if (!p.notes) return keys;
  for (const stage of ["top", "heart", "base"]) {
    for (const n of (p.notes[stage] || [])) keys.add(normNote(n));
  }
  return keys;
}

// All distinct notes across the catalog, for the like/dislike step.
// Display name = first-seen spelling; matching uses normNote.
const ALL_NOTES = (() => {
  const seen = new Map();
  for (const p of PERFUMES) {
    if (!p.notes) continue;
    for (const stage of ["top", "heart", "base"]) {
      for (const n of (p.notes[stage] || [])) {
        const k = normNote(n);
        if (!seen.has(k)) seen.set(k, n);
      }
    }
  }
  return [...seen.entries()].map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
})();

function noteLabel(key) {
  const found = ALL_NOTES.find((n) => n.key === key);
  return found ? found.label : key;
}

// Frequency of each note key: in how many perfumes it appears.
const NOTE_FREQ = (() => {
  const freq = new Map();
  for (const p of PERFUMES) {
    for (const k of perfumeNoteKeys(p)) freq.set(k, (freq.get(k) || 0) + 1);
  }
  return freq;
})();

const INITIAL_VISIBLE_COUNT = 18; // starter chips, most common notes first
const REVEAL_BATCH = 12;          // new chips revealed per selection

// Starter set: the most common notes across the catalog.
function initialVisibleNotes() {
  return [...NOTE_FREQ.entries()]
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
    .slice(0, INITIAL_VISIBLE_COUNT)
    .map(([k]) => k);
}

// Notes related to `key`: notes that share a perfume with it, best first
// (most shared perfumes, then most common overall), excluding `shown`.
function relatedNotes(key, shown) {
  const scored = new Map();
  for (const p of PERFUMES) {
    const keys = perfumeNoteKeys(p);
    if (!keys.has(key)) continue;
    for (const k of keys) {
      if (k !== key && !shown.has(k)) scored.set(k, (scored.get(k) || 0) + 1);
    }
  }
  return [...scored.entries()]
    .sort((a, b) => (b[1] - a[1]) || ((NOTE_FREQ.get(b[0]) || 0) - (NOTE_FREQ.get(a[0]) || 0)) || a[0].localeCompare(b[0]))
    .slice(0, REVEAL_BATCH)
    .map(([k]) => k);
}

// Thumbnail photos for note chips, baked into the site (no runtime calls).
// One sprite sheet (11x11 cells of 160px) keeps this to a single image
// download; NOTE_SPRITE_POS maps each note key to its [column, row] cell.
// Notes absent here get a neutral initial tile instead (synthetics, brand
// terms, and generic accords have no honest real photo). Built from
// images-opt/notes/*.webp; see images-opt/notes/CREDITS.md for photo credits.
const NOTE_SPRITE = "images-opt/notes/sprite.webp";
const NOTE_SPRITE_POS = {
  agarwoodoud: [0, 0],
  almond: [0, 1],
  amber: [0, 2],
  ambergris: [0, 3],
  ambrette: [0, 4],
  apple: [0, 5],
  apricot: [0, 6],
  artemisia: [0, 7],
  basil: [0, 8],
  benzoin: [0, 9],
  bergamot: [0, 10],
  birch: [1, 0],
  blackcurrant: [1, 1],
  blacktea: [1, 2],
  bourbonvanilla: [1, 3],
  bulgarianrose: [1, 4],
  cacao: [1, 5],
  cacaopod: [1, 6],
  cannabis: [1, 7],
  cardamom: [1, 8],
  cashmerewood: [1, 9],
  cedar: [1, 10],
  cinnamon: [2, 0],
  citron: [2, 1],
  clarysage: [2, 2],
  coffee: [2, 3],
  coriander: [2, 4],
  dates: [2, 5],
  davana: [2, 6],
  driedfruits: [2, 7],
  driftwood: [2, 8],
  elemi: [2, 9],
  fig: [2, 10],
  firresin: [3, 0],
  fruitynotes: [3, 1],
  galbanum: [3, 2],
  ginger: [3, 3],
  gourmandaccord: [3, 4],
  grapefruit: [3, 5],
  greennotes: [3, 6],
  guaiacwood: [3, 7],
  gurjanbalsam: [3, 8],
  haitianvetiver: [3, 9],
  heliotrope: [3, 10],
  ice: [4, 0],
  incense: [4, 1],
  indonesianpatchoulileaf: [4, 2],
  italianlemon: [4, 3],
  jasmine: [4, 4],
  jasminesambac: [4, 5],
  juniper: [4, 6],
  labdanum: [4, 7],
  lavender: [4, 8],
  leather: [4, 9],
  lemon: [4, 10],
  lily: [5, 0],
  lilyofthevalley: [5, 1],
  lime: [5, 2],
  lotus: [5, 3],
  magnolia: [5, 4],
  mahogany: [5, 5],
  mandarin: [5, 6],
  mandarinorange: [5, 7],
  mimosa: [5, 8],
  mint: [5, 9],
  moss: [5, 10],
  musk: [6, 0],
  myrrh: [6, 1],
  neroli: [6, 2],
  nutmeg: [6, 3],
  oakmoss: [6, 4],
  olibanum: [6, 5],
  opoponax: [6, 6],
  orange: [6, 7],
  orangeblossom: [6, 8],
  orchid: [6, 9],
  orris: [6, 10],
  orrisroot: [7, 0],
  papaya: [7, 1],
  patchouli: [7, 2],
  peony: [7, 3],
  pineapple: [7, 4],
  pinkpepper: [7, 5],
  plum: [7, 6],
  pomegranate: [7, 7],
  praline: [7, 8],
  raspberry: [7, 9],
  resins: [7, 10],
  rooibostea: [8, 0],
  rose: [8, 1],
  saffron: [8, 2],
  sage: [8, 3],
  sandalwood: [8, 4],
  seasalt: [8, 5],
  seaweed: [8, 6],
  sicilianbergamot: [8, 7],
  spicynotes: [8, 8],
  staranise: [8, 9],
  suede: [8, 10],
  sugar: [9, 0],
  tangerine: [9, 1],
  tearose: [9, 2],
  thyme: [9, 3],
  tobacco: [9, 4],
  tobaccoblossom: [9, 5],
  tobaccoleaf: [9, 6],
  toffee: [9, 7],
  tonka: [9, 8],
  tropicalfruits: [9, 9],
  tuberose: [9, 10],
  turkishrose: [10, 0],
  vanilla: [10, 1],
  vetiver: [10, 2],
  violet: [10, 3],
  violetleaf: [10, 4],
  whiteflowers: [10, 5],
  whitemusk: [10, 6],
  woodsynotes: [10, 7],
  woodynotes: [10, 8],
  ylangylang: [10, 9],
  yuzu: [10, 10],
};

function resolveRefFamily(input) {
  if (!input) return null;
  const q = input.toLowerCase().trim();
  if (!q) return null;
  if (REFERENCE_FAMILIES[q]) return REFERENCE_FAMILIES[q];
  for (const key of Object.keys(REFERENCE_FAMILIES)) {
    if (q.includes(key) || key.includes(q)) return REFERENCE_FAMILIES[key];
  }
  for (const p of PERFUMES) {
    if (q.includes(p.name.toLowerCase())) return p.family;
  }
  return null;
}

function resolveRefPerfume(input) {
  if (!input) return null;
  const q = input.toLowerCase().trim();
  if (!q) return null;
  for (const p of PERFUMES) {
    const name = p.name.toLowerCase();
    if (q.includes(name) || name.includes(q)) return p;
  }
  return null;
}

function scorePerfume(p, a) {
  // Scent dimension: strongest signal wins, no double-counting.
  let scent = 0, scentFromRef = false;
  if (a.families.includes(p.family)) scent = 3;
  if (a.refFamily && a.refFamily === p.family) { scent = 4; scentFromRef = true; }
  let score = scent;
  if (p.occasion === a.occasion) score += 2;
  if (p.intensity === a.intensity) score += 1;
  // Notes (advanced step): +2 per loved note present, -4 per avoided note
  // present. Avoided notes normally exclude the perfume outright (see
  // getResults); the penalty only bites when exclusion would leave too few.
  const keys = perfumeNoteKeys(p);
  const likedMatched = (a.likedNotes || []).filter((k) => keys.has(k));
  const dislikedMatched = (a.dislikedNotes || []).filter((k) => keys.has(k));
  score += 2 * likedMatched.length - 4 * dislikedMatched.length;
  return { score, scent, scentFromRef, likedMatched, dislikedMatched };
}

function getResults(a) {
  // Hard filters: who (him/her include unisex; unisex means unisex only) + budget.
  let pool = PERFUMES.filter((p) => {
    const whoOk = a.who === "unisex" ? p.who === "unisex" : (p.who === a.who || p.who === "unisex");
    return whoOk && p.tier === a.tier;
  });
  // Don't recommend back the exact perfume the user already loves — the
  // point of the quiz is discovery, and its family still boosts similar picks.
  if (a.refLike === "like" && a.refPerfumeId && pool.length > 1) {
    pool = pool.filter((p) => p.id !== a.refPerfumeId);
  }
  let dislikeApplied = false;
  if (a.refLike === "dislike" && a.refFamily) {
    const filtered = pool.filter((p) => p.family !== a.refFamily);
    if (filtered.length > 0) { pool = filtered; dislikeApplied = true; }
  }
  // Notes (advanced step): avoided notes exclude a perfume, unless that
  // would leave too few matches — then the penalty in scorePerfume applies
  // instead and the results say so (notesRelaxed).
  let notesRelaxed = false;
  const applyNoteExclusion = (pl) => {
    if (!a.dislikedNotes || !a.dislikedNotes.length) return { pool: pl, relaxed: false };
    const filtered = pl.filter((p) => {
      const keys = perfumeNoteKeys(p);
      return !a.dislikedNotes.some((k) => keys.has(k));
    });
    return filtered.length >= 3 ? { pool: filtered, relaxed: false } : { pool: pl, relaxed: true };
  };
  ({ pool, relaxed: notesRelaxed } = applyNoteExclusion(pool));
  if (pool.length < 3) {
    // Fall back gracefully instead of showing an empty page.
    pool = PERFUMES.filter((p) => {
      const whoOk = a.who === "unisex" ? p.who === "unisex" : (p.who === a.who || p.who === "unisex");
      return whoOk;
    });
    dislikeApplied = false;
    ({ pool, relaxed: notesRelaxed } = applyNoteExclusion(pool));
  }
  const scored = pool.map((p) => ({ p, ...scorePerfume(p, a) }));
  scored.sort((x, y) => {
    if (y.score !== x.score) return y.score - x.score;
    const dx = Math.abs(INTENSITY_LEVEL[x.p.intensity] - INTENSITY_LEVEL[a.intensity]);
    const dy = Math.abs(INTENSITY_LEVEL[y.p.intensity] - INTENSITY_LEVEL[a.intensity]);
    if (dx !== dy) return dx - dy;
    return x.p.name.localeCompare(y.p.name);
  });
  return { top: scored.slice(0, 3), dislikeApplied, notesRelaxed };
}

function whyLines(entry, a) {
  const { p, scentFromRef } = entry;
  const lines = [];
  if (entry.likedMatched && entry.likedMatched.length) {
    lines.push(`Matches notes you love: ${entry.likedMatched.map(noteLabel).join(", ")}`);
  }
  if (entry.dislikedMatched && entry.dislikedMatched.length) {
    lines.push(`Contains ${entry.dislikedMatched.map(noteLabel).join(", ")} you wanted to avoid — closest match available`);
  }
  if (scentFromRef && a.refName) {
    lines.push(`Shares the ${FAMILY_LABELS[p.family].toLowerCase()} character of ${a.refName}, which you love`);
  } else if (a.families.includes(p.family)) {
    lines.push(`Matches your ${FAMILY_LABELS[p.family].toLowerCase()} preference`);
  }
  if (p.occasion === a.occasion) lines.push(`Tagged for ${OCCASION_LABELS[p.occasion].toLowerCase()}`);
  if (p.intensity === a.intensity) lines.push(`${INTENSITY_LABELS[p.intensity]}, as you asked`);
  lines.push(`In your ${TIER_LABELS[p.tier].toLowerCase()} tier`);
  return lines;
}

function tradeoffLine(p, a) {
  if (p.occasion !== a.occasion) {
    return `Note: tagged for ${OCCASION_LABELS[p.occasion].toLowerCase()} rather than ${OCCASION_LABELS[a.occasion].toLowerCase()}.`;
  }
  return null;
}

/* ---------------- Browser UI (skipped when loaded under Node for tests) ---------------- */

if (typeof document !== "undefined") {
  const $ = (s) => document.querySelector(s);

  const QUIZ_STEPS = ["who", "occasion", "families", "reference", "intensity", "budget", "notes"];
  const STEP_TITLES = {
    who: "Who's it for?",
    occasion: "When will you mostly wear it?",
    families: "What smells do you lean toward?",
    reference: "Is there a perfume you already love — or one you can't stand?",
    intensity: "How strong should it be?",
    budget: "What's your budget tier?",
    notes: "Any notes you love — or want to avoid?",
  };
  const answers = { who: null, occasion: null, families: [], refName: null, refLike: null, refFamily: null, refPerfumeId: null, intensity: null, tier: null, likedNotes: [], dislikedNotes: [] };
  let stepIndex = 0;

  function showView(name) {
    for (const v of ["home", "quiz", "results", "browse"]) {
      const el = document.getElementById("view-" + v);
      if (el) el.hidden = v !== name;
    }
    window.scrollTo({ top: 0 });
  }

  function optionButton(label, sub, onClick, selected) {
    const b = document.createElement("button");
    b.className = "option" + (selected ? " selected" : "");
    b.innerHTML = `<span>${label}</span>` + (sub ? `<small>${sub}</small>` : "");
    b.onclick = onClick;
    return b;
  }

  function renderQuiz() {
    const step = QUIZ_STEPS[stepIndex];
    // The notes step is optional and advanced, so it is not counted among
    // the six questions.
    $("#quiz-progress").textContent = step === "notes" ? "Optional · Advanced" : `Question ${stepIndex + 1} of ${QUIZ_STEPS.length - 1}`;
    $("#quiz-question").textContent = STEP_TITLES[step];
    const box = $("#quiz-options");
    box.innerHTML = "";
    const next = () => { stepIndex++; if (stepIndex >= QUIZ_STEPS.length) finishQuiz(); else renderQuiz(); };
    const backBtn = $("#quiz-back");
    backBtn.style.visibility = stepIndex === 0 ? "hidden" : "visible";
    backBtn.onclick = () => { stepIndex--; renderQuiz(); };

    if (step === "who") {
      for (const w of ["him", "her", "unisex"]) {
        box.appendChild(optionButton(WHO_LABELS[w], null, () => { answers.who = w; next(); }, answers.who === w));
      }
    } else if (step === "occasion") {
      for (const o of ["everyday", "office", "evenings", "special"]) {
        box.appendChild(optionButton(OCCASION_LABELS[o], null, () => { answers.occasion = o; next(); }, answers.occasion === o));
      }
    } else if (step === "families") {
      const hint = document.createElement("p");
      hint.className = "hint";
      hint.textContent = "Pick as many as you like — or none at all.";
      box.appendChild(hint);
      for (const f of Object.keys(FAMILY_LABELS)) {
        const btn = optionButton(FAMILY_LABELS[f], null, () => {
          const i = answers.families.indexOf(f);
          if (i >= 0) answers.families.splice(i, 1); else answers.families.push(f);
          btn.classList.toggle("selected");
        }, answers.families.includes(f));
        box.appendChild(btn);
      }
      const cont = document.createElement("button");
      cont.className = "primary";
      cont.textContent = "Continue";
      cont.onclick = next;
      box.appendChild(cont);
    } else if (step === "reference") {
      const wrap = document.createElement("div");
      wrap.className = "ref-wrap";
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "e.g. Dior Sauvage";
      input.value = answers.refName || "";
      input.setAttribute("aria-label", "Perfume name");
      const seg = document.createElement("div");
      seg.className = "segmented";
      const likeBtn = document.createElement("button");
      likeBtn.textContent = "I love it";
      const dislikeBtn = document.createElement("button");
      dislikeBtn.textContent = "I dislike it";
      const paint = () => {
        likeBtn.classList.toggle("selected", answers.refLike === "like");
        dislikeBtn.classList.toggle("selected", answers.refLike === "dislike");
      };
      likeBtn.onclick = () => { answers.refLike = "like"; paint(); };
      dislikeBtn.onclick = () => { answers.refLike = "dislike"; paint(); };
      paint();
      const go = document.createElement("button");
      go.className = "primary";
      go.textContent = "Continue";
      go.onclick = () => {
        answers.refName = input.value.trim() || null;
        answers.refFamily = answers.refName ? resolveRefFamily(answers.refName) : null;
        const matched = answers.refName ? resolveRefPerfume(answers.refName) : null;
        answers.refPerfumeId = matched ? matched.id : null;
        if (!answers.refName) answers.refLike = null;
        next();
      };
      const skip = document.createElement("button");
      skip.className = "text-button";
      skip.textContent = "I don't have one — skip";
      skip.onclick = () => { answers.refName = null; answers.refLike = null; answers.refFamily = null; answers.refPerfumeId = null; next(); };
      wrap.append(input, seg, go, skip);
      seg.append(likeBtn, dislikeBtn);
      box.appendChild(wrap);
    } else if (step === "intensity") {
      for (const i of ["light", "noticeable", "bold"]) {
        box.appendChild(optionButton(INTENSITY_LABELS[i], null, () => { answers.intensity = i; next(); }, answers.intensity === i));
      }
    } else if (step === "budget") {
      const note = document.createElement("p");
      note.className = "hint";
      note.textContent = "Relative tiers only — we never show prices.";
      box.appendChild(note);
      for (const t of ["affordable", "mid", "premium"]) {
        box.appendChild(optionButton(TIER_LABELS[t], null, () => { answers.tier = t; next(); }, answers.tier === t));
      }
    } else if (step === "notes") {
      const hint = document.createElement("p");
      hint.className = "hint";
      hint.textContent = "Optional. Start with the most common notes — picking one reveals notes often found with it. A note can't be in both lists.";
      box.appendChild(hint);
      const counter = document.createElement("p");
      counter.className = "hint";
      box.appendChild(counter);
      // Visible chips, in reveal order. Selected notes are always visible,
      // so coming back to this step never hides a pick.
      const visible = [];
      const visibleSet = new Set();
      const show = (key) => { if (!visibleSet.has(key)) { visibleSet.add(key); visible.push(key); } };
      for (const k of initialVisibleNotes()) show(k);
      for (const k of [...answers.likedNotes, ...answers.dislikedNotes]) show(k);
      const updateCounter = () => { counter.textContent = `Showing ${visible.length} of ${ALL_NOTES.length} notes.`; };
      // One button per note in each group; both buttons for a note stay in
      // sync so the two lists can never contradict each other.
      const btns = new Map();
      const paint = (key) => {
        const pair = btns.get(key);
        if (!pair) return;
        pair.love.classList.toggle("selected", answers.likedNotes.includes(key));
        pair.love.classList.toggle("dim", answers.dislikedNotes.includes(key));
        pair.avoid.classList.toggle("avoid-selected", answers.dislikedNotes.includes(key));
        pair.avoid.classList.toggle("dim", answers.likedNotes.includes(key));
      };
      const rows = {};
      // Thumbnail for a chip: the note's photo (from the sprite sheet)
      // where one exists, else a neutral tile with the note's initial so
      // every chip stays aligned.
      const chipThumb = (n) => {
        const p = NOTE_SPRITE_POS[n.key];
        if (p) {
          const s = document.createElement("span");
          s.className = "chip-thumb";
          s.style.backgroundImage = `url(${NOTE_SPRITE})`;
          s.style.backgroundPosition = `-${p[0] * 20}px -${p[1] * 20}px`;
          return s;
        }
        const tile = document.createElement("span");
        tile.className = "chip-tile";
        tile.textContent = n.label.charAt(0);
        return tile;
      };
      const addChip = (n, key, other, row) => {
        const b = document.createElement("button");
        b.className = "chip has-thumb";
        b.append(chipThumb(n), document.createTextNode(n.label));
        b.onclick = () => {
          const i = answers[key].indexOf(n.key);
          if (i >= 0) {
            answers[key].splice(i, 1);
          } else {
            answers[key].push(n.key);
            const j = answers[other].indexOf(n.key);
            if (j >= 0) answers[other].splice(j, 1);
            // Reveal notes often found with the newly picked note.
            for (const k of relatedNotes(n.key, visibleSet)) {
              show(k);
              const nn = ALL_NOTES.find((x) => x.key === k);
              if (nn) {
                addChip(nn, "likedNotes", "dislikedNotes", rows.love);
                addChip(nn, "dislikedNotes", "likedNotes", rows.avoid);
                paint(k);
              }
            }
            updateCounter();
          }
          paint(n.key);
        };
        if (!btns.has(n.key)) btns.set(n.key, {});
        btns.get(n.key)[key === "likedNotes" ? "love" : "avoid"] = b;
        row.appendChild(b);
      };
      const group = (label, key, other) => {
        const g = document.createElement("div");
        g.className = "note-group";
        const h = document.createElement("p");
        h.className = "filter-label";
        h.textContent = label;
        const row = document.createElement("div");
        row.className = "chips";
        rows[key === "likedNotes" ? "love" : "avoid"] = row;
        g.append(h, row);
        return g;
      };
      box.appendChild(group("Notes you love", "likedNotes", "dislikedNotes"));
      box.appendChild(group("Notes to avoid", "dislikedNotes", "likedNotes"));
      for (const k of visible) {
        const n = ALL_NOTES.find((x) => x.key === k);
        if (!n) continue;
        addChip(n, "likedNotes", "dislikedNotes", rows.love);
        addChip(n, "dislikedNotes", "likedNotes", rows.avoid);
        paint(k);
      }
      updateCounter();
      const showAll = document.createElement("button");
      showAll.className = "text-button";
      showAll.textContent = "Show all notes";
      showAll.onclick = () => {
        for (const n of ALL_NOTES) {
          if (!visibleSet.has(n.key)) {
            show(n.key);
            addChip(n, "likedNotes", "dislikedNotes", rows.love);
            addChip(n, "dislikedNotes", "likedNotes", rows.avoid);
            paint(n.key);
          }
        }
        updateCounter();
        showAll.remove();
      };
      box.appendChild(showAll);
      const cont = document.createElement("button");
      cont.className = "primary";
      cont.textContent = "See my matches";
      cont.onclick = next;
      box.appendChild(cont);
      const skip = document.createElement("button");
      skip.className = "text-button";
      skip.textContent = "Skip this step";
      skip.onclick = () => { answers.likedNotes = []; answers.dislikedNotes = []; next(); };
      box.appendChild(skip);
    }
  }

  function photoHTML(p, size) {
    const src = PHOTOS[p.id];
    if (src) return `<img class="card-photo" src="${src}" alt="${p.name} bottle" loading="lazy" onerror="this.remove();">`;
    const initials = p.name.replace(/^(Armaf|Lattafa|Rasasi|Tom Ford|Issey Miyake|Emporio Armani|Roja Parfums|Maison Francis Kurkdjian|Carolina Herrera|Swiss Arabian|French Avenue|Calvin Klein|Versace|Chanel|Montblanc|Afnan|Mykonos|Dior)\s+/i, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
    return `<div class="card-photo placeholder" aria-hidden="true"><span>${initials}</span></div>`;
  }

  function tagRow(p) {
    return `<div class="tags"><span>${WHO_LABELS[p.who]}</span><span>${FAMILY_LABELS[p.family]}</span><span>${OCCASION_LABELS[p.occasion]}</span><span>${INTENSITY_LABELS[p.intensity]}</span><span>${TIER_LABELS[p.tier]}</span></div>`;
  }

  function notesHTML(p) {
    if (!p.notes) return "";
    return `<p class="notes"><span>Top:</span> ${p.notes.top.join(", ")}<br><span>Heart:</span> ${p.notes.heart.join(", ")}<br><span>Base:</span> ${p.notes.base.join(", ")}</p>`;
  }

  function finishQuiz() {
    const { top, dislikeApplied, notesRelaxed } = getResults(answers);
    const box = $("#results-list");
    box.innerHTML = "";
    top.forEach((entry, i) => {
      const card = document.createElement("article");
      card.className = "result-card" + (i === 0 ? " best" : "");
      const whys = whyLines(entry, answers).map((w) => `<li>${w}</li>`).join("");
      const trade = tradeoffLine(entry.p, answers);
      card.innerHTML = `
        ${i === 0 ? `<div class="best-badge">Best match</div>` : `<div class="best-badge alt">Alternative ${i}</div>`}
        ${photoHTML(entry.p)}
        <h3>${entry.p.name}</h3>
        ${tagRow(entry.p)}
        <p class="desc">${entry.p.desc}</p>
        ${notesHTML(entry.p)}
        <ul class="why">${whys}</ul>
        ${trade ? `<p class="tradeoff">${trade}</p>` : ""}
      `;
      box.appendChild(card);
    });
    if (notesRelaxed && answers.dislikedNotes.length) {
      const note = document.createElement("p");
      note.className = "tradeoff";
      note.textContent = "No perfumes avoided all your disliked notes, so these are the closest matches — perfumes with avoided notes rank lower.";
      box.prepend(note);
    }
    if (dislikeApplied) {
      const note = document.createElement("p");
      note.className = "tradeoff";
      note.textContent = `Picks in the ${FAMILY_LABELS[answers.refFamily].toLowerCase()} family were filtered out because you dislike ${answers.refName}.`;
      box.prepend(note);
    }
    showView("results");
  }

  function renderBrowse() {
    const f = browseFilters;
    const grid = $("#browse-grid");
    const list = PERFUMES.filter((p) =>
      (f.who === "all" || p.who === f.who || (f.who !== "unisex" && p.who === "unisex")) &&
      (f.family === "all" || p.family === f.family) &&
      (f.occasion === "all" || p.occasion === f.occasion) &&
      (f.intensity === "all" || p.intensity === f.intensity) &&
      (f.tier === "all" || p.tier === f.tier)
    );
    $("#browse-count").textContent = `${list.length} of ${PERFUMES.length} perfumes`;
    grid.innerHTML = "";
    for (const p of list) {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `${photoHTML(p)}<h3>${p.name}</h3>${tagRow(p)}<p class="desc">${p.desc}</p>${notesHTML(p)}`;
      grid.appendChild(card);
    }
  }

  const browseFilters = { who: "all", family: "all", occasion: "all", intensity: "all", tier: "all" };

  function chipGroup(label, key, options, labels) {
    const wrap = document.createElement("div");
    wrap.className = "filter-group";
    wrap.innerHTML = `<span class="filter-label">${label}</span>`;
    const row = document.createElement("div");
    row.className = "chips";
    for (const opt of options) {
      const b = document.createElement("button");
      b.className = "chip" + (browseFilters[key] === opt ? " selected" : "");
      b.textContent = opt === "all" ? "All" : labels[opt];
      b.onclick = () => { browseFilters[key] = opt; buildBrowseFilters(); renderBrowse(); };
      row.appendChild(b);
    }
    wrap.appendChild(row);
    return wrap;
  }

  function buildBrowseFilters() {
    const box = $("#browse-filters");
    box.innerHTML = "";
    box.appendChild(chipGroup("Who", "who", ["all", "him", "her", "unisex"], WHO_LABELS));
    box.appendChild(chipGroup("Scent", "family", ["all", ...Object.keys(FAMILY_LABELS)], FAMILY_LABELS));
    box.appendChild(chipGroup("Occasion", "occasion", ["all", ...Object.keys(OCCASION_LABELS)], OCCASION_LABELS));
    box.appendChild(chipGroup("Strength", "intensity", ["all", ...Object.keys(INTENSITY_LABELS)], INTENSITY_LABELS));
    box.appendChild(chipGroup("Budget", "tier", ["all", ...Object.keys(TIER_LABELS)], TIER_LABELS));
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-nav]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const target = el.getAttribute("data-nav");
        if (target === "quiz") { stepIndex = 0; renderQuiz(); }
        if (target === "browse") { buildBrowseFilters(); renderBrowse(); }
        showView(target);
      });
    });
    const retake = $("#retake-quiz");
    if (retake) retake.onclick = () => {
      stepIndex = 0;
      answers.who = null; answers.occasion = null; answers.families = [];
      answers.refName = null; answers.refLike = null; answers.refFamily = null; answers.refPerfumeId = null;
      answers.intensity = null; answers.tier = null;
      answers.likedNotes = []; answers.dislikedNotes = [];
      renderQuiz(); showView("quiz");
    };
    const browseFromResults = $("#browse-from-results");
    if (browseFromResults) browseFromResults.onclick = () => { buildBrowseFilters(); renderBrowse(); showView("browse"); };
  });
}

if (typeof module !== "undefined") {
  module.exports = { resolveRefFamily, resolveRefPerfume, scorePerfume, getResults, whyLines, tradeoffLine, normNote, perfumeNoteKeys, ALL_NOTES, noteLabel, NOTE_FREQ, initialVisibleNotes, relatedNotes, NOTE_SPRITE, NOTE_SPRITE_POS };
}
