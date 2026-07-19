/* Stability Guard: final event-delegation and safe-render layer.
   Purpose: keep navigation, card actions and map decisions clickable even when prototype layers disagree. */
(function installStabilityGuard(){
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const VIEW_IDS={gallery:'galleryView',shortlist:'shortlistView',tournament:'tournamentView',family:'familyView',map:'mapView',review:'reviewView',road:'roadView',evidence:'evidenceView',maplab:'maplabView'};
  const SCORES={good:1,bad:-1,save:2,clear:0};
  let rendering=false;

  function appReady(){return typeof state==='object'&&Array.isArray(state.shapes)}
  function persist(){try{if(typeof save==='function')save()}catch(error){console.warn('[stability] save failed',error)}}
  function findShape(id){return appReady()?state.shapes.find((shape)=>shape.id===id):null}
  function findShapeIndex(id){return appReady()?state.shapes.findIndex((shape)=>shape.id===id):-1}
  function decision(id){return appReady()?(state.decisions[id]||{}):{}}
  function setLocalDecision(id,patch){if(!appReady())return;state.decisions[id]={...decision(id),...patch,updatedAt:new Date().toISOString()};persist()}
  function history(id,event,extra={}){try{if(typeof addHistory==='function')addHistory(id,event,extra);else if(appReady()){state.history.push({id,event,at:new Date().toISOString(),...extra});persist()}}catch(error){console.warn('[stability] history failed',error)}}

  function forceView(view){
    qa('.tab[data-view]').forEach((tab)=>tab.classList.toggle('active',tab.dataset.view===view));
    qa('.view').forEach((section)=>section.classList.remove('active'));
    const id=VIEW_IDS[view]||`${view}View`;
    q(`#${id}`)?.classList.add('active');
  }

  function showRuntimeError(error){
    console.error('[Shape Hunt runtime]',error);
    let box=q('#runtimeGuardError');
    if(!box){
      box=document.createElement('div');
      box.id='runtimeGuardError';
      box.className='runtime-guard-error';
      document.body.appendChild(box);
    }
    box.innerHTML='<strong>Shape Hunt recovered from a runtime error.</strong><span>Check the console; UI controls were kept active by Stability Guard.</span>';
  }

  function normalizeCards(){
    qa('.shape-card').forEach((card)=>{
      const id=card.dataset.id||card.querySelector('.shape-meta b')?.textContent?.trim();
      if(id)card.dataset.id=id;
      qa('button[data-action]',card).forEach((button)=>{if(!button.dataset.act)button.dataset.act=button.dataset.action;button.removeAttribute('data-action')});
    });
  }

  function paintDecisionState(){
    if(!appReady())return;
    normalizeCards();
    qa('.shape-card[data-id]').forEach((card)=>{
      const d=decision(card.dataset.id);
      card.dataset.state=d.rating||'';
      card.dataset.saved=d.saved?'true':'false';
    });
    qa('.maplab-dot, .shape-map circle[data-id]').forEach((dot)=>{
      const id=dot.dataset.id;if(!id)return;
      const d=decision(id);
      if(!dot.dataset.originalFill)dot.dataset.originalFill=dot.getAttribute('fill')||'#161514';
      dot.classList.remove('map-decision-good','map-decision-bad','map-decision-saved','map-decision-neutral');
      const cls=d.saved?'saved':d.rating==='good'?'good':d.rating==='bad'?'bad':'neutral';
      dot.classList.add(`map-decision-${cls}`);
      dot.setAttribute('fill',d.saved?'#a98245':d.rating==='good'?'#1f7a4d':d.rating==='bad'?'#9a352c':dot.dataset.originalFill);
      dot.setAttribute('data-map-score',d.mapScore??(d.saved?2:d.rating==='good'?1:d.rating==='bad'?-1:0));
      dot.setAttribute('tabindex','0');
      dot.setAttribute('role','button');
    });
    try{if(typeof updateStats==='function')updateStats()}catch{}
  }

  function afterRender(){
    if(appReady())forceView(state.view||'gallery');
    paintDecisionState();
  }

  function guardedRender(){
    if(rendering)return;
    rendering=true;
    try{guardedRender.previous?.()}catch(error){showRuntimeError(error)}finally{rendering=false;afterRender()}
  }

  if(typeof render==='function'&&!window.__shapeHuntStabilityRenderGuard){
    window.__shapeHuntStabilityRenderGuard=true;
    guardedRender.previous=render;
    render=function stableRender(){guardedRender()};
  }

  function scoreAction(id,mode){
    const shape=findShape(id);
    if(!shape)return;
    const d=decision(id);
    if(mode==='good')setLocalDecision(id,{rating:'good',mapScore:SCORES.good});
    if(mode==='bad')setLocalDecision(id,{rating:'bad',saved:false,mapScore:SCORES.bad});
    if(mode==='save')setLocalDecision(id,{saved:!d.saved,rating:!d.saved?(d.rating||'good'):d.rating,mapScore:!d.saved?SCORES.save:(d.rating==='good'?1:d.rating==='bad'?-1:0)});
    if(mode==='clear')setLocalDecision(id,{rating:'',saved:false,mapScore:SCORES.clear});
    history(id,`stable-${mode}`);
    render();
  }

  function runAction(id,mode){
    const shape=findShape(id),index=findShapeIndex(id);
    if(!shape||index<0)return;
    if(mode==='more'){
      try{if(typeof moreLike==='function')moreLike(shape);else scoreAction(id,'save')}catch(error){showRuntimeError(error)}
      return;
    }
    if(mode==='inspect'){
      try{if(typeof openFocus==='function')openFocus(index)}catch(error){showRuntimeError(error)}
      return;
    }
    scoreAction(id,mode);
  }

  document.addEventListener('click',(event)=>{
    const tab=event.target.closest?.('.tab[data-view]');
    if(tab){
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();
      if(appReady()){state.view=tab.dataset.view;persist();render()}else forceView(tab.dataset.view);
      return;
    }

    const cardButton=event.target.closest?.('.shape-card button[data-act], .shape-card button[data-action]');
    if(cardButton){
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();
      const card=cardButton.closest('.shape-card');
      const id=card?.dataset.id||card?.querySelector('.shape-meta b')?.textContent?.trim();
      const mode=cardButton.dataset.act||cardButton.dataset.action;
      if(id&&mode)runAction(id,mode);
      return;
    }

    const cardArt=event.target.closest?.('.shape-card .shape-art');
    if(cardArt){
      const card=cardArt.closest('.shape-card');
      const id=card?.dataset.id||card?.querySelector('.shape-meta b')?.textContent?.trim();
      if(id){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();runAction(id,'inspect')}
      return;
    }

    const focusMap={focusGood:'good',focusBad:'bad',focusSave:'save',focusMore:'more'};
    const focusButton=event.target.closest?.('#focusGood,#focusBad,#focusSave,#focusMore');
    if(focusButton&&appReady()){
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();
      const shape=state.shapes[state.focusIndex];
      if(shape)runAction(shape.id,focusMap[focusButton.id]);
      return;
    }

    const dot=event.target.closest?.('.maplab-dot, .shape-map circle[data-id]');
    if(dot){
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();
      const mode=state.settings?.mapClickMode||'inspect';
      runAction(dot.dataset.id,mode);
    }
  },true);

  document.addEventListener('keydown',(event)=>{
    const dot=event.target.closest?.('.maplab-dot, .shape-map circle[data-id]');
    if(dot&&(event.key==='Enter'||event.key===' ')){
      event.preventDefault();
      runAction(dot.dataset.id,state.settings?.mapClickMode||'inspect');
    }
  },true);

  function boot(){
    try{afterRender()}catch(error){showRuntimeError(error)}
    try{if(typeof render==='function')render()}catch(error){showRuntimeError(error)}
  }

  boot();
})();
