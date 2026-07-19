/* Shape Map Lab: richer variable map for finding which geometry features actually matter. */
(function installShapeMapLab(){
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,num(v)));
  const round=(v,p=2)=>{const m=10**p;return Math.round(num(v)*m)/m};
  const pct=(v)=>Math.round(clamp(v)*100);

  const FEATURES=[
    {key:'verifiedEvidenceScore',label:'Evidence score',group:'Evidence'},
    {key:'smoothCurvatureScore',label:'Smooth curvature',group:'Evidence'},
    {key:'mayaScore',label:'MAYA balance',group:'Evidence'},
    {key:'typicalityScore',label:'Typicality',group:'Evidence'},
    {key:'noveltyScore',label:'Novelty',group:'Evidence'},
    {key:'familyCoherenceScore',label:'Family coherence',group:'Family'},
    {key:'handleErgonomicsScore',label:'Handle ergonomics',group:'Family'},
    {key:'enamelEdgeScore',label:'Enamel / edge safety',group:'Production'},
    {key:'pressSafeScore',label:'Pressed steel score',group:'Production'},
    {key:'angularRisk',label:'Angular risk',group:'Production'},
    {key:'tableScore',label:'Table presence',group:'Brand'},
    {key:'soulScore',label:'Soul score',group:'Brand'},
    {key:'campingRisk',label:'Camping risk',group:'Brand'},
    {key:'recommendation',label:'Recommendation',group:'Model'},
    {key:'height',label:'Height',group:'Dimensions'},
    {key:'base',label:'Base diameter',group:'Dimensions'},
    {key:'rim',label:'Rim diameter',group:'Dimensions'},
    {key:'hToRim',label:'H / rim',group:'Dimensions'},
    {key:'stability',label:'Base / height',group:'Dimensions'},
    {key:'rimBaseRatio',label:'Rim / base',group:'Dimensions'},
    {key:'massProxy',label:'Mass proxy',group:'Dimensions'},
    {key:'foot',label:'Foot signature',group:'Gesture'},
    {key:'lip',label:'Rim gesture',group:'Gesture'},
    {key:'waist',label:'Waist tension',group:'Gesture'},
    {key:'belly',label:'Belly warmth',group:'Gesture'},
    {key:'shoulder',label:'Shoulder',group:'Gesture'},
    {key:'quiet',label:'Quietness',group:'Gesture'},
    {key:'handle',label:'Handle energy',group:'Gesture'},
    {key:'roadPotentialScore',label:'Road potential',group:'Road'},
    {key:'tableFitScore',label:'Table dimension fit',group:'Fit'}
  ];
  const FEATURE_BY_KEY=Object.fromEntries(FEATURES.map(f=>[f.key,f]));

  const PRESETS={
    taste:{label:'Taste field',x:'tableScore',y:'soulScore',size:'verifiedEvidenceScore',color:'decision'},
    evidence:{label:'Research evidence',x:'smoothCurvatureScore',y:'mayaScore',size:'familyCoherenceScore',color:'verifiedEvidenceScore'},
    production:{label:'Production safety',x:'pressSafeScore',y:'angularRisk',size:'verifiedEvidenceScore',color:'angularRisk'},
    family:{label:'Family + handles',x:'familyCoherenceScore',y:'handleErgonomicsScore',size:'tableFitScore',color:'decision'},
    proportion:{label:'Proportions',x:'hToRim',y:'stability',size:'rimBaseRatio',color:'tableScore'},
    signature:{label:'Signature gesture',x:'foot',y:'lip',size:'waist',color:'soulScore'},
    road:{label:'Road transfer',x:'roadPotentialScore',y:'stability',size:'pressSafeScore',color:'decision'}
  };

  function tableFitScore(shape){
    const bands={120:{h:[46,58],b:[58,68],r:[74,84]},240:{h:[60,74],b:[66,78],r:[86,100]},330:{h:[76,90],b:[70,82],r:[94,108]}};
    const mid=(v,r)=>clamp(1-Math.abs(num(v)-(r[0]+r[1])/2)/Math.max(1,(r[1]-r[0])/2));
    const size=(ml)=>typeof familyAdapt==='function'?familyAdapt(shape,ml):shape;
    return [120,240,330].map(ml=>{const s=size(ml),b=bands[ml];return (mid(s.height,b.h)+mid(s.base,b.b)+mid(s.rim,b.r))/3}).reduce((a,b)=>a+b,0)/3;
  }

  function roadPotential(shape){
    const roadBase=num(shape.base)*0.76;
    if(roadBase<=71)return 1;
    if(roadBase<=77)return 0.78;
    if(roadBase<=83)return 0.42;
    return 0.10;
  }

  function value(shape,key){
    if(key==='rimBaseRatio')return num(shape.rim)/Math.max(1,num(shape.base));
    if(key==='roadPotentialScore')return roadPotential(shape);
    if(key==='tableFitScore')return tableFitScore(shape);
    return num(shape[key],0);
  }

  function shapePool(){
    const includeRejected=Boolean(state.settings.mapLabIncludeRejected);
    let list=includeRejected?state.shapes.slice():filtered();
    if(includeRejected && state.settings.archetype && state.settings.archetype!=='all')list=list.filter(s=>s.archetypeId===state.settings.archetype);
    return list.filter(Boolean);
  }

  function decision(shape){return state.decisions[shape.id]||{};}
  function decisionClass(shape){const d=decision(shape);return d.saved?'saved':d.rating==='good'?'good':d.rating==='bad'?'bad':'neutral'}
  function decisionColor(shape){const d=decision(shape);if(d.saved)return '#a98245';if(d.rating==='good')return '#1f7a4d';if(d.rating==='bad')return '#9a352c';return '#161514'}
  function heatColor(v,invert=false){const x=clamp(invert?1-v:v);const hue=20+x*130;return `hsl(${hue} 52% ${36+x*12}%)`}
  function colorFor(shape,key){if(key==='decision')return decisionColor(shape);if(key==='grammar')return grammarColor(shape.archetypeId);const v=normalized(shape,key);return heatColor(v,key.toLowerCase().includes('risk'))}
  function grammarColor(id){const colors=['#6f5030','#465f73','#566b58','#6a6256','#836185','#9a6a3f','#3f665f'];const ids=[...new Set(state.shapes.map(s=>s.archetypeId))];return colors[Math.max(0,ids.indexOf(id))%colors.length]}

  let currentExtents={};
  function normalized(shape,key){const ex=currentExtents[key];if(!ex)return clamp(value(shape,key));return clamp((value(shape,key)-ex.min)/Math.max(0.0001,ex.max-ex.min));}
  function extents(shapes,keys){currentExtents={};keys.forEach(k=>{const vals=shapes.map(s=>value(s,k)).filter(Number.isFinite);currentExtents[k]={min:Math.min(...vals),max:Math.max(...vals)}})}

  function selectOptions(selected,extra=[]){
    const groups={};FEATURES.forEach(f=>{groups[f.group]=groups[f.group]||[];groups[f.group].push(f)});
    const featureHTML=Object.entries(groups).map(([group,features])=>`<optgroup label="${group}">${features.map(f=>`<option value="${f.key}">${f.label}</option>`).join('')}</optgroup>`).join('');
    const extraHTML=extra.map(o=>`<option value="${o.value}">${o.label}</option>`).join('');
    return `${extraHTML}${featureHTML}`.replace(`value="${selected}"`,`value="${selected}" selected`);
  }

  function importantVariables(){
    const good=state.shapes.filter(s=>decision(s).saved||decision(s).rating==='good');
    const bad=state.shapes.filter(s=>decision(s).rating==='bad');
    if(good.length<2||bad.length<2)return [];
    const all=state.shapes;
    extents(all,FEATURES.map(f=>f.key));
    return FEATURES.map(f=>{
      const avg=(arr)=>arr.reduce((sum,s)=>sum+normalized(s,f.key),0)/Math.max(1,arr.length);
      const g=avg(good),b=avg(bad),delta=g-b;
      return {key:f.key,label:f.label,group:f.group,good:g,bad:b,delta,importance:Math.abs(delta)};
    }).sort((a,b)=>b.importance-a.importance).slice(0,14);
  }

  function renderImportance(){
    const rows=importantVariables();
    if(!rows.length)return `<div class="maplab-empty-small">Need at least 2 Good/Saved and 2 Bad decisions to calculate variable signal.</div>`;
    return `<div class="maplab-importance-list">${rows.map(r=>`<div class="maplab-importance-row"><span>${r.label}</span><div class="maplab-bar"><i style="width:${Math.round(r.good*100)}%"></i><b style="width:${Math.round(r.bad*100)}%"></b></div><strong>${r.delta>=0?'+':''}${round(r.delta,2)}</strong></div>`).join('')}</div>`;
  }

  function renderMapLab(){
    const mount=q('#mapLabStage');if(!mount)return;
    const shapes=shapePool();
    if(!shapes.length){mount.innerHTML=empty('No shapes to map.','Generate a batch or loosen filters.');return;}
    const preset=state.settings.mapLabPreset||'taste';const p=PRESETS[preset]||PRESETS.taste;
    const xKey=state.settings.mapLabX||p.x,yKey=state.settings.mapLabY||p.y,sizeKey=state.settings.mapLabSize||p.size,colorKey=state.settings.mapLabColor||p.color;
    extents(shapes,[xKey,yKey,sizeKey,colorKey,...FEATURES.map(f=>f.key)]);
    const W=1180,H=650,pad=64;
    const x=s=>pad+normalized(s,xKey)*(W-pad*2);
    const y=s=>H-pad-normalized(s,yKey)*(H-pad*2);
    const radius=s=>4+normalized(s,sizeKey)*8+(decision(s).saved?3:0);
    const points=shapes.map(s=>`<circle class="maplab-dot ${decisionClass(s)}" cx="${round(x(s),1)}" cy="${round(y(s),1)}" r="${round(radius(s),1)}" fill="${colorFor(s,colorKey)}" data-id="${s.id}"><title>${s.id} · ${s.archetypeName}\n${FEATURE_BY_KEY[xKey]?.label||xKey}: ${round(value(s,xKey),3)}\n${FEATURE_BY_KEY[yKey]?.label||yKey}: ${round(value(s,yKey),3)}</title></circle>`).join('');
    const selected=shapes.filter(s=>decision(s).saved||decision(s).rating==='good');
    const rejected=shapes.filter(s=>decision(s).rating==='bad');

    mount.innerHTML=`
      <div class="maplab-layout">
        <div class="maplab-main">
          <div class="maplab-toolbar">
            <label>Preset <select id="mapLabPreset">${Object.entries(PRESETS).map(([id,pr])=>`<option value="${id}">${pr.label}</option>`).join('')}</select></label>
            <label>X <select id="mapLabX">${selectOptions(xKey)}</select></label>
            <label>Y <select id="mapLabY">${selectOptions(yKey)}</select></label>
            <label>Size <select id="mapLabSize">${selectOptions(sizeKey)}</select></label>
            <label>Color <select id="mapLabColor">${selectOptions(colorKey,[{value:'decision',label:'Decision color'},{value:'grammar',label:'Grammar color'}])}</select></label>
            <label class="toggle-row"><input id="mapLabIncludeRejected" type="checkbox" ${state.settings.mapLabIncludeRejected?'checked':''}/> Include rejected</label>
            <button id="mapLabExport" class="secondary">Export map data</button>
          </div>
          <svg class="maplab-map" viewBox="0 0 ${W} ${H}" role="img" aria-label="Shape Map Lab">
            <rect x="0" y="0" width="${W}" height="${H}" rx="32" fill="#fbfaf7"/>
            <g class="maplab-gridlines">${[.25,.5,.75].map(t=>`<line x1="${pad+t*(W-pad*2)}" x2="${pad+t*(W-pad*2)}" y1="${pad}" y2="${H-pad}"/><line x1="${pad}" x2="${W-pad}" y1="${pad+t*(H-pad*2)}" y2="${pad+t*(H-pad*2)}"/>`).join('')}</g>
            <line x1="${pad}" x2="${W-pad}" y1="${H-pad}" y2="${H-pad}" class="maplab-axis"/>
            <line x1="${pad}" x2="${pad}" y1="${pad}" y2="${H-pad}" class="maplab-axis"/>
            <text x="${W/2}" y="${H-20}" text-anchor="middle" class="map-label">${FEATURE_BY_KEY[xKey]?.label||xKey}</text>
            <text x="22" y="${H/2}" transform="rotate(-90 22 ${H/2})" text-anchor="middle" class="map-label">${FEATURE_BY_KEY[yKey]?.label||yKey}</text>
            ${points}
          </svg>
        </div>
        <aside class="maplab-panel">
          <div class="maplab-card"><div class="eyebrow">Map stats</div><h3>${shapes.length}</h3><p class="meta">visible shapes · ${selected.length} selected · ${rejected.length} rejected</p></div>
          <div class="maplab-card"><div class="eyebrow">Important variables</div>${renderImportance()}</div>
          <div class="maplab-card"><div class="eyebrow">How to use</div><p class="meta">Use presets first. Then change axes to test a hypothesis: e.g. whether saved forms cluster around lower angularity, stronger foot, better family coherence or a specific proportion band.</p></div>
        </aside>
      </div>`;

    q('#mapLabPreset').value=preset;q('#mapLabX').value=xKey;q('#mapLabY').value=yKey;q('#mapLabSize').value=sizeKey;q('#mapLabColor').value=colorKey;
    q('#mapLabPreset').addEventListener('change',e=>{const pr=PRESETS[e.target.value];state.settings.mapLabPreset=e.target.value;state.settings.mapLabX=pr.x;state.settings.mapLabY=pr.y;state.settings.mapLabSize=pr.size;state.settings.mapLabColor=pr.color;save();renderMapLab()});
    [['#mapLabX','mapLabX'],['#mapLabY','mapLabY'],['#mapLabSize','mapLabSize'],['#mapLabColor','mapLabColor']].forEach(([sel,key])=>q(sel).addEventListener('change',e=>{state.settings[key]=e.target.value;save();renderMapLab()}));
    q('#mapLabIncludeRejected').addEventListener('change',e=>{state.settings.mapLabIncludeRejected=e.target.checked;save();renderMapLab()});
    qa('.maplab-dot',mount).forEach(dot=>dot.addEventListener('click',()=>openFocus(state.shapes.findIndex(s=>s.id===dot.dataset.id))));
    q('#mapLabExport').addEventListener('click',()=>exportMapLab(shapes,xKey,yKey,sizeKey,colorKey));
  }

  function exportMapLab(shapes,xKey,yKey,sizeKey,colorKey){
    const payload={schema:'shape-map-lab-v1',exportedAt:new Date().toISOString(),axes:{xKey,yKey,sizeKey,colorKey},features:FEATURES,importance:importantVariables(),shapes:shapes.map(s=>({id:s.id,archetypeId:s.archetypeId,archetypeName:s.archetypeName,decision:decision(s),values:Object.fromEntries(FEATURES.map(f=>[f.key,value(s,f.key)]))}))};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`shape-map-lab-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);
  }

  function install(){
    if(!q('.tab[data-view="maplab"]')){const tab=document.createElement('button');tab.className='tab';tab.dataset.view='maplab';tab.textContent='Map Lab';tab.addEventListener('click',()=>{state.view='maplab';render()});q('.tabs')?.appendChild(tab)}
    if(!q('#maplabView')){const sec=document.createElement('section');sec.id='maplabView';sec.className='view';sec.innerHTML='<div class="section-intro"><h3>Map Lab</h3><p>Explore the feature space behind taste. Pick axes, presets, color and size encodings to see which variables are actually driving Good / Bad / Saved decisions.</p></div><div id="mapLabStage"></div>';q('.main')?.appendChild(sec)}
  }

  function patch(){if(window.__shapeMapLabPatched)return;window.__shapeMapLabPatched=true;const old=render;render=function renderWithMapLab(){old();qa('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===state.view));if(state.view==='maplab'){qa('.view').forEach(v=>v.classList.remove('active'));q('#maplabView')?.classList.add('active');q('#viewTitle').textContent='Map the variables that actually matter.';renderMapLab()}}}
  install();patch();render();
})();
