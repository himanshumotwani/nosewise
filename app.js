/* Nosewise — quiz scoring, results, and browse. No backend, no API calls.
   Everything runs in the visitor's browser. */

const INTENSITY_LEVEL = { light: 0, noticeable: 1, bold: 2 };

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
  return { score, scent, scentFromRef };
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
  if (pool.length < 3) {
    // Fall back gracefully instead of showing an empty page.
    pool = PERFUMES.filter((p) => {
      const whoOk = a.who === "unisex" ? p.who === "unisex" : (p.who === a.who || p.who === "unisex");
      return whoOk;
    });
    dislikeApplied = false;
  }
  const scored = pool.map((p) => ({ p, ...scorePerfume(p, a) }));
  scored.sort((x, y) => {
    if (y.score !== x.score) return y.score - x.score;
    const dx = Math.abs(INTENSITY_LEVEL[x.p.intensity] - INTENSITY_LEVEL[a.intensity]);
    const dy = Math.abs(INTENSITY_LEVEL[y.p.intensity] - INTENSITY_LEVEL[a.intensity]);
    if (dx !== dy) return dx - dy;
    return x.p.name.localeCompare(y.p.name);
  });
  return { top: scored.slice(0, 3), dislikeApplied };
}

function whyLines(entry, a) {
  const { p, scentFromRef } = entry;
  const lines = [];
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

  const QUIZ_STEPS = ["who", "occasion", "families", "reference", "intensity", "budget"];
  const STEP_TITLES = {
    who: "Who's it for?",
    occasion: "When will you mostly wear it?",
    families: "What smells do you lean toward?",
    reference: "Is there a perfume you already love — or one you can't stand?",
    intensity: "How strong should it be?",
    budget: "What's your budget tier?",
  };
  const answers = { who: null, occasion: null, families: [], refName: null, refLike: null, refFamily: null, refPerfumeId: null, intensity: null, tier: null };
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
    $("#quiz-progress").textContent = `Question ${stepIndex + 1} of ${QUIZ_STEPS.length}`;
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

  function finishQuiz() {
    const { top, dislikeApplied } = getResults(answers);
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
        <ul class="why">${whys}</ul>
        ${trade ? `<p class="tradeoff">${trade}</p>` : ""}
      `;
      box.appendChild(card);
    });
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
      card.innerHTML = `${photoHTML(p)}<h3>${p.name}</h3>${tagRow(p)}<p class="desc">${p.desc}</p>`;
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
      renderQuiz(); showView("quiz");
    };
    const browseFromResults = $("#browse-from-results");
    if (browseFromResults) browseFromResults.onclick = () => { buildBrowseFilters(); renderBrowse(); showView("browse"); };
  });
}

if (typeof module !== "undefined") {
  module.exports = { resolveRefFamily, resolveRefPerfume, scorePerfume, getResults, whyLines, tradeoffLine };
}
