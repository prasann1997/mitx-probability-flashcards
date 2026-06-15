function finishTest(){
  clearInterval(elapsedHandle);
  const elapsedMs=Math.max(1000,Date.now()-testStarted);
  const pct=sessionGraded?Math.round(100*sessionCorrect/sessionGraded):0;
  testDB.history.push({date:Date.now(),mode:activeMode,total:sessionGraded,correct:sessionCorrect,minutes:Math.round(elapsedMs/60000)});
  testDB.history=testDB.history.slice(-100); saveTestDB();
  document.getElementById("completeHeading").textContent=pct>=80?"Strong result":pct>=60?"Good foundation":"Target the missed concepts";
  document.getElementById("completeSummary").textContent=`You answered ${sessionGraded} questions and got ${sessionCorrect} correct. Review the derivations for every miss before retesting.`;
  document.getElementById("finalScore").textContent=pct+"%";
  document.getElementById("finalCorrect").textContent=`${sessionCorrect} / ${sessionGraded}`;
  document.getElementById("finalTime").textContent=Math.max(1,Math.round(elapsedMs/60000))+"m";
  const uniqueMissed=[...new Set(sessionMissed)];
  document.getElementById("missedList").innerHTML=uniqueMissed.length
    ?`<h3>Missed or skipped</h3>${uniqueMissed.map(id=>{const q=QUESTIONS.find(x=>x.id===id);return `<span class="missed-chip">Q${id} · Unit ${q.unit_no}</span>`}).join("")}`
    :"<h3>No missed questions in this session.</h3>";
  const reviewBtn=document.getElementById("reviewSessionMissedBtn");
  reviewBtn.disabled=!uniqueMissed.length; reviewBtn.dataset.ids=uniqueMissed.join(",");
  showScreen("testComplete");
}
function endTest(){
  if(confirm("End this test now? Your completed answers will remain recorded.")) finishTest();
}
function populateUnits(){
  const select=document.getElementById("unitSelect");
  [...new Set(QUESTIONS.map(q=>q.unit_no))].forEach(n=>{
    const q=QUESTIONS.find(x=>x.unit_no===n);
    const option=document.createElement("option");
    option.value=n; option.textContent=`Unit ${n}: ${q.unit}`;
    select.appendChild(option);
  });
}
function applyTestTheme(theme){ document.documentElement.dataset.theme=theme; localStorage.setItem(THEME_KEY,theme); }

document.querySelectorAll(".mode").forEach(btn=>btn.addEventListener("click",()=>startTest(btn.dataset.mode)));
document.getElementById("unitStartBtn").addEventListener("click",()=>{
  const n=document.getElementById("unitSelect").value;
  if(!n){ alert("Select a unit first."); return; }
  startTest("unit",n);
});
document.getElementById("checkBtn").addEventListener("click",()=>gradeCurrent(false));
document.getElementById("revealUngradedBtn").addEventListener("click",()=>gradeCurrent(true));
document.getElementById("flipBackBtn").addEventListener("click",()=>document.getElementById("mcqCard").classList.remove("flipped"));
document.getElementById("nextQuestionBtn").addEventListener("click",nextQuestion);
document.getElementById("endTestBtn").addEventListener("click",endTest);
document.getElementById("testHomeBtn").addEventListener("click",()=>showScreen("testHome"));
document.getElementById("reviewSessionMissedBtn").addEventListener("click",e=>{
  const ids=(e.currentTarget.dataset.ids||"").split(",").filter(Boolean).map(Number);
  if(ids.length) startTest("session-missed",null,ids);
});
document.getElementById("themeBtn").addEventListener("click",()=>applyTestTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));
document.addEventListener("keydown",e=>{
  if(!document.getElementById("testSession").classList.contains("active")) return;
  if(!graded && ["1","2","3","4"].includes(e.key)){ selectChoice(Number(e.key)-1); }
  if(e.key==="Enter"){
    e.preventDefault();
    if(graded){
      if(document.getElementById("mcqCard").classList.contains("flipped")) nextQuestion();
      else document.getElementById("mcqCard").classList.add("flipped");
    }else if(selectedChoice!==null) gradeCurrent(false);
  }
});
populateUnits();
applyTestTheme(localStorage.getItem(THEME_KEY)||((matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light"));
updateTestStats();
