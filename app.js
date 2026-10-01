const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

let SITE, PROJECTS, ARTICLES, EXPERIENCE, SKILLS, NOW;

async function loadData(){
  const files = ["site","projects","articles","experience","skills","now"];
  const values = await Promise.all(files.map(f => fetch(`data/${f}.json`).then(r => r.json())));
  [SITE, PROJECTS, ARTICLES, EXPERIENCE, SKILLS, NOW] = values;
  render();
}

function render(){
  $("#skills").innerHTML = SKILLS.map(x => `<span>${x}</span>`).join("");

  // Keep page identity in sync with data/site.json.
  document.title = `${SITE.short_name || "Fazle"} — Personal OS`;
  const heroName = $(".hero .eyebrow");
  if (heroName) heroName.innerHTML = `<span class="dot"></span> ${SITE.name.toUpperCase()} / 2026`;

  $("#experienceList").innerHTML = EXPERIENCE.map(x => `
    <article class="timeline-item">
      <div class="year">${x.year}</div>
      <div class="timeline-main">
        <div class="role-head"><h3>${x.title}</h3><span>${x.type}</span></div>
        <p>${x.text}</p>
      </div>
    </article>`).join("");

  renderFilters();
  renderProjects("All");
  renderArticles();
  renderNow();

  $("#emailLink").textContent = SITE.email + " ↗";
  $("#emailLink").href = `mailto:${SITE.email}`;
  $("#linkedinLink").href = SITE.links.linkedin;
  $("#githubLink").href = SITE.links.github;
}

function renderNow(){
  $(".now-grid").innerHTML = NOW.map(x => `
    <article>
      <span>${x.label}</span>
      <h3>${x.title}</h3>
      <p>${x.text}</p>
    </article>`).join("");
}

function renderFilters(){
  const cats = ["All", ...new Set(PROJECTS.map(p => p.category))];
  $("#projectFilters").innerHTML = cats.map((c,i) =>
    `<button class="filter ${i===0?'active':''}" data-cat="${c}">${c}</button>`
  ).join("");
  $$("#projectFilters .filter").forEach(b => b.addEventListener("click", () => {
    $$("#projectFilters .filter").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    renderProjects(b.dataset.cat);
  }));
}

function emgVisual(){
  // EMG burst aesthetic — two gait-cycle-like muscle activation bursts over a
  // quiet baseline, deterministic (not random) so the card doesn't reshuffle
  // on every re-render.
  const w = 300, n = 140;
  let d = "";
  for(let i = 0; i <= n; i++){
    const t = i / n;
    const x = t * w;
    const envelope = Math.exp(-Math.pow((t - 0.28) / 0.09, 2)) * 0.85 +
                      Math.exp(-Math.pow((t - 0.72) / 0.09, 2)) * 0.85 + 0.05;
    const noise = Math.sin(i * 12.9) * 0.5 + Math.sin(i * 7.3 + 1) * 0.3 + Math.sin(i * 21.7 + 2) * 0.2;
    const y = 50 - noise * envelope * 38;
    d += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1) + " ";
  }
  return `<div class="visual signal waveform">
      <div class="wave-grid"></div>
      <svg class="wave-trace" viewBox="0 0 300 100" preserveAspectRatio="none">
        <path d="${d.trim()}" />
      </svg>
      <div class="wave-scan"></div>
      <span class="visual-label">EMG / GAIT CYCLE</span>
    </div>`;
}

function spectrogramVisual(){
  // Time-frequency heatmap aesthetic (STFT/CWT) — deterministic pseudo-energy pattern,
  // not random, so the card doesn't flicker/reshuffle on every re-render.
  const cols = 14, rows = 5;
  let cells = "";
  for(let r = 0; r < rows; r++){
    for(let c = 0; c < cols; c++){
      const t = c / (cols - 1);
      const f = r / (rows - 1);
      const energy = Math.exp(-Math.pow((f - 0.5) - 0.25 * Math.sin(t * 6.283), 2) * 8) *
                     (0.35 + 0.65 * Math.abs(Math.sin(t * 3.14 + f)));
      const alpha = Math.max(0.06, Math.min(0.95, energy)).toFixed(2);
      cells += `<i style="opacity:${alpha}"></i>`;
    }
  }
  return `<div class="visual spectrogram">
      <div class="spec-axis spec-axis-f">FREQ</div>
      <div class="spec-grid">${cells}</div>
      <div class="spec-axis spec-axis-t">TIME →</div>
      <span class="visual-label">STFT / CWT</span>
    </div>`;
}

function optionsVisual(){
  // Call-option payoff (hockey stick at strike K) with the smooth Black-Scholes
  // value curve above it. N(x) uses a logistic approximation — decorative only.
  const N = x => 1 / (1 + Math.exp(-1.702 * x));
  const K = 100, vol = 0.35, toX = s => 20 + (s - 40) * 2.2, toY = v => 82 - v * 0.9;
  let bs = "";
  for(let s = 40; s <= 160; s += 2){
    const d1 = (Math.log(s / K) + vol * vol / 2) / vol;
    const v = s * N(d1) - K * N(d1 - vol);
    bs += (s === 40 ? "M" : "L") + toX(s).toFixed(1) + "," + toY(v).toFixed(1) + " ";
  }
  const payoff = `M${toX(40)},${toY(0)} L${toX(K)},${toY(0)} L${toX(160)},${toY(60).toFixed(1)}`;
  return `<div class="visual options">
      <div class="wave-grid"></div>
      <svg class="options-chart" viewBox="0 0 300 100" preserveAspectRatio="none">
        <path class="payoff" d="${payoff}" />
        <path class="bs-curve" d="${bs.trim()}" />
        <line class="strike" x1="${toX(K)}" y1="8" x2="${toX(K)}" y2="90" />
      </svg>
      <span class="options-k">K</span>
      <span class="visual-label">PAYOFF / BLACK-SCHOLES</span>
    </div>`;
}

function projectVisual(p){
  // Visual is based on the PROJECT CATEGORY (and an explicit visualType field),
  // never on position/index in the filtered list. This prevents Blockchain/Markets
  // cards from accidentally getting a Biomedical visual, and lets multiple
  // Biomedical projects each get their own distinct look.
  if(p.category === "Biomedical") return p.visualType === "emg" ? emgVisual() : spectrogramVisual();

  if(p.category === "Markets"){
    if(p.visualType === "options") return optionsVisual();
    return `<div class="visual market">
      <div class="market-grid-lines"></div>
      <div class="bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="market-line"></div>
      <span class="visual-label">MARKET / LIQUIDITY</span>
    </div>`;
  }

  return `<div class="visual chain">
      <div class="chain-orbit orbit-one"></div>
      <div class="chain-orbit orbit-two"></div>
      <div class="node">₿</div><div class="chain-line"></div>
      <div class="node">◈</div><div class="chain-line"></div>
      <div class="node">◆</div>
      <span class="visual-label">ON-CHAIN / WEB3</span>
    </div>`;
}

function renderProjects(category){
  const list = category==="All" ? PROJECTS : PROJECTS.filter(p => p.category===category);
  $("#projectGrid").innerHTML = list.map((p,i) => `
    <article class="project" data-id="${p.id}">
      <div class="project-number">0${i+1}</div>
      ${projectVisual(p)}
      <div class="project-info">
        <p class="project-type">${p.category} · ${p.year}<span class="status">${p.status}</span></p>
        <h3>${p.title}</h3>
        <p>${p.short}</p>
        <a class="project-link" href="#" data-open="${p.id}">Read the case ↗</a>
      </div>
    </article>`).join("");

  $$("[data-open]").forEach(a => a.addEventListener("click", e => {
    e.preventDefault();
    openProject(a.dataset.open);
  }));
}

function openProject(id){
  const p = PROJECTS.find(x => x.id===id);
  if(!p) return;

  const pipeline = (p.pipeline || []).map((step, i) => `
    <div class="case-step">
      <span>0${i+1}</span>
      <strong>${step}</strong>
    </div>
    ${i < (p.pipeline || []).length - 1 ? '<div class="case-arrow">→</div>' : ''}
  `).join("");

  const highlights = (p.highlights || []).map(([label, value]) => `
    <div class="case-stat">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");

  // Sections 01–05 always exist; the optional ones continue the numbering.
  let n = 5;
  const nShots = p.screenshots?.length ? "0" + ++n : null;
  const nLearned = p.learned ? "0" + ++n : null;

  const screenshotsSection = nShots ? `
    <section class="case-section">
      <div class="case-label">${nShots} / Screenshots</div>
      <div class="case-shots">${p.screenshots.map(s => `
        <figure>
          <img src="${s.src}" alt="${s.caption}">
          <figcaption>${s.caption}</figcaption>
        </figure>`).join("")}</div>
    </section>` : "";

  const learnedSection = nLearned ? `
    <section class="case-section">
      <div class="case-label">${nLearned} / What I learned</div>
      <p class="modal-copy">${p.learned}</p>
    </section>` : "";

  const external = p.link && p.link !== "#"
    ? `<a class="project-link" href="${p.link}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`
    : `<span class="case-note">Project link coming soon.</span>`;

  $("#modalContent").innerHTML = `
    <div class="case-hero">
      <div>
        <div class="modal-kicker">${p.category} / ${p.year} / ${p.status}</div>
        <h2 class="modal-title">${p.title}</h2>
        <p class="case-tagline">${p.tagline || p.short}</p>
      </div>
      <div class="case-id">${p.id.toUpperCase()}</div>
    </div>

    <div class="modal-tags">${p.stack.map(s=>`<span>${s}</span>`).join("")}</div>

    <div class="case-stats">${highlights}</div>

    <section class="case-section">
      <div class="case-label">01 / The idea</div>
      <p class="modal-copy">${p.details || p.short}</p>
    </section>

    <section class="case-section">
      <div class="case-label">02 / Pipeline</div>
      <div class="case-pipeline">${pipeline}</div>
    </section>

    <section class="case-section case-columns">
      <div>
        <div class="case-label">03 / Problem</div>
        <p class="modal-copy">${p.problem}</p>
      </div>
      <div>
        <div class="case-label">04 / Approach</div>
        <p class="modal-copy">${p.approach}</p>
      </div>
    </section>

    <section class="case-section">
      <div class="case-label">05 / Result</div>
      <p class="modal-copy">${p.result}</p>
    </section>
    ${screenshotsSection}
    ${learnedSection}
    <div class="case-footer">${external}</div>
  `;
  $("#projectModal").showModal();
}
$("#modalClose").addEventListener("click", () => $("#projectModal").close());
$("#projectModal").addEventListener("click", e => { if(e.target.id==="projectModal") $("#projectModal").close(); });

function renderArticles(query=""){
  const q = query.toLowerCase().trim();
  const list = ARTICLES.filter(a => !q || `${a.title} ${a.category} ${a.excerpt}`.toLowerCase().includes(q));
  $("#articleList").innerHTML = list.map(a => `
    <article class="article">
      <div class="article-date">${a.date}<br>${a.category}</div>
      <div><h3>${a.title}</h3><p>${a.excerpt}</p></div>
      <div class="article-meta">${a.time}<br>READ →</div>
    </article>`).join("") || `<p class="modal-copy">No notes found.</p>`;
}
$("#articleSearch").addEventListener("input", e => renderArticles(e.target.value));

const savedTheme = localStorage.getItem("fazle-theme");
if(savedTheme==="light") document.documentElement.classList.add("light");
$("#themeToggle").addEventListener("click", () => {
  document.documentElement.classList.toggle("light");
  localStorage.setItem("fazle-theme", document.documentElement.classList.contains("light") ? "light" : "dark");
});

// Mobile navigation
const menuToggle = $("#menuToggle");
const siteNav = $("#siteNav");
if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.textContent = open ? "×" : "☰";
  });
  $$("#siteNav a").forEach(link => link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  }));
}

loadData().catch(err => {
  console.error(err);
  document.body.insertAdjacentHTML("beforeend", `<div style="position:fixed;bottom:20px;left:20px;background:#ff7550;color:#111;padding:12px 15px;font:12px monospace;z-index:99">Open this folder through a local server (not file://) so JSON data can load.</div>`);
});

// Small interactions: reveal sections and gentle magnetic buttons.
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("in-view");
      observer.unobserve(entry.target);
    }
  });
},{threshold:.12});
$$(".section").forEach(el => {
  el.classList.add("reveal-on-scroll");
  observer.observe(el);
});

$$(".magnetic").forEach(el => {
  el.addEventListener("mousemove", e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX-r.left-r.width/2)*.12;
    const y = (e.clientY-r.top-r.height/2)*.12;
    el.style.transform = `translate(${x}px,${y}px)`;
  });
  el.addEventListener("mouseleave", () => el.style.transform = "");
});

const hv = $("#heroVisual");
if(hv){
  hv.addEventListener("mousemove", e => {
    const r=hv.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    hv.style.transform=`perspective(1000px) rotateY(${x*3}deg) rotateX(${-y*3}deg)`;
  });
  hv.addEventListener("mouseleave",()=>hv.style.transform="");
}
