document.querySelectorAll(".mode").forEach(b=>b.addEventListener("click",()=>startSession(b.dataset.mode)));
document.getElementById("revealBtn").addEventListener("click",reveal);
document.getElementById("pauseBtn").addEventListener("click",()=>{paused=!paused;document.getElementById("pauseBtn").textContent=paused?"Resume":"Pause";});
document.querySelectorAll(".rate").forEach(b=>b.addEventListener("click",()=>grade(b.dataset.rating)));
document.getElementById("endBtn").addEventListener("click",endSession);
document.getElementById("homeBtn").addEventListener("click",()=>show("home"));
document.getElementById("browseBtn").addEventListener("click",openLibrary);
document.getElementById("closeLibrary").addEventListener("click",()=>document.getElementById("libraryModal").classList.remove("open"));
document.getElementById("libraryModal").addEventListener("click",e=>{if(e.target.id==="libraryModal")e.currentTarget.classList.remove("open");});
document.getElementById("searchInput").addEventListener("input",renderLibrary);
document.getElementById("unitFilter").addEventListener("change",renderLibrary);
document.getElementById("exportBtn").addEventListener("click",exportProgress);
document.getElementById("importBtn").addEventListener("click",()=>document.getElementById("importFile").click());
document.getElementById("importFile").addEventListener("change",e=>e.target.files[0]&&importProgress(e.target.files[0]));
document.getElementById("printBtn").addEventListener("click",()=>{
  const deck=document.getElementById("printDeck");
  deck.innerHTML=CARDS.map(c=>`<article class="print-card">
    <h1>Card ${String(c.id).padStart(2,"0")} — ${escapeHTML(c.title)}</h1>
    <h2>Unit ${c.unit_no}: ${escapeHTML(c.unit)} · ${escapeHTML(c.lecture)}</h2>
    <div class="print-prompt"><b>Recall:</b> ${escapeHTML(c.front)}</div>
    <ul>${c.points.map(p=>`<li>${escapeHTML(p)}</li>`).join("")}</ul>
    <div class="print-formula">${escapeHTML(c.formula)}</div>
    <p><b>Common trap:</b> ${escapeHTML(c.trap)}</p>
    <p><b>Quick check:</b> ${escapeHTML(c.check)}</p>
  </article>`).join("");
  window.print();
});
document.getElementById("resetBtn").addEventListener("click",resetProgress);
document.getElementById("themeBtn").addEventListener("click",()=>applyTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));
document.addEventListener("keydown",e=>{
  if(!document.getElementById("study").classList.contains("active")) return;
  if(e.code==="Space"){e.preventDefault(); if(!revealed)reveal(); else {paused=!paused;document.getElementById("pauseBtn").textContent=paused?"Resume":"Pause";}}
  if(revealed && ["1","2","3","4"].includes(e.key)) grade(["again","hard","good","easy"][Number(e.key)-1]);
});
applyTheme(localStorage.getItem(THEME_KEY)||((matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light"));
updateStats();
