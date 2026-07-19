/* Research Generator v4: evidence-weighted geometry with non-recursive family scoring.
   This replaces v3 after a recursion bug: score -> metrics -> familyScore -> adapted -> score.
   Rule: family adaptations are plain geometry until explicitly scored for rendering. */
(function installResearchGeneratorV4(){
  const q=(s,r=document)=>r.querySelector(s);
  const C=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):0));
  const L=(a,b,t)=>a+(b-a)*t;
  const R=(v,p=3)=>{const m=10**p;return Math.round(Number(v||0)*m)/m};
  const J=(rand,a=1)=>(rand()-.5)*a;
  const S=(t)=>t*t*(3-2*t);
  const G=(t,c,w)=>Math.exp(-Math.pow((t-c)/Math.max(.001,w),2));
  const PER_CATEGORY=500;

  const GRAMMARS=[
    {id:'slavic-modern',short:'SLA',name:'Slavic Modern',desc:'grounded heirloom warmth; ritual table presence without folk literalism',base:{height:80,base:78,rim:102,belly:.64,waist:.28,foot:.76,lip:.38,shoulder:.48,quiet:.66,handle:.58,steelSoftness:.90},centers:{belly:.42,waist:.50,shoulder:.74,lip:.955,flow:.96}},
    {id:'viking-nordic-modern',short:'NOR',name:'Viking / Nordic Modern',desc:'low gravity, broad stability, northern restraint',base:{height:76,base:84,rim:98,belly:.42,waist:.14,foot:.60,lip:.24,shoulder:.32,quiet:.86,handle:.42,steelSoftness:.94},centers:{belly:.38,waist:.54,shoulder:.72,lip:.95,flow:.82}},
    {id:'japan-modern',short:'JPN',name:'Japan Modern',desc:'quiet low bowl-cup, precise foot, controlled rim',base:{height:72,base:74,rim:104,belly:.28,waist:.08,foot:.46,lip:.20,shoulder:.18,quiet:.94,handle:.34,steelSoftness:.96},centers:{belly:.34,waist:.58,shoulder:.70,lip:.94,flow:.72}},
    {id:'classic-modern',short:'CLA',name:'Classic Modern',desc:'balanced table cup, familiar but not generic',base:{height:82,base:76,rim:102,belly:.44,waist:.26,foot:.54,lip:.34,shoulder:.36,quiet:.72,handle:.50,steelSoftness:.90},centers:{belly:.40,waist:.50,shoulder:.74,lip:.955,flow:.90}},
    {id:'french-modern',short:'FRA',name:'French Modern',desc:'restrained salon tulip, lifted rim, elegant tension',base:{height:84,base:72,rim:108,belly:.36,waist:.46,foot:.52,lip:.62,shoulder:.56,quiet:.52,handle:.64,steelSoftness:.84},centers:{belly:.42,waist:.46,shoulder:.78,lip:.965,flow:1.04}},
    {id:'italian-modern',short:'ITA',name:'Italian Modern',desc:'cafe warmth, cappuccino softness, generous but controlled rim',base:{height:78,base:76,rim:110,belly:.62,waist:.30,foot:.46,lip:.54,shoulder:.62,quiet:.54,handle:.62,steelSoftness:.84},centers:{belly:.40,waist:.52,shoulder:.76,lip:.96,flow:.86}}
  ];

  function installCategories(){
    if(Array.isArray(archetypes)){
      archetypes.splice(0,archetypes.length,...GRAMMARS.map(g=>({id:g.id,name:g.name,description:g.desc,bias:g.base})));
    }
    const select=q('#archetypeFilter');
    if(select){
      select.innerHTML='<option value="all">All evidence grammars</option>';
      GRAMMARS.forEach(g=>{const o=document.createElement('option');o.value=g.id;o.textContent=g.name;select.appendChild(o)});
      if(!GRAMMARS.some(g=>g.id===state.settings.archetype))state.settings.archetype='all';
      select.value=state.settings.archetype;
      save();
    }
  }

  function installControls(){
    const density=q('#densityRange'), readout=q('.range-readout'), label=q('label[for="densityRange"]');
    state.settings.perCategory=Number(state.settings.perCategory||PER_CATEGORY);
    if(density){
      density.min='100'; density.max='700'; density.step='50'; density.value=state.settings.perCategory;
      density.addEventListener('input',e=>{
        state.settings.perCategory=Number(e.target.value);
        state.settings.density=Number(e.target.value);
        const v=q('#densityValue'); if(v)v.textContent=e.target.value;
        save();
      });
    }
    if(label)label.textContent='Per evidence grammar';
    if(readout)readout.innerHTML=`<span id="densityValue">${state.settings.perCategory}</span> evidence-weighted silhouettes / grammar`;
    if(!q('#researchGenerateBtn')){
      const b=document.createElement('button');
      b.id='researchGenerateBtn'; b.className='primary'; b.textContent='Generate evidence-weighted batch';
      b.addEventListener('click',()=>generateBatch(Number(state.settings.perCategory||PER_CATEGORY)));
      q('.sidebar-actions')?.prepend(b);
    }
    if(!q('#researchGeneratorNote')){
      const note=document.createElement('p');
      note.id='researchGeneratorNote'; note.className='research-note';
      note.textContent='Research Generator v4: evidence changes geometry directly; family scoring is non-recursive and softened for pressed steel.';
      q('#archetypeFilter')?.closest('.control-block')?.appendChild(note);
    }
  }

  function features(grammar,rand,over={}){
    const b=grammar.base;
    const f={
      height:C((over.height??over.h)??(b.height+J(rand,7)),58,98),
      base:C(over.base??(b.base+J(rand,6)),56,92),
      rim:C(over.rim??(b.rim+J(rand,7)),82,118),
      belly:C(over.belly??(b.belly+J(rand,.12)),.06,.86),
      waist:C(over.waist??(b.waist+J(rand,.10)),0,.64),
      foot:C(over.foot??(b.foot+J(rand,.10)),.12,.90),
      lip:C(over.lip??(b.lip+J(rand,.11)),.05,.78),
      shoulder:C(over.shoulder??(b.shoulder+J(rand,.12)),.04,.82),
      quiet:C(over.quiet??(b.quiet+J(rand,.10)),.34,.98),
      handle:C(over.handle??(b.handle+J(rand,.14)),.18,.86),
      steelSoftness:C(over.steelSoftness??(b.steelSoftness+J(rand,.04)),.68,.98)
    };
    // Research priors before scoring: soft, recognisable, one gesture, not ceramic fantasy.
    if(f.waist>.52&&f.lip>.60)f.waist*=.82;
    if(f.lip>.68)f.lip=.68+(f.lip-.68)*.45;
    if(f.belly>.76&&f.rim>112)f.belly*=.92;
    if(f.height/Math.max(1,f.rim)>1.00)f.height*=.96;
    f.quiet=C(f.quiet+Math.max(0,f.waist-.52)*.10+Math.max(0,f.lip-.62)*.10,0,1);
    return f;
  }

  function make(id,grammar,rand,over={}){
    return score({...features(grammar,rand,over),id,archetypeId:grammar.id,archetypeName:grammar.name,archetypeDescription:grammar.desc,culturalCategory:grammar.id,grammarName:grammar.name,generatorVersion:'research-v4-nonrecursive'});
  }

  function anchor(grammar){
    return score({...grammar.base,id:`${grammar.short}_EVIDENCE_ANCHOR`,archetypeId:grammar.id,archetypeName:grammar.name,archetypeDescription:grammar.desc,culturalCategory:grammar.id,grammarName:grammar.name,generatorVersion:'research-v4-nonrecursive'});
  }

  function adaptPlain(shape,ml){
    if(ml===330)return shape;
    const delta=(v,center,scale)=>center+(Number(v)-center)*scale;
    const map={
      120:{height:52,base:63,rim:80,dh:.12,db:.18,dr:.18,belly:.68,waist:.42,foot:1.12,lip:.70,shoulder:.68,handle:1.16,quiet:.06},
      240:{height:68,base:72,rim:94,dh:.18,db:.22,dr:.22,belly:.82,waist:.64,foot:1.06,lip:.84,shoulder:.82,handle:1.08,quiet:.03}
    }[ml];
    if(!map)return shape;
    return {
      ...shape,
      id:`${shape.id}_${ml}`,
      height:C(delta(shape.height,82,map.dh)+(map.height-82),ml===120?46:60,ml===120?58:74),
      base:C(delta(shape.base,76,map.db)+(map.base-76),ml===120?58:66,ml===120?68:78),
      rim:C(delta(shape.rim,102,map.dr)+(map.rim-102),ml===120?74:86,ml===120?84:100),
      belly:C(shape.belly*map.belly,0,1),
      waist:C(shape.waist*map.waist,0,1),
      foot:C(shape.foot*map.foot,0,1),
      lip:C(shape.lip*map.lip,0,1),
      shoulder:C(shape.shoulder*map.shoulder,0,1),
      handle:C((shape.handle||.5)*map.handle,0,1),
      quiet:C((shape.quiet||.6)+map.quiet,0,1),
      generatorVersion:shape.generatorVersion||'research-v4-nonrecursive'
    };
  }

  function rawProfile(shape,ml=330){
    const s=ml===330?shape:adaptPlain(shape,ml);
    const grammar=GRAMMARS.find(g=>g.id===s.archetypeId)||GRAMMARS[3], cc=grammar.centers;
    const h=s.height, baseR=s.base/2, rimR=s.rim/2;
    const bellyAmp=L(1.0,8.5,s.belly), waistAmp=L(0.0,3.7,s.waist), footAmp=L(0.4,3.8,s.foot), lipAmp=L(0.3,3.6,s.lip), shoulderAmp=L(.2,4.6,s.shoulder);
    const points=[];
    for(let i=0;i<=74;i++){
      const t=i/74;
      const baseFlow=baseR+(rimR-baseR)*(0.12*t+0.88*Math.pow(S(t),cc.flow));
      let r=baseFlow;
      r+=bellyAmp*G(t,cc.belly,.24+s.quiet*.035)*(1-.18*t);
      r-=waistAmp*G(t,cc.waist,.19+s.steelSoftness*.05);
      r-=footAmp*.72*G(t,.065,.060+s.steelSoftness*.030);
      r+=footAmp*.58*G(t,.155,.080+s.steelSoftness*.030);
      r+=shoulderAmp*G(t,cc.shoulder,.16+s.steelSoftness*.035);
      r+=lipAmp*G(t,cc.lip,.070+s.steelSoftness*.022);
      points.push({y:t*h,r:Math.max(11,r)});
    }
    return soften(points,Math.round(3+s.steelSoftness*4));
  }

  function soften(points,passes=5){
    let out=points.map(p=>({...p}));
    for(let pass=0;pass<passes;pass++){
      out=out.map((p,i)=>{
        if(i===0||i===out.length-1)return p;
        const a=out[i-1],b=out[i],c=out[i+1];
        return {y:b.y,r:a.r*.22+b.r*.56+c.r*.22};
      });
    }
    return out;
  }

  function camping(shape,hToRim){
    return C(Math.max(0,.30-shape.foot)/.30*.28+Math.max(0,hToRim-1.02)/.32*.24+Math.max(0,.18-shape.waist)/.18*Math.max(0,.28-shape.belly)/.28*.20+Math.max(0,.18-Math.abs((shape.rim-shape.base)/shape.rim))/.18*.28,0,1);
  }

  function band(v,lo,hi){const mid=(lo+hi)/2,spread=(hi-lo)/2;return C(1-Math.abs(v-mid)/Math.max(.001,spread),0,1)}

  function ratioScoreFor(shape,ml){
    const bands={120:[.60,.78],240:[.68,.84],330:[.78,.94]};
    const s=ml===330?shape:adaptPlain(shape,ml);
    return band(s.height/Math.max(1,s.rim),...bands[ml]);
  }

  function familyScore(shape){
    const scores=[120,240,330].map(ml=>ratioScoreFor(shape,ml));
    const bases=[adaptPlain(shape,120).base,adaptPlain(shape,240).base,shape.base];
    const sane=bases.every((b,i)=>i===0||b>=bases[i-1]-1);
    return C(scores.reduce((a,b)=>a+b,0)/3*(sane?1:.82),0,1);
  }

  function handleScore(shape){return C(1-Math.abs((shape.handle||.5)-.58)/.46,0,1)}

  function metrics(shape){
    const pts=rawProfile(shape,330), h=shape.height;
    const radii=pts.map(p=>p.r), maxR=Math.max(...radii), midPts=pts.filter(p=>p.y>h*.25&&p.y<h*.72).map(p=>p.r), minMid=Math.min(...midPts);
    let accel=0, kink=0;
    for(let i=2;i<pts.length;i++){
      const s1=pts[i-1].r-pts[i-2].r, s2=pts[i].r-pts[i-1].r, a=Math.abs(s2-s1);
      accel+=a; if(a>.58)kink++;
    }
    const angular=C(accel/(pts.length*.22)+kink*.018+Math.max(0,shape.waist-.56)*.18+Math.max(0,shape.lip-.68)*.14,0,1);
    const smooth=C(1-angular*.86,0,1);
    const hToRim=shape.height/Math.max(1,shape.rim), stability=shape.base/Math.max(1,shape.height), rimBase=shape.rim/Math.max(1,shape.base);
    const typical=C((1-Math.abs(hToRim-.84)/.26)*.35+(1-Math.abs(rimBase-1.33)/.34)*.25+Math.min(1,stability/.86)*.20+(1-camping(shape,hToRim))*0.20,0,1);
    const gestures=[shape.foot,shape.lip,shape.waist,shape.belly,shape.handle||.5].map(v=>C(Math.abs(v-.50)/.45));
    const sorted=[...gestures].sort((a,b)=>b-a);
    const signature=C(sorted[0]*.75+(1-sorted[1])*.25,0,1);
    const novelty=C(signature*.72+(1-Math.max(0,shape.lip-.76)*1.1-Math.max(0,shape.waist-.68)*1.0)*.28,0,1);
    const maya=C(Math.min(typical,novelty)*.64+((typical+novelty)/2)*.36,0,1);
    const waistSignal=C((maxR*2-minMid*2)/Math.max(1,maxR*2),0,1);
    const table=C((1-Math.abs(hToRim-.82)/.35)*.30+Math.min(1,stability/.90)*.28+shape.foot*.22+shape.quiet*.20,0,1);
    const soul=C(waistSignal*.22+shape.foot*.20+shape.lip*.17+shape.belly*.22+(1-Math.abs(shape.quiet-.60))*.19,0,1);
    const fam=familyScore(shape), handle=handleScore(shape);
    const enamel=C(smooth*.66+(1-Math.max(0,shape.lip-.72))*0.12+(1-Math.max(0,shape.waist-.62))*0.12+shape.steelSoftness*.10,0,1);
    const evidence=C(smooth*.27+maya*.22+fam*.18+handle*.08+enamel*.25,0,1);
    const camp=camping(shape,hToRim);
    return {hToRim:R(hToRim,2),stability:R(stability,2),angularRisk:R(angular,2),smoothCurvatureScore:R(smooth,2),typicalityScore:R(typical,2),noveltyScore:R(novelty,2),mayaScore:R(maya,2),familyCoherenceScore:R(fam,2),handleErgonomicsScore:R(handle,2),enamelEdgeScore:R(enamel,2),pressSafeScore:R(enamel,2),verifiedEvidenceScore:R(evidence,3),tableScore:R(table,2),soulScore:R(soul,2),campingRisk:R(camp,2),familyRisk:R(1-fam,2),massProxy:Math.round(h*(shape.base+shape.rim)*.0098+shape.foot*9+shape.belly*8+(shape.handle||.5)*5),recommendation:R(evidence*.52+table*.20+soul*.18+(1-camp)*.10,3)};
  }

  function score(shape){
    const m=metrics(shape);
    return Object.assign(shape,m,{evidenceScores:{smoothCurvatureScore:m.smoothCurvatureScore,mayaScore:m.mayaScore,familyCoherenceScore:m.familyCoherenceScore,handleErgonomicsScore:m.handleErgonomicsScore,enamelEdgeScore:m.enamelEdgeScore,verifiedEvidenceScore:m.verifiedEvidenceScore}});
  }

  function profile(shape,ml=330){return rawProfile(shape,ml)}

  function pathFrom(points,opt={}){
    const scale=opt.scale||1,top=opt.top||16,k=2.25*scale,cx=90,h=Math.max(...points.map(p=>p.y));
    const right=points.map(p=>`${(cx+p.r*k).toFixed(1)},${(top+(h-p.y)*k).toFixed(1)}`).join(' L ');
    const left=[...points].reverse().map(p=>`${(cx-p.r*k).toFixed(1)},${(top+(h-p.y)*k).toFixed(1)}`).join(' L ');
    return `M ${right} L ${left} Z`;
  }

  path=function researchPath(shape,opt={}){return pathFrom(profile(shape,opt.familySize||330),opt)};

  function handlePath(shape,opt={},side=1){
    const ml=opt.familySize||330, s=ml===330?shape:adaptPlain(shape,ml), pts=profile(shape,ml), scale=opt.scale||1,top=opt.top||16,k=2.25*scale,cx=90,h=Math.max(...pts.map(p=>p.y));
    const maxR=Math.max(...pts.filter(p=>p.y>h*.28&&p.y<h*.76).map(p=>p.r));
    const yTop=top+(h-h*(ml<=240?.66:.69))*k, yBot=top+(h-h*(ml<=240?.32:.35))*k, yMid=(yTop+yBot)/2;
    const inner=cx+side*(maxR*k+2), outer=(15+(s.handle||.5)*14+(ml<=240?7:2))*scale, xOut=inner+side*outer, hole=inner+side*Math.max(8,outer*.46), soft=7*scale;
    const outerP=`M ${inner.toFixed(1)},${yTop.toFixed(1)} C ${xOut.toFixed(1)},${(yTop-soft).toFixed(1)} ${xOut.toFixed(1)},${(yBot+soft).toFixed(1)} ${inner.toFixed(1)},${yBot.toFixed(1)} C ${(inner+side*5).toFixed(1)},${(yMid+5).toFixed(1)} ${(inner+side*5).toFixed(1)},${(yMid-5).toFixed(1)} ${inner.toFixed(1)},${yTop.toFixed(1)}`;
    const innerP=`M ${(inner+side*5).toFixed(1)},${(yTop+10*scale).toFixed(1)} C ${hole.toFixed(1)},${(yTop+5*scale).toFixed(1)} ${hole.toFixed(1)},${(yBot-5*scale).toFixed(1)} ${(inner+side*5).toFixed(1)},${(yBot-10*scale).toFixed(1)} C ${(inner+side*10).toFixed(1)},${(yMid+1).toFixed(1)} ${(inner+side*10).toFixed(1)},${(yMid-1).toFixed(1)} ${(inner+side*5).toFixed(1)},${(yTop+10*scale).toFixed(1)}`;
    return `${outerP} Z ${innerP} Z`;
  }

  function handles(shape,opt={}){const ml=opt.familySize||330,sides=ml<=240?[-1,1]:[1];return sides.map(side=>`<path d="${handlePath(shape,opt,side)}" fill="currentColor" fill-rule="evenodd" class="handle-path"/>`).join('')}

  svg=function researchSvg(shape,opt={}){
    const large=!!opt.large,vb=large?'0 0 180 260':'0 0 180 236',ty=large?239:225,ml=opt.familySize||330,s=ml===330?shape:score(adaptPlain(shape,ml)),bodyOnly=!!opt.bodyOnly||document.body.classList.contains('brutal-mode');
    const cap=large?`<text x="90" y="254" text-anchor="middle" class="svg-caption">H ${Math.round(s.height)} · base ${Math.round(s.base)} · rim ${Math.round(s.rim)} · Ev ${Math.round((s.verifiedEvidenceScore||.7)*100)}</text>`:'';
    return `<svg viewBox="${vb}" role="img" aria-label="${shape.id} silhouette"><line x1="24" x2="156" y1="${ty}" y2="${ty}" class="table-line"/>${bodyOnly?'':handles(shape,opt)}<path d="${path(shape,opt)}" fill="currentColor" class="body-path"/>${cap}</svg>`;
  };

  familyAdapt=function researchFamily(shape,ml){return ml===330?shape:score(adaptPlain(shape,ml))};
  enrich=function researchEnrich(shape){return score({...shape,generatorVersion:'research-v4-nonrecursive'})};
  designerRead=function researchRead(shape){const s=shape.verifiedEvidenceScore!==undefined?shape:score({...shape});const notes=[s.archetypeName||s.grammarName||'Research geometry'];if(s.smoothCurvatureScore>.78)notes.push('smooth curvature prior');if(s.mayaScore>.70)notes.push('MAYA balanced');if(s.pressSafeScore>.72)notes.push('pressed-steel soft');if(s.familyCoherenceScore>.70)notes.push('family coherent');if(s.campingRisk>.50)notes.push('camping warning');if(s.angularRisk>.42)notes.push('angularity warning');return `${notes.join(' · ')}.`};

  generateBatch=function researchBatch(n=state.settings.perCategory||PER_CATEGORY){
    const per=Number(n||PER_CATEGORY), selected=state.settings.archetype||q('#archetypeFilter')?.value||'all', cats=selected==='all'?GRAMMARS:GRAMMARS.filter(g=>g.id===selected), rand=rng(state.seed++), out=[];
    cats.forEach(grammar=>{out.push(anchor(grammar));const pool=[];for(let i=0;i<per*3;i++)pool.push(make(`${grammar.short}_${String(i+1).padStart(4,'0')}`,grammar,rand));pool.sort((a,b)=>b.verifiedEvidenceScore-a.verifiedEvidenceScore);out.push(...pool.slice(0,per));});
    state.shapes=out;state.settings.perCategory=per;state.settings.density=per;state.settings.geometryVersion='research-v4-nonrecursive';persistShapes();state.focusIndex=0;render();toast(`Generated ${out.length} research-weighted silhouettes from ${cats.length} grammar${cats.length===1?'':'s'}`);
  };

  moreLike=function researchMore(shape,n=260){
    const grammar=GRAMMARS.find(g=>g.id===shape.archetypeId)||GRAMMARS[3], rand=rng(Math.floor(Math.random()*999999)), pool=[];
    for(let i=0;i<n*3;i++){
      const t=i<n*1.8?.10:.20;
      pool.push(make(`MR_${shape.id}_${String(i+1).padStart(3,'0')}`,grammar,rand,{height:C(shape.height+J(rand,18*t),58,98),base:C(shape.base+J(rand,16*t),56,92),rim:C(shape.rim+J(rand,18*t),82,118),belly:C(shape.belly+J(rand,.32*t),.06,.86),waist:C(shape.waist+J(rand,.28*t),0,.64),foot:C(shape.foot+J(rand,.30*t),.12,.90),lip:C(shape.lip+J(rand,.30*t),.05,.78),shoulder:C(shape.shoulder+J(rand,.32*t),.04,.82),quiet:C(shape.quiet+J(rand,.22*t),.34,.98),handle:C((shape.handle||.5)+J(rand,.26*t),.18,.86),steelSoftness:C((shape.steelSoftness||.84)+J(rand,.12*t),.68,.98)}));
    }
    pool.sort((a,b)=>b.verifiedEvidenceScore-a.verifiedEvidenceScore);setDecision(shape.id,{moreLike:(state.decisions[shape.id]?.moreLike||0)+1,saved:true});addHistory(shape.id,'more-like-this-research-v4',{n});state.shapes=pool.slice(0,n).concat(state.shapes.filter(s=>s.id!==shape.id));persistShapes();state.view='gallery';closeFocus();render();toast(`Generated ${n} evidence-weighted variations around ${shape.id}`);
  };

  function boot(){
    installCategories();installControls();
    const needsFresh=!state.shapes.length||state.shapes.some(s=>s.generatorVersion!=='research-v4-nonrecursive');
    if(needsFresh)generateBatch(Number(state.settings.perCategory||PER_CATEGORY));else render();
  }

  boot();
})();