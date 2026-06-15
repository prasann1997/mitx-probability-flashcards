const CARDS = window.CARDS || [];
const KEY="mitx-probability-cards-v2";
const THEME_KEY="mitx-probability-theme";
const DAY=86400000;
let db=loadDB();
let session=[], cursor=0, current=null, revealed=false, seconds=60, timerHandle=null, paused=false, sessionStart=0, grades=[], sessionMode="adaptive";

function todayKey(d=new Date()){ return new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime(); }
function fmtDate(ms){ const d=new Date(ms); return d.toLocaleDateString(undefined,{month:"short",day:"numeric"}); }
function defaultState(){ return {reps:0,interval:0,ease:2.5,due:todayKey(),lapses:0,last:null}; }
function loadDB(){
  try{
    const parsed=JSON.parse(localStorage.getItem(KEY)||"{}");
    return {cards:parsed.cards||{},history:parsed.history||[],streak:parsed.streak||0,lastStudy:parsed.lastStudy||null};
  }catch(e){ return {cards:{},history:[],streak:0,lastStudy:null}; }
}
function saveDB(){ localStorage.setItem(KEY,JSON.stringify(db)); updateStats(); }
function getState(id){ return {...defaultState(),...(db.cards[id]||{})}; }
function isDue(id){ return getState(id).due<=todayKey(); }
function mastery(id){ const s=getState(id); return s.reps>=3 && s.interval>=14; }

function updateStats(){
  const due=CARDS.filter(c=>isDue(c.id)).length;
  const seen=CARDS.filter(c=>getState(c.id).last).length;
  const mastered=CARDS.filter(c=>mastery(c.id)).length;
  document.getElementById("dueStat").textContent=due;
  document.getElementById("seenStat").textContent=seen;
  document.getElementById("masteredStat").textContent=mastered;
  document.getElementById("streakStat").textContent=db.streak||0;
}
function show(id){
  document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}
function priority(c){
  const s=getState(c.id);
  const overdue=Math.max(0,(todayKey()-s.due)/DAY);
  const unseen=s.last?0:10000;
  return unseen + overdue*100 + s.lapses*30 + Math.max(0,20-s.interval);
}
function buildSession(mode){
  const all=[...CARDS];
  if(mode==="sweep") return all;
  if(mode==="due"){
    const due=all.filter(c=>isDue(c.id)).sort((a,b)=>priority(b)-priority(a));
    return due.length?due:all.sort((a,b)=>priority(b)-priority(a)).slice(0,10);
  }
  const ordered=all.sort((a,b)=>priority(b)-priority(a));
  const result=[...ordered];
  // Adaptive mode always provides 60 distinct opening reviews. "Again" cards are reinserted during the session.
  return result.slice(0,60);
}
function startSession(mode){
  sessionMode=mode; session=buildSession(mode); cursor=0; grades=[]; sessionStart=Date.now();
  document.getElementById("sessionLabel").textContent=mode==="sweep"?"Full 60-card sweep":mode==="due"?"Due-card session":"Adaptive one-hour session";
  show("study"); renderCard();
}
function renderCard(){
  if(cursor>=session.length){ finishSession(); return; }
  current=session[cursor]; revealed=false; paused=false; seconds=60;
  document.getElementById("unitLabel").textContent=`Unit ${current.unit_no} · ${current.unit} · ${current.lecture}`;
  document.getElementById("cardTitle").textContent=current.title;
  document.getElementById("cardId").textContent=`Card ${String(current.id).padStart(2,"0")} / 60`;
  document.getElementById("prompt").textContent=current.front;
  document.getElementById("answerPoints").innerHTML=current.points.map(p=>`<li>${escapeHTML(p)}</li>`).join("");
  document.getElementById("formula").textContent=current.formula;
  document.getElementById("trap").textContent=current.trap;
  document.getElementById("check").textContent=current.check;
  document.getElementById("answerView").classList.remove("visible");
  document.getElementById("frontView").style.display="block";
  document.getElementById("revealRow").style.display="flex";
  document.getElementById("ratingRow").classList.remove("visible");
  document.getElementById("pauseBtn").textContent="Pause";
  const total=session.length;
  document.getElementById("progressText").textContent=`${cursor+1} / ${total}`;
  document.getElementById("progressBar").style.width=`${(cursor/total)*100}%`;
  updateIntervals();
  resetTimer();
}
function escapeHTML(s){ return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m])); }
function resetTimer(){
  clearInterval(timerHandle); updateTimer();
  timerHandle=setInterval(()=>{ if(!paused && seconds>0){ seconds--; updateTimer(); } },1000);
}
function updateTimer(){
  const el=document.getElementById("timer");
  el.textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,"0")}`;
  el.classList.toggle("low",seconds<=15&&seconds>0); el.classList.toggle("done",seconds===0);
}
