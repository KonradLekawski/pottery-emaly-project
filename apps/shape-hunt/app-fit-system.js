/* Fit System: 3-model preview, dimensional filters, and Road/Cup Holder screening. */
(function installFitSystem(){
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const TABLE_LIMITS={
    120:{height:[46,58],base:[58,68],rim:[74,84],label:'120 ml'},
    240:{height:[60,74],base:[66,78],rim:[86,100],label:'240 ml'},
    330:{height:[76,90],base:[70,82],rim:[94,108],label:'330 ml'}
  };
  const CUP_HOLDER={safe:71,many:77,large:83,depth:65};

  function num(v,f=0){return Number.isFinite(Number(v))?Number(v):f}
  function px(v){return `${Math.round(v)}px`}
  function between(v,r){return num(v)>=r[0]&&num(v)<=r[1]}
  function midScore(v,r){const c=(r[0]+r[1])/2,span=(r[1]-r[0])/2;return clamp(1-Math.abs(num(v)-c)/Math.max(1,span),0,1)}
  function asSize(shape,ml){return typeof familyAdapt==='function'?familyAdapt(shape,ml):shape}
  function tableFit(shape){
    const sizes=[120,240,330].map((ml)=>{const s=asSize(shape,ml),lim=TABLE_LIMITS[ml];const h=between(s.height,lim.height),b=between(s.base,lim.base),r=between(s.rim,lim.rim);const score=(midScore(s.height,lim.height)+midScore(s.base,lim.base)+midScore(s.rim,lim.rim))/3;return{ml,shape:s,pass:h&&b&&r,score,h,b,r,lim}});
    const press=num(shape.pressSafeScore,.75)>=.64&&num(shape.angularRisk,.20)<=.50;
    const score=(sizes.reduce((sum,s)=>sum+s.score,0)/sizes.length)*.72+(press ? 0.28 : 0.06);
    return{sizes,pass:sizes.every(s=>s.pass)&&press,score,press};
  }
  function roadConcept(shape,ml){
    const baseNarrow=ml===350 ? 0.76 : 0.78;
    const heightMul=ml===350 ? 1.46 : 1.72;
    const rimMul=ml===350 ? 0.82 : 0.86;
    const base=clamp(num(shape.base)*baseNarrow,62,79);
    const height=clamp(num(shape.height)*heightMul,108,168);
    const rim=clamp(num(shape.rim)*rimMul,74,96);
    const lidHeight=ml===350?16:20;
    const closureRing=clamp(rim+4,78,102);
    const sleeve=base<=CUP_HOLDER.safe?'fits most':base<=CUP_HOLDER.many?'fits many':base<=CUP_HOLDER.large?'large/adjustable only':'fails';
    const fitScore=base<=CUP_HOLDER.safe?1:base<=CUP_HOLDER.many?0.78:base<=CUP_HOLDER.large?0.42:0.10;
    const stabilityScore=height<=155?0.92:height<=168?0.70:0.42;
    const lidScore=closureRing<=98?0.82:0.60;
    return{ml,height,base,rim,lidHeight,closureRing,sleeve,fitScore,stabilityScore,lidScore,score:fitScore*.58+stabilityScore*.24+lidScore*.18};
  }
  function roadFit(shape){const models=[roadConcept(shape,350),roadConcept(shape,480)];return{models,pass:models.every(m=>m.fitScore>=.70),score:models.reduce((s,m)=>s+m.score,0)/models.length}}
  function fitClass(f){if(f>=.82)return'fit-good';if(f>=.58)return'fit-warn';return'fit-bad'}

  function installControls(){
    if(q('#fitFilter'))return;
    const host=q('#cultureNote')?.closest('.control-block')||q('#densityRange')?.closest('.control-block');
    const block=document.createElement('div');
    block.className='control-block fit-controls';
    block.innerHTML=`<label for="fitFilter">Automatic fit filter</label><select id="fitFilter"><option value="all">All shapes</option><option value="table">Table dimension fit</option><option value="press">Pressed steel safe</option><option value="road">Road / cup-holder potential</option></select><label class="toggle-row"><input id="threeModelCards" type="checkbox" checked/> Show 3 models immediately</label><p class="fit-note">Road screening: base ≤71 mm = most cup holders, 72–77 mm = many, above 77 mm needs larger/adjustable holders. Closure is marked as outsourced lid module.</p>`;
    host?.after(block);
    state.settings.fitFilter=state.settings.fitFilter||'all';
    state.settings.threeModelCards=state.settings.threeModelCards!==false;
    q('#fitFilter').value=state.settings.fitFilter;
    q('#threeModelCards').checked=Boolean(state.settings.threeModelCards);
    q('#fitFilter').addEventListener('change',(e)=>{state.settings.fitFilter=e.target.value;save();render()});
    q('#threeModelCards').addEventListener('change',(e)=>{state.settings.threeModelCards=e.target.checked;save();render()});
  }

  function installRoadView(){
    if(!q('.tab[data-view="road"]')){const tab=document.createElement('button');tab.className='tab';tab.dataset.view='road';tab.textContent='Road Fit';tab.addEventListener('click',()=>{state.view='road';render()});q('.tabs')?.appendChild(tab)}
    if(!q('#roadView')){const sec=document.createElement('section');sec.id='roadView';sec.className='view';sec.innerHTML='<div class="section-intro"><h3>Road / Cup Holder Fit</h3><p>Travel line is separate from Table Line. This screen only checks whether saved DNA can translate into a cup-holder-safe body and outsourced closure system.</p></div><div id="roadFitBoard"></div>';q('.main')?.appendChild(sec)}
  }

  const originalFiltered=filtered;
  filtered=function fitFiltered(){
    let arr=originalFiltered();
    const mode=state.settings.fitFilter||'all';
    if(mode==='table')arr=arr.filter(s=>tableFit(s).pass);
    if(mode==='press')arr=arr.filter(s=>num(s.pressSafeScore,.75)>=.70&&num(s.angularRisk,.25)<=.42);
    if(mode==='road')arr=arr.filter(s=>roadFit(s).score>=.66);
    return arr;
  };

  const originalCardHTML=cardHTML;
  cardHTML=function cardHTMLWithFamily(shape){
    if(state.settings.threeModelCards===false)return originalCardHTML(shape);
    const d=state.decisions[shape.id]||{};
    const chips=[];
    const tf=tableFit(shape),rf=roadFit(shape);
    if(tf.pass)chips.push('table fit');
    if(num(shape.pressSafeScore,.75)>.78)chips.push('pressed steel');
    if(rf.score>.70)chips.push('road potential');
    if(num(shape.angularRisk,.20)>.44)chips.push('angular risk');
    const family=[120,240,330].map(ml=>`<div class="mini-cup"><strong>${ml}</strong>${svg(shape,{familySize:ml,scale:ml===120?1.08:ml===330?.92:1.0})}<span>${ml<=240?'2H':'1H'}</span></div>`).join('');
    return `<div class="shape-art family-card-art"><div class="mini-family-strip">${family}</div></div><div class="shape-meta"><div><b>${shape.id}</b><br><span>${shape.archetypeName}</span></div><div class="card-actions"><button class="icon-btn" title="Good" data-act="good">G</button><button class="icon-btn" title="Bad" data-act="bad">B</button><button class="icon-btn" title="Save" data-act="save">${d.saved?'★':'S'}</button><button class="icon-btn" title="More like this" data-act="more">M</button></div></div><div class="score-row"><span>T ${Math.round(tf.score*100)}</span><span>P ${Math.round(num(shape.pressSafeScore,.75)*100)}</span><span>R ${Math.round(rf.score*100)}</span><span>A ${Math.round(num(shape.angularRisk,.2)*100)}</span></div><div class="card-chips">${chips.map(c=>`<span>${c}</span>`).join('')}</div>`;
  };

  const originalRenderFocus=renderFocus;
  renderFocus=function renderFocusWithFit(shape){
    originalRenderFocus(shape);
    q('#focusFitPanel')?.remove();
    const tf=tableFit(shape),rf=roadFit(shape);
    const panel=document.createElement('div');
    panel.id='focusFitPanel';
    panel.className='focus-fit-panel';
    panel.innerHTML=`<div class="eyebrow">Fit system</div><div class="fit-grid"><div class="${fitClass(tf.score)}"><strong>Table Line</strong><span>${tf.pass?'passes':'needs adjustment'}</span><small>${tf.sizes.map(s=>`${s.ml}: H${Math.round(s.shape.height)} B${Math.round(s.shape.base)} R${Math.round(s.shape.rim)}`).join(' · ')}</small></div><div class="${fitClass(num(shape.pressSafeScore,.75))}"><strong>Pressed steel</strong><span>${Math.round(num(shape.pressSafeScore,.75)*100)} / 100</span><small>angular risk ${Math.round(num(shape.angularRisk,.2)*100)}</small></div><div class="${fitClass(rf.score)}"><strong>Road potential</strong><span>${Math.round(rf.score*100)} / 100</span><small>${rf.models.map(m=>`${m.ml}: base ${Math.round(m.base)} mm, ${m.sleeve}`).join(' · ')}</small></div></div>`;
    q('.focus-panel')?.appendChild(panel);
  };

  function renderRoadFit(){
    const mount=q('#roadFitBoard'); if(!mount)return;
    const chosen=state.shapes.filter(s=>state.decisions[s.id]?.saved||state.decisions[s.id]?.rating==='good').sort((a,b)=>roadFit(b).score-roadFit(a).score).slice(0,18);
    const pool=chosen.length?chosen:filtered().sort((a,b)=>roadFit(b).score-roadFit(a).score).slice(0,18);
    if(!pool.length){mount.innerHTML=empty('No candidates for Road Fit yet.','Generate silhouettes first.');return}
    mount.innerHTML='<div class="road-grid"></div>';
    const grid=q('.road-grid',mount);
    pool.forEach(shape=>{const rf=roadFit(shape);const card=document.createElement('article');card.className='road-card';card.innerHTML=`<div class="road-head"><div><div class="eyebrow">${shape.archetypeName}</div><h3>${shape.id}</h3></div><button class="secondary" data-more>More like this</button></div><div class="road-models">${rf.models.map(m=>`<div class="road-model"><h4>${m.ml} ml road</h4><div class="road-cupholder"><div class="cupholder-ring"></div><div class="road-vessel" style="--basePx:${px(m.base*1.12)};--rimPx:${px(m.rim*1.12)};--heightPx:${px(m.height*1.12)}"><span class="lid"></span></div></div><p class="meta">H ${Math.round(m.height)} · base ${Math.round(m.base)} · rim ${Math.round(m.rim)} · closure ring ${Math.round(m.closureRing)}</p><p class="risk ${m.fitScore<.70?'warn':''}">${m.sleeve} · outsourced closure module</p></div>`).join('')}</div><p class="meta road-note">Cup-holder line should use a separate vertical body, gasket/lid supplier interface, and a base ≤71 mm for broadest fit.</p>`;
      card.addEventListener('click',e=>{if(e.target.closest('[data-more]'))return;openFocus(state.shapes.indexOf(shape))});
      q('[data-more]',card)?.addEventListener('click',()=>moreLike(shape));
      grid.appendChild(card);
    });
  }

  function patchRender(){
    if(window.__fitSystemPatched)return;window.__fitSystemPatched=true;
    const oldRender=render;
    render=function renderWithFitSystem(){oldRender();document.body.classList.toggle('three-model-cards',state.settings.threeModelCards!==false);qa('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===state.view));if(state.view==='road'){qa('.view').forEach(v=>v.classList.remove('active'));q('#roadView')?.classList.add('active');q('#viewTitle').textContent='Screen the travel line without forcing it into Table Line.';renderRoadFit()} };
  }

  function boot(){installControls();installRoadView();patchRender();render()}
  boot();
})();
