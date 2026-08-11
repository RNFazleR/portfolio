const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

let SITE, PROJECTS, ARTICLES, EXPERIENCE, SKILLS;

async function loadData(){
  const files = ["site","projects","articles","experience","skills","now"];
  const values = await Promise.all(files.map(f => fetch(`data/${f}.json`).then(r => r.json())));
  [SITE, PROJECTS, ARTICLES, EXPERIENCE, SKILLS, NOW] = values;
  render();
}

function render(){
  $("#skills").innerHTML = SKILLS.map(x => `<span>${x}</span>`).join("");

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
  const el = $("#nowGrid");
  if(!el || !NOW) return;
  el.innerHTML = NOW.map(x => `
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

function projectVisual(p, index){
  // Visual is based on the PROJECT CATEGORY, not its position in the filtered list.
  // This prevents Blockchain/Markets cards from accidentally getting the EMG visual.
  if(p.category === "Biomedical"){
    return `<div class="visual signal">
      <div class="wave w1"></div><div class="wave w2"></div><div class="wave w3"></div>
      <span class="visual-label">EMG / GAIT</span>
    </div>`;
  }

  if(p.category === "Blockchain"){
    return `<div class="visual chain">
      <div class="chain-orbit orbit-one"></div>
      <div class="chain-orbit orbit-two"></div>
      <div class="node">₿</div><div class="chain-line"></div>
      <div class="node">◈</div><div class="chain-line"></div>
      <div class="node">◆</div>
      <span class="visual-label">ON-CHAIN / WEB3</span>
    </div>`;
  }

  if(p.category === "Markets"){
    return `<div class="visual market">
      <div class="market-grid-lines"></div>
      <div class="bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="market-line"></div>
      <span class="visual-label">MARKET / LIQUIDITY</span>
    </div>`;
  }

  return `<div class="visual market"><div class="bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>`;
}

function renderProjects(category){
  const list = category==="All" ? PROJECTS : PROJECTS.filter(p => p.category===category);
  $("#projectGrid").innerHTML = list.map((p,i) => `
    <article class="project" data-id="${p.id}">
      <div class="project-number">0${i+1}</div>
      ${projectVisual(p,i)}
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
  $("#modalContent").innerHTML = `
    <div class="modal-kicker">${p.category} / ${p.year} / ${p.status}</div>
    <h2 class="modal-title">${p.title}</h2>
    <p class="modal-copy">${p.short}</p>
    <div class="modal-tags">${p.stack.map(s=>`<span>${s}</span>`).join("")}</div>
    <h3>The problem</h3><p class="modal-copy">${p.problem}</p>
    <h3>Approach</h3><p class="modal-copy">${p.approach}</p>
    <h3>Result</h3><p class="modal-copy">${p.result}</p>
    <a class="project-link" href="${p.link}">External link ↗</a>`;
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
$$(".section, .project, .timeline-item, .article").forEach(el => {
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
