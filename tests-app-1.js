const QUESTIONS = window.QUESTIONS || [];
const TEST_KEY="mitx-probability-tests-v1";
const THEME_KEY="mitx-probability-theme";
let testDB=loadTestDB();
let testSession=[], testCursor=0, selectedChoice=null, graded=false, currentQuestion=null;
let sessionCorrect=0, sessionGraded=0, sessionMissed=[], testStarted=0, elapsedHandle=null, activeMode="";

function loadTestDB(){
  try{
    const data=JSON.parse(localStorage.getItem(TEST_KEY)||"{}");
    return {questions:data.questions||{},history:data.history||[]};
  }catch(e){ return {questions:{},history:[]}; }
}
function saveTestDB(){ localStorage.setItem(TEST_KEY,JSON.stringify(testDB)); updateTestStats(); }
function questionState(id){ return {attempts:0,correct:0,lastCorrect:null,lastAnswer:null,last:null,...(testDB.questions[id]||{})}; }
function shuffle(items){
  const a=[...items];
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function showScreen(id){
  document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}
function updateTestStats(){
  const states=QUESTIONS.map(q=>questionState(q.id));
  const attempted=states.filter(s=>s.attempts>0).length;
  const totalAttempts=states.reduce((n,s)=>n+s.attempts,0);
  const totalCorrect=states.reduce((n,s)=>n+s.correct,0);
  const missed=states.filter(s=>s.lastCorrect===false).length;
  document.getElementById("attemptedStat").textContent=attempted;
  document.getElementById("accuracyStat").textContent=totalAttempts?Math.round(100*totalCorrect/totalAttempts)+"%":"—";
  document.getElementById("missedStat").textContent=missed;
  document.getElementById("sessionsStat").textContent=testDB.history.length;
}
function priority(q){
  const s=questionState(q.id);
  if(s.attempts===0) return 10000+Math.random();
  const accuracy=s.correct/s.attempts;
  return (s.lastCorrect===false?5000:0)+(1-accuracy)*1000+Math.random();
}
function buildTest(mode,unitNo=null,ids=null){
  if(ids) return shuffle(QUESTIONS.filter(q=>ids.includes(q.id)));
  if(mode==="full") return shuffle(QUESTIONS);
  if(mode==="quick") return [...QUESTIONS].sort((a,b)=>priority(b)-priority(a)).slice(0,20);
  if(mode==="missed"){
    const missed=QUESTIONS.filter(q=>questionState(q.id).lastCorrect===false);
    return missed.length?shuffle(missed):[];
  }
  if(mode==="unit") return shuffle(QUESTIONS.filter(q=>q.unit_no===Number(unitNo)));
  return [];
}
function startTest(mode,unitNo=null,ids=null){
  const built=buildTest(mode,unitNo,ids);
  if(!built.length){
    alert(mode==="missed"?"No missed questions yet. Take a Quick 20 or Full test first.":"No questions are available for that selection.");
    return;
  }
  activeMode=mode; testSession=built; testCursor=0; selectedChoice=null; graded=false;
  sessionCorrect=0; sessionGraded=0; sessionMissed=[]; testStarted=Date.now();
  document.getElementById("testLabel").textContent=
    mode==="full"?"Full 60-question test":
    mode==="quick"?"Quick 20-question test":
    mode==="missed"?"Missed-question review":
    mode==="session-missed"?"Session-miss review":
    `Unit ${unitNo} focused test`;
  clearInterval(elapsedHandle);
  elapsedHandle=setInterval(updateElapsed,1000);
  updateElapsed(); showScreen("testSession"); renderQuestion();
}
function updateElapsed(){
  const seconds=Math.max(0,Math.floor((Date.now()-testStarted)/1000));
  document.getElementById("elapsedTime").textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,"0")}`;
}
function renderQuestion(){
  if(testCursor>=testSession.length){ finishTest(); return; }
  currentQuestion=testSession[testCursor]; selectedChoice=null; graded=false;
  const card=document.getElementById("mcqCard"); card.classList.remove("flipped");
  document.getElementById("questionUnit").textContent=`Unit ${currentQuestion.unit_no} · ${currentQuestion.unit}`;
  document.getElementById("questionTitle").textContent=`Question ${currentQuestion.id}`;
  document.getElementById("questionDifficulty").textContent=currentQuestion.difficulty;
  document.getElementById("questionPrompt").textContent=currentQuestion.prompt;
  document.getElementById("questionProgress").textContent=`${testCursor+1} / ${testSession.length}`;
  document.getElementById("testProgressBar").style.width=`${100*testCursor/testSession.length}%`;
  document.getElementById("liveScore").textContent=`${sessionCorrect} / ${sessionGraded}`;
  document.getElementById("checkBtn").disabled=true;
  document.getElementById("revealUngradedBtn").textContent="Skip & reveal";
  const letters=["A","B","C","D"];
  document.getElementById("choices").innerHTML=currentQuestion.choices.map((choice,i)=>
    `<button class="choice" data-choice="${i}"><span class="choice-letter">${letters[i]}</span><span>${escapeTestHTML(choice)}</span></button>`
  ).join("");
  document.querySelectorAll(".choice").forEach(btn=>btn.addEventListener("click",()=>selectChoice(Number(btn.dataset.choice))));
}
function escapeTestHTML(s){ const d=document.createElement('div'); d.textContent=String(s); return d.innerHTML; }
function selectChoice(index){
  if(graded) return;
  selectedChoice=index;
  document.querySelectorAll(".choice").forEach((btn,i)=>btn.classList.toggle("selected",i===index));
  document.getElementById("checkBtn").disabled=false;
}
function gradeCurrent(skipped=false){
  if(graded || (!skipped && selectedChoice===null)) return;
  graded=true;
  const correctIndex=currentQuestion.answer;
  const isCorrect=!skipped && selectedChoice===correctIndex;
  sessionGraded++;
  if(isCorrect) sessionCorrect++; else sessionMissed.push(currentQuestion.id);
  const state=questionState(currentQuestion.id);
  state.attempts++; if(isCorrect) state.correct++;
  state.lastCorrect=isCorrect; state.lastAnswer=selectedChoice; state.last=Date.now();
  testDB.questions[currentQuestion.id]=state; saveTestDB();
  document.querySelectorAll(".choice").forEach((btn,i)=>{
    btn.disabled=true;
    if(i===correctIndex) btn.classList.add("correct");
    if(selectedChoice===i && i!==correctIndex) btn.classList.add("incorrect");
  });
  populateReview(isCorrect,skipped);
  document.getElementById("liveScore").textContent=`${sessionCorrect} / ${sessionGraded}`;
  setTimeout(()=>document.getElementById("mcqCard").classList.add("flipped"),180);
}
function populateReview(isCorrect,skipped){
  const letters=["A","B","C","D"];
  const heading=document.getElementById("resultHeading");
  const badge=document.getElementById("resultBadge");
  badge.className="result-badge";
  if(skipped){
    heading.textContent="Skipped — review the solution";
    badge.textContent="Not answered"; badge.classList.add("ungraded-result");
  }else if(isCorrect){
    heading.textContent="Correct";
    badge.textContent="Correct"; badge.classList.add("correct-result");
  }else{
    heading.textContent="Not quite";
    badge.textContent="Incorrect"; badge.classList.add("wrong-result");
  }
  const i=currentQuestion.answer;
  document.getElementById("correctAnswer").innerHTML=`<b>Correct answer: ${letters[i]}</b> — ${escapeTestHTML(currentQuestion.choices[i])}`;
  document.getElementById("solutionSteps").innerHTML=currentQuestion.steps.map(s=>`<li>${escapeTestHTML(s)}</li>`).join("");
  document.getElementById("coreRule").textContent=currentQuestion.rule;
  document.getElementById("questionTrap").textContent=currentQuestion.trap;
  document.getElementById("nextQuestionBtn").textContent=testCursor===testSession.length-1?"Finish test":"Next question";
}
function nextQuestion(){ if(!graded) return; testCursor++; renderQuestion(); }
