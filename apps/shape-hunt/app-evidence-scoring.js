/* Evidence scoring layer: turns research-backed primitives into visible scores and filters. */
(function installEvidenceScoring(){
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const BANDS={
    120:{ratio:[0.60,0.78],label:'120'},
    240:{ratio:[0.68,0.84],label:'240'},
    330:{ratio:[0.78,0.94],label:'330'}
  };
  const EVIDENCE_MODES={
    evidence:'Evidence-backed only',
    curvature:'High curvature preference',
    maya:'High MAYA',
    familyEvidence:'Strong family coherence'
  };

  function n(v,f=0){return Number.isFinite(Number(v))?Number(v):f}
  function c(v,a=0,b=1){return Math.max(a,Math.min(b,n(v)))}
  function pct(v){return Math.round(c(v)*100)}
  function ideal(v,target,spread){return c(1-Math.abs(n(v)-target)/Math.max(0.001,spread))}
  function band(v,[lo,hi]){const mid=(lo+hi)/2,spread=(hi-lo)/2;return ideal(v,mid,spread)}
  function sized(shape,ml){return typeof familyAdapt==='function'?familyAdapt(shape,ml):shape}

  function signatureGesture(shape){
    const gestures=[
      Math.abs(n(shape.foot)-0.52)/0.45,
      Math.abs(n(shape.lip)-0.42)/0.44,
      Math.abs(n(shape.waist)-0.30)/0.42,
      Math.abs(n(shape.belly)-0.48)/0.44,
      Math.abs(n(shape.handle||0.5)-0.50)/0.42
    ].map((value)=>c(value));
    const max=Math.max(...gestures);
    const second=[...gestures].sort((a,b)=>b-a)[1]||0;
    return c(max*0.72 + (1-Math.min(1,second))*0.28);
  }

  function typicality(shape){
    const ratio=n(shape.height)/Math.max(1,n(shape.rim));
    const rimBase=n(shape.rim)/Math.max(1,n(shape.base));
    const cupRatio=ideal(ratio,0.84,0.22);
    const opening=ideal(rimBase,1.32,0.30);
    const table=n(shape.tableScore,0.55);
    const camp=1-n(shape.campingRisk,0.25);
    return c(cupRatio*0.33 + opening*0.25 + table*0.25 + camp*0.17);
  }

  function novelty(shape){
    const gesture=signatureGesture(shape);
    const notTooFashion=1-c(Math.max(0,n(shape.waist)-0.70)*1.35 + Math.max(0,n(shape.lip)-0.80)*1.15 + Math.max(0,0.22-n(shape.quiet))*0.90);
    return c(gesture*0.70 + notTooFashion*0.30);
  }

  function maya(shape){
    const t=typicality(shape), nov=novelty(shape);
    return c(Math.min(t,nov)*0.62 + ((t+nov)/2)*0.38);
  }

  function ratioBandScore(shape){
    const scores=[120,240,330].map((ml)=>{
      const s=sized(shape,ml);
      return band(n(s.height)/Math.max(1,n(s.rim)),BANDS[ml].ratio);
    });
    return scores.reduce((sum,value)=>sum+value,0)/scores.length;
  }

  function smoothCurvature(shape){
    const angular=1-n(shape.angularRisk,0.25);
    const press=n(shape.pressSafeScore,0.75);
    const quiet=ideal(n(shape.quiet,0.60),0.64,0.42);
    const steel=c(n(shape.steelSoftness||shape.steel,0.82));
    return c(angular*0.42 + press*0.30 + quiet*0.16 + steel*0.12);
  }

  function familyCoherence(shape){
    const sizes=[120,240,330].map((ml)=>sized(shape,ml));
    const ratios=sizes.map((s)=>n(s.height)/Math.max(1,n(s.rim)));
    const ratioScore=ratioBandScore(shape);
    const baseStability=sizes.map((s)=>c((n(s.base)/Math.max(1,n(s.height))-.66)/.34)).reduce((a,b)=>a+b,0)/sizes.length;
    const toyRisk=1-c(Math.max(0,n(sizes[0].lip)-0.76)*0.70 + Math.max(0,n(sizes[0].waist)-0.60)*0.70);
    const spread=1-c((Math.max(...ratios)-Math.min(...ratios))/.38);
    return c(ratioScore*0.38 + baseStability*0.24 + toyRisk*0.20 + spread*0.18);
  }

  function handleErgonomics(shape){
    const handle=c(n(shape.handle,0.50));
    const child=c(1-Math.abs(handle-0.58)/0.44);
    const adult=c(1-Math.abs(handle-0.50)/0.42);
    const massPenalty=c((n(shape.massProxy,90)-105)/80);
    return c(child*0.36 + adult*0.36 + (1-massPenalty)*0.28);
  }

  function enamelRisk(shape){
    return c(n(shape.angularRisk,0.22)*0.48 + Math.max(0,n(shape.lip)-0.74)*0.24 + Math.max(0,n(shape.waist)-0.64)*0.18 + Math.max(0,n(shape.foot)-0.88)*0.10);
  }

  function evidence(shape){
    if(!shape) return {};
    const smooth=smoothCurvature(shape);
    const typ=typicality(shape);
    const nov=novelty(shape);
    const may=maya(shape);
    const ratio=ratioBandScore(shape);
    const fam=familyCoherence(shape);
    const handle=handleErgonomics(shape);
    const enamel=1-enamelRisk(shape);
    const verified=c(smooth*0.25 + may*0.20 + ratio*0.14 + fam*0.16 + handle*0.08 + enamel*0.17);
    const out={
      smoothCurvatureScore:smooth,
      typicalityScore:typ,
      noveltyScore:nov,
      mayaScore:may,
      ratioBandScore:ratio,
      familyCoherenceScore:fam,
      handleErgonomicsScore:handle,
      enamelEdgeScore:enamel,
      verifiedEvidenceScore:verified
    };
    shape.evidenceScores=out;
    Object.assign(shape,out);
    return out;
  }

  function allEvidence(){state.shapes.forEach(evidence)}
  function evidenceClass(v){return v>=0.78?'evidence-good':v>=0.58?'evidence-warn':'evidence-bad'}
  function badge(label,value){return `<span class="${evidenceClass(value)}">${label} ${pct(value)}</span>`}

  function installControls(){
    if(q('#evidenceFilterHelp')) return;
    const select=q('#fitFilter');
    if(select){
      Object.entries(EVIDENCE_MODES).forEach(([value,label])=>{
        if(!qa('option',select).some((option)=>option.value===value)){
          const option=document.createElement('option'); option.value=value; option.textContent=label; select.appendChild(option);
        }
      });
    }
    const host=select?.closest('.control-block') || q('#densityRange')?.closest('.control-block');
    const note=document.createElement('p');
    note.id='evidenceFilterHelp';
    note.className='evidence-note';
    note.textContent='Evidence scoring weights curvature preference, MAYA balance, proportion bands, family coherence, handle ergonomics and enamel/pressed-steel risk.';
    host?.appendChild(note);
  }

  function installEvidenceView(){
    if(!q('.tab[data-view="evidence"]')){
      const tab=document.createElement('button'); tab.className='tab'; tab.dataset.view='evidence'; tab.textContent='Evidence';
      tab.addEventListener('click',()=>{state.view='evidence'; render()});
      q('.tabs')?.appendChild(tab);
    }
    if(!q('#evidenceView')){
      const section=document.createElement('section');
      section.id='evidenceView'; section.className='view';
      section.innerHTML='<div class="section-intro"><h3>Evidence-ranked candidates</h3><p>Research does not choose the final cup. It gives stronger priors: smooth curvature, MAYA balance, harmonic proportion bands, family coherence, handle ergonomics and pressed-steel/enamel safety.</p></div><div class="evidence-source-note">Verified primitives require at least five credible sources. Directional primitives are shown as helpful signals, not final truth.</div><div id="evidenceBoard" class="evidence-board"></div>';
      q('.main')?.appendChild(section);
    }
  }

  const prevFiltered=filtered;
  filtered=function evidenceFiltered(){
    allEvidence();
    let arr=prevFiltered();
    const mode=state.settings.fitFilter||'all';
    if(mode==='evidence') arr=arr.filter((s)=>evidence(s).verifiedEvidenceScore>=0.72 && evidence(s).smoothCurvatureScore>=0.70 && evidence(s).enamelEdgeScore>=0.62);
    if(mode==='curvature') arr=arr.filter((s)=>evidence(s).smoothCurvatureScore>=0.80 && n(s.angularRisk,0.25)<=0.35);
    if(mode==='maya') arr=arr.filter((s)=>evidence(s).mayaScore>=0.68);
    if(mode==='familyEvidence') arr=arr.filter((s)=>evidence(s).familyCoherenceScore>=0.66);
    return arr;
  };

  const prevCardHTML=cardHTML;
  cardHTML=function evidenceCardHTML(shape){
    const scores=evidence(shape);
    const row=`<div class="evidence-row">${badge('Curve',scores.smoothCurvatureScore)}${badge('MAYA',scores.mayaScore)}${badge('Fam',scores.familyCoherenceScore)}${badge('Ev',scores.verifiedEvidenceScore)}</div>`;
    const html=prevCardHTML(shape);
    return html.includes('<div class="card-chips">') ? html.replace('<div class="card-chips">',`${row}<div class="card-chips">`) : `${html}${row}`;
  };

  const prevRenderFocus=renderFocus;
  renderFocus=function evidenceFocus(shape){
    prevRenderFocus(shape);
    q('#focusEvidencePanel')?.remove();
    const scores=evidence(shape);
    const panel=document.createElement('div');
    panel.id='focusEvidencePanel'; panel.className='focus-evidence-panel';
    panel.innerHTML=`<div class="eyebrow">Evidence scoring</div><div class="evidence-grid"><div class="${evidenceClass(scores.smoothCurvatureScore)}"><strong>Smooth curvature</strong><span>${pct(scores.smoothCurvatureScore)} / 100</span><small>Verified primitive: curved / rounded contours generally outperform angular forms.</small></div><div class="${evidenceClass(scores.mayaScore)}"><strong>MAYA balance</strong><span>${pct(scores.mayaScore)} / 100</span><small>Recognizable cup language plus one controlled signature gesture.</small></div><div class="${evidenceClass(scores.familyCoherenceScore)}"><strong>Family coherence</strong><span>${pct(scores.familyCoherenceScore)} / 100</span><small>120 / 240 / 330 proportions stay related without becoming clones.</small></div><div class="${evidenceClass(scores.enamelEdgeScore)}"><strong>Enamel / pressed steel</strong><span>${pct(scores.enamelEdgeScore)} / 100</span><small>Penalizes sharp lips, hard waists and aggressive feet.</small></div></div>`;
    q('.focus-panel')?.appendChild(panel);
  };

  function renderEvidenceBoard(){
    const mount=q('#evidenceBoard'); if(!mount) return;
    allEvidence();
    const shapes=[...state.shapes].sort((a,b)=>evidence(b).verifiedEvidenceScore-evidence(a).verifiedEvidenceScore).slice(0,30);
    if(!shapes.length){ mount.innerHTML=empty('No candidates yet.','Generate a batch first.'); return; }
    mount.innerHTML='';
    shapes.forEach((shape,index)=>{
      const scores=evidence(shape);
      const card=document.createElement('article'); card.className='evidence-card';
      card.innerHTML=`<div class="eyebrow">#${String(index+1).padStart(2,'0')} · ${shape.archetypeName}</div>${svg(shape,{large:true,scale:.82})}<h3>${shape.id}</h3><p class="meta">${designerRead(shape)}</p><div class="evidence-scoreline"><span>Curve ${pct(scores.smoothCurvatureScore)}</span><span>MAYA ${pct(scores.mayaScore)}</span><span>Family ${pct(scores.familyCoherenceScore)}</span><span>Evidence ${pct(scores.verifiedEvidenceScore)}</span></div>`;
      card.addEventListener('click',()=>openFocus(state.shapes.indexOf(shape)));
      mount.appendChild(card);
    });
  }

  const prevRender=render;
  render=function evidenceRender(){
    allEvidence();
    prevRender();
    qa('.tab').forEach((tab)=>tab.classList.toggle('active',tab.dataset.view===state.view));
    if(state.view==='evidence'){
      qa('.view').forEach((view)=>view.classList.remove('active'));
      q('#evidenceView')?.classList.add('active');
      q('#viewTitle').textContent='Rank candidates by research-backed geometry signals.';
      renderEvidenceBoard();
    }
  };

  function boot(){installControls();installEvidenceView();allEvidence();render()}
  boot();
})();
