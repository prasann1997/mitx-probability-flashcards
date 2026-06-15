function reveal(){
  if(revealed) return;
  revealed=true;
  document.getElementById("frontView").style.display="none";
  document.getElementById("answerView").classList.add("visible");
  document.getElementById("revealRow").style.display="none";
  document.getElementById("ratingRow").classList.add("visible");
}
function previewIntervals(id){
  const s=getState(id);
  const calc=(r)=>{
    let interval=s.interval||0,ease=s.ease||2.5,reps=s.reps||0;
    if(r==="again") interval=1;
    if(r==="hard") interval=reps===0?2:Math.max(2,Math.round(interval*1.2));
    if(r==="good") interval=reps===0?1:(reps===1?6:Math.max(2,Math.round(interval*ease)));
    if(r==="easy") interval=reps===0?4:Math.max(4,Math.round(interval*ease*1.3));
    return interval;
  };
  return {again:calc("again"),hard:calc("hard"),good:calc("good"),easy:calc("easy")};
}
function updateIntervals(){
  const n=previewIntervals(current.id);
  ["again","hard","good","easy"].forEach(r=>document.getElementById(r+"Next").textContent=`next: ${n[r]} day${n[r]===1?"":"s"}`);
}
function grade(rating){
  if(!revealed) return;
  const old=getState(current.id);
  let s={...old}; let interval=0;
  if(rating==="again"){
    s.reps=0; s.lapses=(s.lapses||0)+1; s.ease=Math.max(1.3,(s.ease||2.5)-0.2); interval=1;
    // Reinsert a missed card several positions later for same-session retrieval.
    const pos=Math.min(session.length,cursor+6);
    session.splice(pos,0,current);
    if(sessionMode!=="due" && session.length>60) session.pop();
  }else if(rating==="hard"){
    s.reps=(s.reps||0)+1; s.ease=Math.max(1.3,(s.ease||2.5)-0.15);
    interval=old.reps===0?2:Math.max(2,Math.round((old.interval||1)*1.2));
  }else if(rating==="good"){
    s.reps=(s.reps||0)+1;
    interval=old.reps===0?1:(old.reps===1?6:Math.max(2,Math.round((old.interval||1)*(old.ease||2.5))));
  }else{
    s.reps=(s.reps||0)+1; s.ease=Math.min(3.2,(s.ease||2.5)+0.15);
    interval=old.reps===0?4:Math.max(4,Math.round((old.interval||1)*(old.ease||2.5)*1.3));
  }
  s.interval=interval; s.due=todayKey()+interval*DAY; s.last=Date.now(); s.lastRating=rating;
  db.cards[current.id]=s; grades.push(rating); saveDB();
  cursor++; renderCard();
}
function finishSession(){
  clearInterval(timerHandle);
  const elapsed=Math.max(1,Math.round((Date.now()-sessionStart)/60000));
  const good=grades.filter(g=>g==="good"||g==="easy").length;
  const pct=grades.length?Math.round(good/grades.length*100):0;
  updateStreak();
  db.history.push({date:Date.now(),reviews:grades.length,good:pct,minutes:elapsed});
  db.history=db.history.slice(-100); saveDB();
  document.getElementById("completeCards").textContent=grades.length;
  document.getElementById("completeGood").textContent=pct+"%";
  document.getElementById("completeTime").textContent=elapsed+"m";
  document.getElementById("completeText").textContent=`You completed ${grades.length} retrievals. Cards graded Again will return sooner, while strong cards receive longer intervals.`;
  show("complete");
}
function updateStreak(){
  const t=todayKey(), last=db.lastStudy?todayKey(new Date(db.lastStudy)):null;
  if(last===t) return;
  db.streak=(last===t-DAY)?(db.streak||0)+1:1;
  db.lastStudy=Date.now();
}
function endSession(){ if(confirm("End this session and keep reviews already recorded?")) finishSession(); }

function openLibrary(){
  const select=document.getElementById("unitFilter");
  if(select.options.length===1){
    [...new Set(CARDS.map(c=>c.unit_no))].forEach(n=>{
      const c=CARDS.find(x=>x.unit_no===n), o=document.createElement("option");
      o.value=n; o.textContent=`Unit ${n}: ${c.unit}`; select.appendChild(o);
    });
  }
  renderLibrary(); document.getElementById("libraryModal").classList.add("open");
}
function renderLibrary(){
  const q=document.getElementById("searchInput").value.toLowerCase().trim();
  const unit=document.getElementById("unitFilter").value;
  const filtered=CARDS.filter(c=>{
    const hay=[c.title,c.front,c.formula,c.trap,c.check,...c.points].join(" ").toLowerCase();
    return (!q||hay.includes(q)) && (!unit||String(c.unit_no)===unit);
  });
  document.getElementById("libraryList").innerHTML=filtered.map(c=>{
    const s=getState(c.id);
    return `<div class="library-item"><span class="pill">${String(c.id).padStart(2,"0")}</span><div><h4>${escapeHTML(c.title)}</h4><p>Unit ${c.unit_no} · ${escapeHTML(c.front)}</p></div><div class="due">${s.last?`Due ${fmtDate(s.due)}`:"New"}<br>${s.interval||0}d interval</div></div>`;
  }).join("") || "<p>No cards match.</p>";
}
