function exportProgress(){
  const blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="probability-card-progress.json"; a.click(); URL.revokeObjectURL(a.href);
}
function importProgress(file){
  const r=new FileReader();
  r.onload=()=>{
    try{
      const data=JSON.parse(r.result);
      if(!data.cards) throw new Error("Missing card data");
      db={cards:data.cards||{},history:data.history||[],streak:data.streak||0,lastStudy:data.lastStudy||null};
      saveDB(); alert("Progress imported.");
    }catch(e){ alert("Could not import that file: "+e.message); }
  }; r.readAsText(file);
}
function resetProgress(){
  if(confirm("Erase all scheduling history and restart all 60 cards?")){
    localStorage.removeItem(KEY); db=loadDB(); updateStats();
  }
}
function applyTheme(theme){
  document.documentElement.dataset.theme=theme; localStorage.setItem(THEME_KEY,theme);
}
