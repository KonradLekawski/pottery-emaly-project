/* Map Interaction Layer: persistent Good/Bad/Save scoring directly from Shape Map / Map Lab. */
(function installMapInteractionLayer(){
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const SCORE={good:1,bad:-1,save:2,neutral:0};

  function decision(id){return state.decisions[id]||{};}
  function shapeById(id){return state.shapes.find((shape)=>shape.id===id);}
  function shapeIndex(id){return state.shapes.findIndex((shape)=>shape.id===id);}
  function currentMode(){return state.settings.mapClickMode||'inspect';}
  function persistSettings(){if(typeof save==='function')save();}

  function setMapDecision(id,mode){
    const shape=shapeById(id);
    if(!shape)return;
    const previous=decision(id);
    let patch={mapTouchedAt:new Date().toISOString()};
    if(mode==='good')patch={...patch,rating:'good',mapScore:SCORE.good};
    if(mode==='bad')patch={...patch,rating:'bad',saved:false,mapScore:SCORE.bad};
    if(mode==='save')patch={...patch,saved:!previous.saved,rating:!previous.saved?(previous.rating||'good'):previous.rating,mapScore:!previous.saved?SCORE.save:(previous.rating==='bad'?SCORE.bad:previous.rating==='good'?SCORE.good:SCORE.neutral)};
    if(mode==='clear')patch={...patch,rating:'',saved:false,mapScore:SCORE.neutral};
    if(typeof setDecision==='function')setDecision(id,patch);else{state.decisions[id]={...previous,...patch};persistSettings();}
    if(typeof addHistory==='function')addHistory(id,`map-${mode}`,{mapMode:currentMode()});
    paintMapDots();
    if(typeof updateStats==='function')updateStats();
  }

  function runMapAction(id,mode){
    const index=shapeIndex(id);
    const shape=shapeById(id);
    if(index<0||!shape)return;
    if(mode==='inspect'){
      openFocus(index);
      return;
    }
    if(mode==='more'){
      if(typeof moreLike==='function')moreLike(shape);
      return;
    }
    setMapDecision(id,mode);
    if(typeof render==='function')render();
  }

  function dotDecisionClass(id){
    const d=decision(id);
    if(d.saved)return 'saved';
    if(d.rating==='good')return 'good';
    if(d.rating==='bad')return 'bad';
    return 'neutral';
  }

  function dotColor(id,current){
    const d=decision(id);
    if(d.saved)return '#a98245';
    if(d.rating==='good')return '#1f7a4d';
    if(d.rating==='bad')return '#9a352c';
    return current||'#161514';
  }

  function paintMapDots(){
    qa('.maplab-dot, .shape-map circle[data-id]').forEach((dot)=>{
      const id=dot.dataset.id;
      if(!id)return;
      if(!dot.dataset.originalFill)dot.dataset.originalFill=dot.getAttribute('fill')||'#161514';
      dot.classList.remove('map-decision-good','map-decision-bad','map-decision-saved','map-decision-neutral');
      const cls=dotDecisionClass(id);
      dot.classList.add(`map-decision-${cls}`);
      dot.setAttribute('fill',dotColor(id,dot.dataset.originalFill));
      dot.setAttribute('data-map-score',decision(id).mapScore??0);
      dot.setAttribute('tabindex','0');
      dot.setAttribute('role','button');
      dot.setAttribute('aria-label',`${id}: ${cls}. Click mode ${currentMode()}`);
    });
  }

  function installModeControls(rootSelector){
    const stage=q(rootSelector);
    if(!stage||q('.map-click-controls',stage))return;
    const controls=document.createElement('div');
    controls.className='map-click-controls';
    controls.innerHTML=`
      <div class="eyebrow">Map click mode</div>
      <div class="map-click-buttons">
        <button data-map-mode="inspect">Inspect</button>
        <button data-map-mode="good">Good</button>
        <button data-map-mode="bad">Bad</button>
        <button data-map-mode="save">Save</button>
        <button data-map-mode="more">More like this</button>
        <button data-map-mode="clear">Clear</button>
      </div>
      <p class="map-click-help">Dots are persistent: Good = green, Bad = red, Saved = gold. Decisions are stored in localStorage and exported with feedback.</p>`;
    stage.prepend(controls);
    qa('button[data-map-mode]',controls).forEach((button)=>{
      button.addEventListener('click',()=>{
        state.settings.mapClickMode=button.dataset.mapMode;
        persistSettings();
        refreshModeControls();
        paintMapDots();
      });
    });
    refreshModeControls();
  }

  function refreshModeControls(){
    qa('button[data-map-mode]').forEach((button)=>button.classList.toggle('active',button.dataset.mapMode===currentMode()));
  }

  function enhanceMaps(){
    installModeControls('#mapLabStage');
    installModeControls('#shapeMapStage');
    refreshModeControls();
    paintMapDots();
  }

  document.addEventListener('click',(event)=>{
    const dot=event.target.closest('.maplab-dot, .shape-map circle[data-id]');
    if(!dot)return;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
    runMapAction(dot.dataset.id,currentMode());
  },true);

  document.addEventListener('keydown',(event)=>{
    const dot=event.target.closest?.('.maplab-dot, .shape-map circle[data-id]');
    if(!dot)return;
    if(event.key==='Enter'||event.key===' '){
      event.preventDefault();
      runMapAction(dot.dataset.id,currentMode());
    }
  },true);

  if(typeof render==='function'&&!window.__mapInteractionRenderPatched){
    window.__mapInteractionRenderPatched=true;
    const previousRender=render;
    render=function renderWithMapInteraction(...args){
      previousRender(...args);
      enhanceMaps();
    };
  }

  enhanceMaps();
  if(typeof render==='function')render();
})();
