(function(){
"use strict";
var $=function(s,c){return (c||document).querySelector(s)};
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

/* ---------- year ---------- */
var _yr=$('#yr'); if(_yr) _yr.textContent=new Date().getFullYear();

/* ---------- theme ---------- */
var root=document.documentElement;
try{var st=localStorage.getItem('nk-theme'); if(st) root.setAttribute('data-theme',st);}catch(e){}
if($('#tgl')) $('#tgl').addEventListener('click',function(){
  var cur=root.getAttribute('data-theme');
  if(!cur){cur=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
  var nx=cur==='dark'?'light':'dark';
  root.setAttribute('data-theme',nx);
  try{localStorage.setItem('nk-theme',nx);}catch(e){}
});

/* ---------- mobile nav ---------- */
var burger=$('#burger'),mnav=$('#mnav');
if(burger&&mnav) burger.addEventListener('click',function(){
  var open=mnav.classList.toggle('open');
  burger.setAttribute('aria-expanded',String(open));
  document.body.style.overflow=open?'hidden':'';
});
$$('#mnav a').forEach(function(a){a.addEventListener('click',function(){
  mnav.classList.remove('open');burger.setAttribute('aria-expanded','false');document.body.style.overflow='';
});});

/* ---------- reveal ---------- */
if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{rootMargin:'0px 0px -8% 0px',threshold:.06});
  $$('.rv').forEach(function(el){io.observe(el);});
}else{ $$('.rv').forEach(function(el){el.classList.add('in');}); }

/* ---------- academy tabs ---------- */
var tabs=$$('.tab');
tabs.forEach(function(t,i){
  t.addEventListener('click',function(){ select(i); });
  t.addEventListener('keydown',function(e){
    var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;
    if(d){e.preventDefault();var n=(i+d+tabs.length)%tabs.length;select(n);tabs[n].focus();}
  });
});
function select(i){
  tabs.forEach(function(t,j){
    t.setAttribute('aria-selected',String(j===i));
    $('#'+t.getAttribute('aria-controls')).hidden=(j!==i);
  });
}

/* ================= SAMPLE ASSESSMENT ================= */
var QUIZ=[
 {d:'AI Fundamentals',q:'Which statement best describes supervised learning?',
  o:['A model learns from labelled examples that pair inputs with known correct outputs','A model learns entirely without any data','A model learns only from reward signals after taking actions','A model groups unlabelled data into clusters'],a:0,
  c:'AI Fundamentals'},
 {d:'Generative AI',q:'In the context of large language models, what is a token?',
  o:['A security credential used to call the model API','A chunk of text — often a word fragment — that the model processes as one unit','Always exactly one English word','A trainable parameter inside the network'],a:1,
  c:'Generative AI Essentials'},
 {d:'Prompt Engineering',q:'What does few-shot prompting mean?',
  o:['Training the model on a small dataset','Reducing the maximum output length','Including a small number of worked input/output examples inside the prompt','Using a smaller, cheaper model'],a:2,
  c:'Prompt Engineering Foundations'},
 {d:'RAG & LLMs',q:'What is the primary purpose of retrieval-augmented generation?',
  o:['To ground responses in specific external data the model was not trained on','To make the model respond faster','To reduce the number of model parameters','To remove the need for any evaluation'],a:0,
  c:'Retrieval-Augmented Generation'},
 {d:'Machine Learning',q:'A model scores 99% on training data and 62% on held-out test data. The most likely explanation is:',
  o:['Underfitting','Overfitting','The model generalises well','The test set is too large'],a:1,
  c:'Machine Learning'},
 {d:'MLOps',q:'Model drift refers to:',
  o:['Weights changing during a training run','Gradual increase in inference latency','Performance degrading as real-world data diverges from the training distribution','Losing track of model versions in source control'],a:2,
  c:'MLOps & Production ML'},
 {d:'AI Agents',q:'For an agent that can take consequential actions in production systems, the most important safeguard is:',
  o:['A larger context window','A higher sampling temperature','Access to more tools','A defined blast radius with human approval gates and full audit logging'],a:3,
  c:'AI Agents & Agentic Systems'},
 {d:'AI Architecture',q:'Internal policy documents change weekly and answers must always reflect the current version. The better architectural choice is:',
  o:['Retrieval-augmented generation, because the knowledge changes faster than any retraining cycle','Fine-tuning the model again every week','Raising the temperature so the model varies its answers','Neither — the problem cannot be solved'],a:0,
  c:'AI Architecture'}
];
var LEVELS=[
 {min:0,n:'Foundational',p:'AI-curious professional',next:'Work through the fundamentals, then retake this assessment.'},
 {min:3,n:'Developing',p:'Junior AI Engineer / AI Developer',next:'Junior AI Engineer roles, with a portfolio project to evidence it.'},
 {min:5,n:'Proficient',p:'AI Engineer',next:'AI Engineer — next rung is Senior AI Engineer.'},
 {min:7,n:'Advanced',p:'Senior AI Engineer',next:'Senior AI Engineer — next rung is Staff AI Engineer or AI Architect.'},
 {min:8,n:'Expert',p:'Staff AI Engineer / AI Architect',next:'Staff, Principal, or Architect track — depth plus system-level ownership.'}
];
var qi=0,qAns=[];
var qStart=$('#quizStart'),qBody=$('#quizBody'),qRes=$('#quizRes'),qBar=$('#qBar');

if($('#qGo')) $('#qGo').addEventListener('click',function(){qi=0;qAns=[];qStart.hidden=true;qRes.hidden=true;qBody.hidden=false;paintQ();});
if($('#qBack')) $('#qBack').addEventListener('click',function(){ if(qi>0){qi--;paintQ();} else {qBody.hidden=true;qStart.hidden=false;qBar.style.width='0';} });

function paintQ(){
  var q=QUIZ[qi];
  $('#qMeta').textContent=q.d;
  $('#qText').textContent=q.q;
  $('#qPos').textContent='Question '+(qi+1)+' of '+QUIZ.length;
  qBar.style.width=((qi)/QUIZ.length*100)+'%';
  var box=$('#qOpts'); box.innerHTML='';
  q.o.forEach(function(txt,i){
    var b=document.createElement('button');
    b.type='button'; b.className='opt'+(qAns[qi]===i?' sel':''); b.textContent=txt;
    b.addEventListener('click',function(){
      qAns[qi]=i;
      if(qi<QUIZ.length-1){qi++;paintQ();}else{showRes();}
    });
    box.appendChild(b);
  });
}
function showRes(){
  qBar.style.width='100%';
  var right=[],wrong=[],score=0;
  QUIZ.forEach(function(q,i){ if(qAns[i]===q.a){score++;right.push(q);} else {wrong.push(q);} });
  var pct=Math.round(score/QUIZ.length*100);
  var lv=LEVELS[0]; LEVELS.forEach(function(l){ if(score>=l.min) lv=l; });
  var courses=wrong.length?wrong.map(function(q){return q.c;}):['AI Agents & Agentic Systems','AI Architecture','AI Security & Red-Teaming'];
  var html=''
   +'<div class="res-score"><span class="big">'+pct+'%</span>'
   +'<div><span class="lvl">'+lv.n+'</span><div class="tiny muted" style="margin-top:.45rem">'+score+' of '+QUIZ.length+' correct</div></div></div>'
   +'<div class="res-grid">'
   +'<div><h4>Strengths</h4><ul>'+(right.length?right.map(function(q){return '<li>'+q.d+'</li>';}).join(''):'<li style="opacity:.6">None identified at this level yet</li>')+'</ul></div>'
   +'<div class="gap"><h4>Skill gaps</h4><ul>'+(wrong.length?wrong.map(function(q){return '<li>'+q.d+'</li>';}).join(''):'<li>No gaps in this sample — try the advanced track</li>')+'</ul></div>'
   +'<div><h4>Recommended courses</h4><ul>'+courses.map(function(c){return '<li>'+c+'</li>';}).join('')+'</ul></div>'
   +'</div>'
   +'<div class="rec"><b>Recommended career path</b><p>'+lv.p+'</p><p class="why">'+lv.next+'</p></div>'
   +'<div class="panel-ft"><button class="btn btn-o btn-sm" id="qAgain">Retake</button><a class="btn btn-sm" href="#academy">Explore the Academy</a></div>';
  qBody.hidden=true; qRes.innerHTML=html; qRes.hidden=false;
  $('#qAgain').addEventListener('click',function(){qi=0;qAns=[];qRes.hidden=true;qBody.hidden=false;paintQ();});
}

/* ================= AI ADVISOR ================= */
var ADV=[
 {q:'What business problem are you trying to solve?',m:'Question 1 — the problem',
  o:[
   {t:'A manual, repetitive process is consuming too much staff time',s:{automation:3,agents:2,dev:1}},
   {t:'People cannot find answers across our documents and systems',s:{rag:4,dev:1}},
   {t:'We need to forecast, score, or predict something',s:{ml:4,dev:1}},
   {t:'We know AI matters but do not know where to start',s:{consult:4}},
   {t:'Compliance, risk, or governance is blocking our AI work',s:{gov:4,consult:1}},
   {t:'Our team does not have the AI skills we need',s:{train:4,talent:1}},
   {t:'We need AI people, not a project',s:{talent:4}},
   {t:'We built something with AI and it needs looking after',s:{managed:4}}
  ]},
 {q:'What industry are you in?',m:'Question 2 — context',
  o:[
   {t:'Healthcare, Insurance, Banking, or Financial Services',s:{gov:2,consult:1}},
   {t:'Manufacturing, Logistics, or Energy',s:{ml:1,automation:1}},
   {t:'Retail, E-commerce, or Consumer',s:{ml:1,rag:1}},
   {t:'Technology, SaaS, or Professional Services',s:{dev:1,agents:1}},
   {t:'Education, Government, or Nonprofit',s:{consult:1,train:1}},
   {t:'Something else',s:{}}
  ]},
 {q:'What technology are you currently using?',m:'Question 3 — starting point',
  o:[
   {t:'Mostly spreadsheets and manual processes',s:{consult:2,automation:1}},
   {t:'Legacy on-premise systems',s:{consult:2,dev:1}},
   {t:'A modern cloud stack, but no AI yet',s:{dev:2,rag:1}},
   {t:'We already run AI or ML in production',s:{managed:2,dev:1,gov:1}},
   {t:'Not sure',s:{consult:2}}
  ]},
 {q:'What kind of help do you want?',m:'Question 4 — the ask',
  o:[
   {t:'Consulting — help us decide what to do',s:{consult:3,gov:1}},
   {t:'Development — build the solution for us',s:{dev:3,agents:1,rag:1,ml:1}},
   {t:'Training — upskill our people',s:{train:4}},
   {t:'Talent — give us AI professionals',s:{talent:4}},
   {t:'Not sure yet',s:{consult:2}}
  ]},
 {q:'What is your expected timeline?',m:'Question 5 — urgency',
  o:[
   {t:'Immediate — within 4 weeks',s:{talent:2,managed:1}},
   {t:'1–3 months',s:{dev:1,automation:1,rag:1}},
   {t:'3–6 months',s:{dev:1,consult:1}},
   {t:'6+ months, or still exploring',s:{consult:2,train:1}}
  ]}
];
var RECS={
 consult:{n:'AI Consulting — start with an AI Readiness Assessment',
   d:'A 4–6 week assessment that maps your processes, scores every AI opportunity on value and feasibility, tests your data against the top candidates, and returns a ranked portfolio with a build sequence.',
   w:'You have real potential but no clear first move. Building before that is decided is the most common way AI budgets get wasted.',href:'#consulting'},
 dev:{n:'AI Solutions & Development',
   d:'Full build: design, development, evaluation, integration, deployment, and handover — in your repository, on your cloud, with your team trained on it.',
   w:'Your problem is defined well enough to build against. What you need is engineering capacity that ships to production, not another workshop.',href:'#solutions'},
 agents:{n:'AI Agents & Automation',
   d:'A multi-step agent with scoped tool access, a defined blast radius, human approval gates on consequential actions, and full step-level tracing.',
   w:'Your process has several steps, real system access, and enough volume that autonomy pays — provided the guardrails come first.',href:'#agents'},
 automation:{n:'AI Automation',
   d:'Document and workflow automation end to end — classification, extraction, validation, routing — straight-through where confidence is high, escalated to a human where it is not.',
   w:'Repetitive manual work with a consistent shape is the highest-certainty return in applied AI.',href:'#solutions'},
 rag:{n:'Enterprise Knowledge & RAG',
   d:'Permission-aware retrieval and question-answering across your documents, with mandatory citations and an evaluation set built from real historical questions.',
   w:'The knowledge already exists inside your organization. The problem is retrieval and trust, which is exactly what RAG is for.',href:'#solutions'},
 ml:{n:'Machine Learning & Predictive Analytics',
   d:'Forecasting, scoring, classification, and recommendation. Often classical machine learning rather than an LLM — which is usually cheaper, faster, and more accurate for this shape of problem.',
   w:'Prediction from structured historical data is a solved class of problem. The work is in the data and the evaluation, not the model.',href:'#tech'},
 gov:{n:'AI Governance, Risk & Compliance',
   d:'The controls that let legal say yes: governance framework, acceptable-use policy, model inventory and risk tiering, review gates, audit logging standards, and evaluation.',
   w:'Governance is your binding constraint. Solving it unblocks everything else — and bolting it on afterwards costs several times more.',href:'#consulting'},
 train:{n:'AI Training & Academy',
   d:'Beginner to advanced training, live or self-paced. For enterprises, delivered on your own stack — and where we have built the system, on that system specifically.',
   w:'Capability, not technology, is your constraint. Buying more tooling before the skills exist tends to make that worse.',href:'#academy'},
 talent:{n:'AI Talent & Contract Services',
   d:'AI professionals we have assessed and upskilled ourselves — contract, staff augmentation, dedicated teams, or full-time placement. Named candidates before any contract.',
   w:'You need people rather than a project. Assessed candidates reach productivity faster than résumé-screened ones.',href:'#talent'},
 managed:{n:'Managed AI Services',
   d:'We run it while your team learns to: monitoring, on-call, evaluation maintenance, model upgrades, cost tuning, and a quarterly review against the original business case.',
   w:'Shipped AI is not finished AI. Models change, data drifts, and costs move — unmanaged systems degrade quietly.',href:'#method'}
};
var ai=0,aAns=[],aScore={};
var aStart=$('#advStart'),aBody=$('#advBody'),aRes=$('#advRes'),aBar=$('#aBar');

if($('#aGo')) $('#aGo').addEventListener('click',function(){ai=0;aAns=[];aScore={};aStart.hidden=true;aRes.hidden=true;aBody.hidden=false;paintA();});
if($('#aBack')) $('#aBack').addEventListener('click',function(){ if(ai>0){ai--;paintA();} else {aBody.hidden=true;aStart.hidden=false;aBar.style.width='0';} });

function paintA(){
  var s=ADV[ai];
  $('#aMeta').textContent=s.m;
  $('#aText').textContent=s.q;
  $('#aPos').textContent='Step '+(ai+1)+' of '+ADV.length;
  aBar.style.width=(ai/ADV.length*100)+'%';
  var box=$('#aOpts'); box.innerHTML='';
  s.o.forEach(function(op,i){
    var b=document.createElement('button');
    b.type='button'; b.className='opt'+(aAns[ai]===i?' sel':''); b.textContent=op.t;
    b.addEventListener('click',function(){
      aAns[ai]=i;
      if(ai<ADV.length-1){ai++;paintA();}else{showAdv();}
    });
    box.appendChild(b);
  });
}
function showAdv(){
  aBar.style.width='100%';
  aScore={};
  ADV.forEach(function(s,i){
    var sc=s.o[aAns[i]].s;
    for(var k in sc){ if(Object.prototype.hasOwnProperty.call(sc,k)) aScore[k]=(aScore[k]||0)+sc[k]; }
  });
  var order=Object.keys(aScore).sort(function(a,b){return aScore[b]-aScore[a];});
  var top=order[0]||'consult', second=order[1];
  var r=RECS[top];
  var html=''
   +'<div class="res-score" style="border-bottom:none;padding-bottom:.5rem"><div><span class="lvl">Preliminary recommendation</span></div></div>'
   +'<div class="rec"><b>Start here</b><p style="font-family:var(--ff-display);font-size:1.35rem;line-height:1.25">'+r.n+'</p>'
   +'<p class="why" style="margin-top:.7rem">'+r.d+'</p>'
   +'<p class="why"><strong>Why this fits:</strong> '+r.w+'</p></div>';
  if(second && aScore[second]>=2 && RECS[second]){
    html+='<div style="margin-top:1.25rem"><h4 style="font-family:var(--ff-mono);font-size:.6875rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin-bottom:.5rem">Likely to follow</h4>'
      +'<p style="font-size:.9375rem;line-height:1.55"><strong>'+RECS[second].n+'</strong> — '+RECS[second].d+'</p></div>';
  }
  html+='<div class="panel-ft"><button class="btn btn-o btn-sm" id="aAgain">Start over</button>'
     +'<span style="display:flex;gap:.5rem;flex-wrap:wrap"><a class="btn btn-sm btn-o" href="'+r.href+'">Read more</a><a class="btn btn-sm" href="#solve">Submit my AI problem</a></span></div>';
  aBody.hidden=true; aRes.innerHTML=html; aRes.hidden=false;
  $('#aAgain').addEventListener('click',function(){ai=0;aAns=[];aRes.hidden=true;aBody.hidden=false;paintA();});
}

/* ================= SOLVE FORM ================= */
var form=$('#solveForm');
form.addEventListener('submit',function(e){
  e.preventDefault();
  var bad=false;
  $$('.field',form).forEach(function(f){
    var c=f.querySelector('input[required],select[required],textarea[required]');
    if(!c) return;
    var ok=c.value.trim()!=='' && (c.type!=='email' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.value));
    f.classList.toggle('bad',!ok);
    if(!ok) bad=true;
  });
  var picked=$$('input[name="support"]:checked').length>0;
  $('#supportErr').style.display=picked?'none':'block';
  if(!picked) bad=true;
  if(!$('#f-consent').checked){ bad=true; $('#f-consent').focus(); }
  if(form.website.value!==''){ return; } /* honeypot */
  if(bad){ var first=$('.field.bad input,.field.bad select,.field.bad textarea',form); if(first) first.focus(); return; }

  var services=$$('input[name="support"]:checked').map(function(i){return i.value;}).join(', ');
  var ok=$('#solveOk');
  ok.innerHTML='<div class="ok"><b>Thank you — your submission is recorded.</b>'
    +'<p style="font-size:.9375rem;line-height:1.6">A consultant reviews every submission personally and responds within one business day with a written point of view — not an automated sequence.</p>'
    +'<p class="tiny" style="margin-top:.9rem;opacity:.75"><strong>Requested:</strong> '+services+'</p>'
    +'<p class="tiny" style="margin-top:.9rem;opacity:.75"><strong>Demo note:</strong> this is a front-end demonstration. No data was transmitted anywhere. Connect this form to a backend or CRM before launch — see the build record for the integration checklist.</p></div>';
  ok.hidden=false;
  form.style.display='none';
  ok.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
});
$$('input[name="support"]').forEach(function(i){
  i.addEventListener('change',function(){
    if($$('input[name="support"]:checked').length) $('#supportErr').style.display='none';
  });
});

/* ================= CAREER LADDER ================= */
var ROLES=[
 {lv:'L1',n:'AI Engineer',d:'Builds and ships AI features against a defined specification, with tests and evaluations.',
  sk:['Python and SQL','LLM API integration','Prompt design and structured output','Basic retrieval and embeddings','Git, testing, code review'],
  ev:['AI Fundamentals','Generative AI','Python for AI'],
  co:['Python for AI','Working with LLMs','AI Engineering'],
  nx:'Own a whole feature end to end, including its evaluation set and its production behaviour.'},
 {lv:'L2',n:'Senior AI Engineer',d:'Owns a complete AI capability including its evaluation, cost profile, and production reliability.',
  sk:['System design for AI features','Evaluation harness design','Cost and latency optimization','Retrieval quality tuning','Mentoring and code review'],
  ev:['LLMs','AI Engineering','MLOps'],
  co:['AI Engineering','Retrieval-Augmented Generation','MLOps & Production ML'],
  nx:'Influence beyond your own team — set patterns others adopt.'},
 {lv:'L3',n:'Staff AI Engineer',d:'Sets technical direction across several teams and resolves the hardest cross-cutting problems.',
  sk:['Cross-team technical strategy','Platform and tooling decisions','Agent architecture and guardrails','Reliability and incident leadership','Technical writing and influence'],
  ev:['AI Engineering','AI Agents','AI Architecture'],
  co:['AI Agents & Agentic Systems','AI Architecture','AI Security & Red-Teaming'],
  nx:'Trade depth in one system for judgement across the whole portfolio.'},
 {lv:'L4',n:'Principal AI Engineer',d:'Owns the technical strategy for an entire AI portfolio and is accountable for its long-term direction.',
  sk:['Multi-year technical strategy','Build-vs-buy at portfolio scale','Risk and governance partnership','Org-wide standards','External technical representation'],
  ev:['AI Architecture','MLOps','AI Agents'],
  co:['AI Architecture','Enterprise AI Program Leadership','AI Security & Red-Teaming'],
  nx:'Move toward architecture ownership or the management track.'},
 {lv:'L5',n:'AI Architect',d:'Designs enterprise AI architecture — the platform, the integration model, and the governance that runs through both.',
  sk:['Enterprise reference architecture','Data platform and integration design','Security, privacy, and residency','Vendor and model selection','Stakeholder alignment'],
  ev:['AI Architecture','MLOps','AI Governance'],
  co:['AI Architecture','MLOps & Production ML','Responsible AI Basics'],
  nx:'Take budget and people accountability, not just design authority.'},
 {lv:'L6',n:'Director of AI',d:'Runs the AI function: teams, budget, delivery portfolio, and the relationship with the rest of the business.',
  sk:['Team building and hiring','Portfolio and budget management','Delivery governance','Executive communication','Vendor management'],
  ev:['Enterprise AI','AI Governance','AI Architecture'],
  co:['Enterprise AI Program Leadership','AI for Business Leaders','Responsible AI Basics'],
  nx:'Own AI strategy at the business-unit level, not just delivery.'},
 {lv:'L7',n:'VP of AI',d:'Owns AI strategy and outcomes across a business unit, accountable for the return, not just the delivery.',
  sk:['Business-unit AI strategy','P&L accountability','Organizational design','Board-level communication','Partnership strategy'],
  ev:['Enterprise AI','AI Governance'],
  co:['Enterprise AI Program Leadership','AI for Business Leaders'],
  nx:'Enterprise-wide accountability, including risk and regulatory posture.'},
 {lv:'L8',n:'Chief AI Officer',d:'Accountable to the board for the enterprise AI strategy, its returns, and its risk posture.',
  sk:['Enterprise AI strategy','Board and regulator engagement','Risk and ethics ownership','Capital allocation','External representation'],
  ev:['Enterprise AI','AI Governance','Responsible AI'],
  co:['Enterprise AI Program Leadership','Responsible AI Basics','AI Security & Red-Teaming'],
  nx:'The top of this ladder. Adjacent moves: CTO, COO, or board advisory.'}
];
var ladder=$('#ladder'), roleinfo=$('#roleinfo');
if(ladder&&roleinfo) ROLES.forEach(function(r,i){
  var b=document.createElement('button');
  b.type='button'; b.className='rung'; b.setAttribute('aria-pressed',String(i===0));
  b.innerHTML='<span class="lv">'+r.lv+'</span><span class="rn">'+r.n+'</span>';
  b.addEventListener('click',function(){
    $$('.rung',ladder).forEach(function(x,j){x.setAttribute('aria-pressed',String(j===i));});
    paintRole(i);
  });
  ladder.appendChild(b);
});
function paintRole(i){
  var r=ROLES[i];
  roleinfo.innerHTML='<span class="eyebrow">'+r.lv+' · Career ladder</span>'
   +'<h3 style="margin-top:.6rem">'+r.n+'</h3>'
   +'<p class="muted" style="font-size:.9375rem;line-height:1.6;max-width:70ch">'+r.d+'</p>'
   +'<div class="rgrid">'
   +'<div><h4>Core skills</h4><ul>'+r.sk.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ul></div>'
   +'<div><h4>Assessment tracks that evidence it</h4><ul>'+r.ev.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ul></div>'
   +'<div><h4>Academy courses that build it</h4><ul>'+r.co.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ul></div>'
   +'</div>'
   +'<div class="rec" style="margin-top:1.4rem"><b>To reach the next rung</b><p style="font-size:.9375rem;line-height:1.55">'+r.nx+'</p></div>';
}
if(roleinfo) paintRole(0);

/* ================= AUTO SECTION NUMBERING ================= */
$$('main .sec-num').forEach(function(el,i){
  el.textContent=('0'+(i+1)).slice(-2);
});

/* ================= AI MATURITY ASSESSMENT ================= */
var MAT=[
 {dim:'Strategy',m:'Dimension 1 of 6 — Strategy',
  q:'Which best describes your organisation’s AI business case today?',
  o:['We have no defined AI use case — there is interest, but nothing specific',
     'We have ideas and enthusiasm, but nothing with a costed business case',
     'We have at least one costed business case with a named executive owner',
     'AI initiatives are funded from operating budgets and tracked against P&L targets']},
 {dim:'Data',m:'Dimension 2 of 6 — Data',
  q:'If we needed the data behind your highest-value process next week, what would happen?',
  o:['Nobody is certain where it lives, or who owns it',
     'It exists, but it is scattered and would need substantial cleaning',
     'It is accessible in a warehouse or lake, with known quality issues',
     'It is governed, documented, quality-monitored, and access-controlled']},
 {dim:'Technology',m:'Dimension 3 of 6 — Technology',
  q:'What is your platform’s ability to deploy and operate a model?',
  o:['Largely on-premise or legacy; no path to deploy a model',
     'Cloud infrastructure exists, but nothing purpose-built for AI',
     'We can deploy models, with some monitoring and manual release steps',
     'Infrastructure as code, CI/CD, monitoring, and evaluation gates are standard']},
 {dim:'Talent',m:'Dimension 4 of 6 — Talent',
  q:'Who inside your organisation could build and then operate an AI system?',
  o:['Nobody — we would be entirely dependent on an outside vendor',
     'We have analysts or developers, but no AI-specific experience',
     'We have a small number of capable people, concentrated in one or two individuals',
     'We have a functioning team that could take over a delivered system']},
 {dim:'Governance',m:'Dimension 5 of 6 — Governance',
  q:'What happens when an AI initiative reaches legal, risk, or compliance?',
  o:['We do not know — it has never got that far',
     'It stalls; there is no agreed process for approving AI',
     'There is an ad-hoc review, decided case by case',
     'There is a defined framework, risk tiering, and a review path with owners']},
 {dim:'Adoption',m:'Dimension 6 of 6 — Adoption',
  q:'When new tools are introduced to the people whose work changes, what usually happens?',
  o:['They are resisted, worked around, or quietly abandoned',
     'Adoption is patchy and depends entirely on the individual manager',
     'Adoption succeeds when we invest in training and change management',
     'Frontline teams ask for these tools and help design them']}
];
var MLEVELS=[
 {min:0,n:'Exploring',t:'Level 1',
  d:'AI is a topic of interest rather than a programme. That is a perfectly normal starting point — and the cheapest possible moment to avoid the mistakes that follow.',
  rec:'AI Readiness Assessment',
  why:'Four to six weeks that map your processes, score every opportunity on value and feasibility, test your data against the top candidates, and return a ranked portfolio with a build sequence. Building anything before this decision is made is the most common way AI budgets are wasted.'},
 {min:5,n:'Experimenting',t:'Level 2',
  d:'There is genuine activity, but it is not yet connected to a costed outcome or a repeatable path to production. This is where the large majority of organisations sit, and where most pilots quietly die.',
  rec:'AI Readiness Assessment, then a Proof of Value',
  why:'Establish which of your experiments has a real business case behind it, then take exactly one of them into a narrow but genuine slice running on real data — measured against that case, with an honest go/no-go at the end.'},
 {min:9,n:'Operationalising',t:'Level 3',
  d:'You can get things built. The constraint has moved to hardening, integration, governance, and the discipline required to keep a system healthy after launch.',
  rec:'Production Build, with evaluation and governance in scope',
  why:'The gap between a working prototype and a production system is security review, integrations, evaluations in CI, audit logging, human review paths, runbooks, and rollout. Skipping any of it is what turns a promising pilot into an outage.'},
 {min:13,n:'Scaling',t:'Level 4',
  d:'AI is genuinely operational. The risk now is fragmentation — inconsistent standards, duplicated effort, drifting models, and costs that nobody owns.',
  rec:'Platform Build and Managed AI Operations',
  why:'At this stage the leverage is in shared foundations and operational discipline: a common platform, evaluation standards, drift monitoring, cost governance, and a portfolio view rather than a project view.'},
 {min:17,n:'AI-Native',t:'Level 5',
  d:'AI is embedded in how the organisation operates. You almost certainly do not need a delivery partner in the conventional sense.',
  rec:'Fractional AI Leadership, or specialist capacity on contract',
  why:'What firms at this level tend to want is senior judgement on the hard calls and specialist capacity for specific gaps — not an implementation vendor. That is a different, and much smaller, engagement.'}
];
var MFIX={
 Strategy:{c:'Strategy is your binding constraint.',
   f:'Without a costed, owned business case, every other investment is a guess. Start with the AI Readiness Assessment or the AI Strategy &amp; Roadmap engagement.',h:'#consulting'},
 Data:{c:'Data is your binding constraint.',
   f:'The model is rarely the problem. Prioritise the Data &amp; AI Platform work — pipelines, quality, lineage, and access control — scoped only to what your first use case actually touches.',h:'#solutions'},
 Technology:{c:'Technology is your binding constraint.',
   f:'You cannot operate what you cannot deploy. Platform engineering — infrastructure as code, CI, monitoring, and evaluation gates — comes before the model work.',h:'#solutions'},
 Talent:{c:'Talent is your binding constraint.',
   f:'A delivered system with nobody able to run it becomes a liability within a year. Combine delivery with the Academy, or bring in assessed professionals through Talent Solutions.',h:'#talent'},
 Governance:{c:'Governance is your binding constraint.',
   f:'If legal and risk have no path to yes, nothing ships regardless of how good the build is. The AI Governance Program exists for exactly this, and it unblocks everything downstream.',h:'#consulting'},
 Adoption:{c:'Adoption is your binding constraint.',
   f:'Systems people work around produce no return at all. Weight the investment towards enablement, change management, and involving frontline teams in the design.',h:'#academy'}
};
var mi=0,mAns=[];
var mStart=$('#matStart'),mBody=$('#matBody'),mRes=$('#matRes'),mBar=$('#mBar');

if($('#mGo')) $('#mGo').addEventListener('click',function(){mi=0;mAns=[];mStart.hidden=true;mRes.hidden=true;mBody.hidden=false;paintM();});
if($('#mBack')) $('#mBack').addEventListener('click',function(){ if(mi>0){mi--;paintM();} else {mBody.hidden=true;mStart.hidden=false;mBar.style.width='0';} });

function paintM(){
  var s=MAT[mi];
  $('#mMeta').textContent=s.m;
  $('#mText').textContent=s.q;
  $('#mPos').textContent='Question '+(mi+1)+' of '+MAT.length;
  mBar.style.width=(mi/MAT.length*100)+'%';
  var box=$('#mOpts'); box.innerHTML='';
  s.o.forEach(function(txt,i){
    var b=document.createElement('button');
    b.type='button'; b.className='opt'+(mAns[mi]===i?' sel':''); b.textContent=txt;
    b.addEventListener('click',function(){
      mAns[mi]=i;
      if(mi<MAT.length-1){mi++;paintM();}else{showMat();}
    });
    box.appendChild(b);
  });
}
function showMat(){
  mBar.style.width='100%';
  var total=0,low=0;
  mAns.forEach(function(v,i){ total+=v; if(v<mAns[low]) low=i; });
  var lv=MLEVELS[0]; MLEVELS.forEach(function(l){ if(total>=l.min) lv=l; });
  var lvIdx=MLEVELS.indexOf(lv);
  var weak=MAT[low].dim, fix=MFIX[weak];

  var seg='',lbl='';
  ['Exploring','Experimenting','Operationalising','Scaling','AI-Native'].forEach(function(n,i){
    seg+='<i class="'+(i<=lvIdx?'on':'')+'"></i>';
    lbl+='<span class="'+(i===lvIdx?'on':'')+'">'+n+'</span>';
  });
  var dims='';
  MAT.forEach(function(d,i){
    var pct=(mAns[i]/3)*100;
    dims+='<div class="dim'+(i===low?' low':'')+'"><span>'+d.dim+(i===low?' &nbsp;<em style="font-style:normal;font-family:var(--ff-mono);font-size:.625rem;letter-spacing:.1em;color:var(--accent-2)">WEAKEST</em>':'')+'</span>'
       +'<span class="bar"><i style="width:'+pct+'%"></i></span></div>';
  });

  mRes.innerHTML=''
   +'<div class="res-score" style="border-bottom:none;padding-bottom:.35rem">'
   +'<span class="big">'+lv.t.replace('Level ','')+'</span>'
   +'<div><span class="lvl">'+lv.n+'</span><div class="tiny muted" style="margin-top:.45rem">Scored '+total+' of 18 across six dimensions</div></div></div>'
   +'<div class="meter"><div class="meter-track">'+seg+'</div><div class="meter-lbl">'+lbl+'</div></div>'
   +'<p class="muted" style="font-size:.9375rem;line-height:1.6">'+lv.d+'</p>'
   +'<h4 style="font-family:var(--ff-mono);font-size:.6875rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin:1.6rem 0 .2rem">Your profile</h4>'
   +'<div class="dims">'+dims+'</div>'
   +'<div class="rec" style="border-color:var(--accent-2);background:var(--accent-2-wash)"><b style="color:var(--accent-2)">'+fix.c+'</b><p style="font-size:.9375rem;line-height:1.55">'+fix.f+'</p></div>'
   +'<div class="rec"><b>Recommended first engagement</b><p style="font-family:var(--ff-display);font-size:1.3rem;line-height:1.25">'+lv.rec+'</p><p class="why">'+lv.why+'</p></div>'
   +'<div class="panel-ft"><button class="btn btn-o btn-sm" id="mAgain">Retake</button>'
   +'<span style="display:flex;gap:.5rem;flex-wrap:wrap"><a class="btn btn-sm btn-o" href="'+fix.h+'">Address the constraint</a><a class="btn btn-sm" href="#solve">Book a triage session</a></span></div>';
  mBody.hidden=true; mRes.hidden=false;
  $('#mAgain').addEventListener('click',function(){mi=0;mAns=[];mRes.hidden=true;mBody.hidden=false;paintM();});
}

/* ================= INDUSTRIES ================= */
var INDS=[
 {n:'Healthcare',s:'Administrative load, not clinical decision-making, is where AI pays first and carries the least risk.',
  u:['Prior authorization packet assembly','Clinical documentation summarization','Patient message triage and drafting','Coding and charge capture review','Referral and intake processing','Capacity and staffing forecasting'],
  b:'PHI handling, clinician trust, and the need to show safety evidence before anything touches care delivery.'},
 {n:'Banking',s:'High-volume review work with a clear audit requirement — the natural shape for document and triage AI.',
  u:['KYC and AML alert triage','Credit memo drafting from source documents','Commercial loan document extraction','Complaint classification and routing','Transaction pattern investigation support','Branch and contact-centre forecasting'],
  b:'Model risk management expectations, explainability, and the certainty of examiner scrutiny.'},
 {n:'Financial Services',s:'Research, reporting, and client communication consume expensive senior time that AI can genuinely return.',
  u:['Research and filing summarization','Client reporting automation','Portfolio commentary drafting','Onboarding document processing','Suitability and disclosure checking','Reconciliation exception handling'],
  b:'Recordkeeping, supervision, and communication-retention obligations.'},
 {n:'Insurance',s:'Claims and underwriting are document pipelines with measurable cycle times — the clearest ROI case in the sector.',
  u:['First-notice-of-loss triage and severity scoring','Claims document extraction and validation','Underwriting submission intake','Policy and endorsement comparison','Subrogation opportunity identification','Reserve and loss forecasting'],
  b:'State-by-state regulatory variation and the need for a defensible audit trail on every automated decision.'},
 {n:'Retail',s:'Forecasting and content generation at SKU scale — classical ML and generative AI doing different jobs well.',
  u:['Demand forecasting by location and SKU','Assortment and markdown optimization','Product content generation at scale','Customer service assistants','Returns fraud detection','Store labour scheduling'],
  b:'Seasonality, promotional distortion, and product data that is messier than anyone expects.'},
 {n:'E-commerce',s:'Every point of conversion and every support contact is measurable, which makes evaluation unusually honest.',
  u:['Catalogue enrichment and attribute extraction','Search relevance and merchandising','Personalized recommendation','Review summarization','Support deflection and drafting','Fraud and chargeback scoring'],
  b:'Latency budgets at checkout and inference cost measured against margin per order.'},
 {n:'Manufacturing',s:'Prediction on sensor data and vision on the line — plus a large amount of trapped engineering knowledge.',
  u:['Predictive maintenance','Visual quality inspection','Demand and S&OP forecasting','Engineering document and spec search','BOM and drawing extraction','Supplier risk monitoring'],
  b:'OT/IT separation, shop-floor connectivity, and safety cases for anything near the line.'},
 {n:'Technology',s:'The buyer is technical, so the value case must survive engineers who could plausibly build it themselves.',
  u:['Support ticket deflection and drafting','Code and documentation assistants','Sales engineering research','Churn and expansion prediction','Incident summarization and postmortems','Release note generation'],
  b:'Build-versus-buy discipline, and internal teams who want to own the interesting parts.'},
 {n:'SaaS',s:'AI as a product feature has different economics from AI as an internal tool — the unit cost follows every seat.',
  u:['In-product AI features','Onboarding and activation assistants','Usage-based churn scoring','Support copilots for CS teams','Pricing and packaging analytics','Trust and safety classification'],
  b:'Inference cost per seat against gross margin, and latency inside an interactive product.'},
 {n:'Education',s:'Administrative and advising workloads are where the return is; assessment is where the risk is.',
  u:['Student support assistants','Course content and assessment drafting','Enrollment forecasting','Advising and retention scoring','Accessibility remediation','Administrative workflow automation'],
  b:'FERPA, academic integrity, and faculty governance that moves at its own pace.'},
 {n:'Real Estate',s:'Document-heavy transactions with high variability — a natural fit for extraction with human confirmation.',
  u:['Lease abstraction','Comparable and valuation support','Listing content generation','Tenant service triage','Maintenance prioritization','Portfolio and occupancy forecasting'],
  b:'Enormous document variety, and fair-housing exposure in anything consumer-facing.'},
 {n:'Logistics',s:'Optimization and exception handling across partners who each hold part of the data.',
  u:['Route and load optimization','ETA prediction','Document processing — BOL, customs, PoD','Exception management agents','Demand and capacity forecasting','Damage and claims assessment'],
  b:'Real-time data quality across partners you do not control.'},
 {n:'Telecommunications',s:'Enormous operational volume, and legacy systems that make integration the real project.',
  u:['Network anomaly detection','Field-service dispatch optimization','Care assistants and deflection','Churn and retention scoring','Order fallout resolution','Capacity planning'],
  b:'Legacy OSS/BSS integration, which usually costs more than the AI itself.'},
 {n:'Professional Services',s:'The product is expert time, so returning senior hours converts directly into capacity or margin.',
  u:['Contract review and clause extraction','Proposal and RFP drafting','Research and precedent search','Time and matter analytics','Firm knowledge retrieval','Conflict checking support'],
  b:'Privilege, confidentiality walls, and billable-hour incentives that quietly resist efficiency.'},
 {n:'Government',s:'Backlogs and correspondence are the opportunity; accountability for automated decisions is the constraint.',
  u:['Constituent service assistants','Records and public-records request processing','Benefits eligibility document review','Procurement document analysis','Case backlog triage','Translation and accessibility support'],
  b:'Procurement cycles, transparency requirements, and public accountability for any automated decision affecting a citizen.'}
];
var indList=$('#indList'), indBody=$('#indBody');
if(indList&&indBody) INDS.forEach(function(d,i){
  var b=document.createElement('button');
  b.type='button'; b.setAttribute('aria-pressed',String(i===0));
  b.innerHTML='<i>'+('0'+(i+1)).slice(-2)+'</i> '+d.n;
  b.addEventListener('click',function(){
    $$('button',indList).forEach(function(x,j){x.setAttribute('aria-pressed',String(j===i));});
    paintInd(i);
  });
  indList.appendChild(b);
});
function paintInd(i){
  var d=INDS[i];
  indBody.innerHTML='<span class="eyebrow">Industry '+('0'+(i+1)).slice(-2)+'</span>'
   +'<h3 style="margin-top:.6rem">'+d.n+'</h3>'
   +'<p class="sub">'+d.s+'</p>'
   +'<h4>Where AI typically pays here</h4>'
   +'<ul class="uc">'+d.u.map(function(u){return '<li>'+u+'</li>';}).join('')+'</ul>'
   +'<h4>What usually gets in the way</h4>'
   +'<p class="sub">'+d.b+'</p>'
   +'<div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1.5rem">'
   +'<a class="btn btn-sm" href="#solve">Discuss a '+d.n+' problem</a>'
   +'<a class="btn btn-sm btn-o" href="#maturity">Check your maturity</a></div>';
}
if(indBody) paintInd(0);

/* ================= AUDIENCE SWITCHER ================= */
var audTabs=$$('.aud-tabs button');
audTabs.forEach(function(t,i){
  t.addEventListener('click',function(){ audSel(i); });
  t.addEventListener('keydown',function(e){
    var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;
    if(d){e.preventDefault();var n=(i+d+audTabs.length)%audTabs.length;audSel(n);audTabs[n].focus();}
  });
});
function audSel(i){
  audTabs.forEach(function(t,j){
    t.setAttribute('aria-selected',String(j===i));
    document.getElementById(t.getAttribute('aria-controls')).hidden=(j!==i);
  });
}

/* ================= AI BRIEFING — self-updating daily =================
   Three tiers, in order of preference:
     A. NORTHKEY_NEWS_ENDPOINT — a real feed you host. Set the global
        below (or inject it server-side) and it wins. Expected JSON:
          { "generatedAt": "2026-09-10T06:00:00Z",
            "items": [ { "topic","title","detail","action","url","source" } ] }
        A published Artifact cannot reach it (the sandbox blocks external
        fetch), so this tier is for the self-hosted deployment.
     B. Artifact runtime — a shared `db` document caches one briefing per
        day, so the first visitor of the day refreshes it for everybody
        and nobody pays for a repeat generation. Written by `sample`.
     C. Neither available — an honest empty state that explains why,
        rather than static filler pretending to be current.
   ===================================================================== */
var NEWS_ENDPOINT = window.NORTHKEY_NEWS_ENDPOINT || '';
var BRIEF_DOC='briefing/current';
var bBody=$('#briefBody'),bBadge=$('#briefBadge'),bGo=$('#briefGo'),bDisc=$('#briefDisc');

function dayKey(d){ d=d||new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
function prettyDay(k){
  var p=String(k||'').split('-'); if(p.length!==3) return k||'';
  var dt=new Date(Date.UTC(+p[0],+p[1]-1,+p[2]));
  return dt.toLocaleDateString(undefined,{timeZone:'UTC',year:'numeric',month:'long',day:'numeric'});
}
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

function badge(text,cls){ bBadge.textContent=text; bBadge.className='brief-badge'+(cls?' '+cls:''); }

function renderBrief(items,meta){
  if(!items||!items.length){ return renderEmpty('The briefing came back empty.'); }
  bBody.innerHTML='<ul class="brief-items">'+items.slice(0,4).map(function(it){
    var link = it.url ? '<a href="'+esc(it.url)+'" target="_blank" rel="noopener noreferrer">'+esc(it.source||'Source')+' &#8599;</a>' : '';
    return '<li><span class="topic">'+esc(it.topic||'Enterprise AI')+'</span>'
      +'<b>'+esc(it.title||'')+'</b>'
      +'<span class="det">'+esc(it.detail||'')+'</span>'
      +(it.action?'<span class="act">'+esc(it.action)+'</span>':'')
      +(link?'<span class="act" style="border:none;padding-top:.5rem">'+link+'</span>':'')
      +'</li>';
  }).join('')+'</ul>';
  bDisc.innerHTML=meta;
}
function renderEmpty(reason){
  bBody.innerHTML='<div class="brief-empty"><p><strong>The briefing is not live in this view.</strong> '+esc(reason)+'</p>'
   +'<p style="margin-top:.75rem">This column is designed to refresh once a day. On the hosted site it reads a feed the company controls; inside a published Artifact it is generated on demand and cached for the day so it costs one generation, not one per visitor.</p></div>';
  bDisc.innerHTML='No placeholder headlines are shown here on purpose. Filler dressed up as current information is exactly the kind of claim this firm says it will not publish.';
}

function briefLoading(){
  bBody.innerHTML='<ul class="brief-items brief-skel" aria-hidden="true">'
    +'<li><div class="ln s"></div><div class="ln l"></div><div class="ln m"></div><div class="ln m"></div></li>'.repeat(4)+'</ul>';
}

var SAMPLE_PROMPT_RULES=
 'Do NOT invent news events, dates, funding rounds, product launches, company announcements, '
+'benchmark results, or statistics attributed to any source. You do not have live information, so write '
+'about durable patterns, trade-offs and decisions rather than current events. '
+'Avoid these words entirely: leverage, synergy, transformative, revolutionary, cutting-edge, seamless, '
+'unlock, empower, journey, ecosystem, game-changing, harness.';

async function generateBrief(sample,db){
  badge('Generating','warn'); briefLoading(); bGo.hidden=true;
  var key=dayKey();
  var prompt=
   'Today is '+key+'. Write the daily briefing column for NorthKey AI, a US-based AI consulting, '
  +'development, training and talent firm. The readers are executives and technology leaders at '
  +'mid-market and enterprise companies who are trying to get AI into production.\n\n'
  +'Write exactly 4 briefing items on durable themes in enterprise AI adoption. Use the date above to '
  +'vary which themes you choose, so the column differs from day to day.\n\n'
  +'Each item needs:\n'
  +'- topic: a 1-3 word category label\n'
  +'- title: a specific, arguable claim in under 12 words\n'
  +'- detail: exactly 2 sentences of substance, concrete and plainly written\n'
  +'- action: one sentence starting with a verb, saying what a leader should do about it this quarter\n\n'
  +SAMPLE_PROMPT_RULES+'\n\n'
  +'Return JSON only: {"items":[{"topic":"","title":"","detail":"","action":""}]}';
  try{
    var out=await sample.json(prompt,{modelTier:'default',cache:{gcTime:60*60*1000}});
    var items=(out&&out.items)||[];
    if(!items.length) throw {code:'empty'};
    if(db){ try{ await db.doc(BRIEF_DOC).set({date:key,items:items,source:'sample'}); }catch(e){} }
    showGenerated(items,key);
  }catch(err){
    var code=(err&&err.code)||'';
    if(code==='not_granted'){ renderEmpty('The briefing needs your permission to ask Claude, and that was declined.'); badge('Not enabled',''); return; }
    if(code==='rate_limited'){ renderEmpty('Rate limited — try again in a few minutes.'); badge('Rate limited','warn'); bGo.hidden=false; return; }
    renderEmpty('Generation failed'+(code?' ('+esc(code)+')':'')+'.'); badge('Unavailable',''); bGo.hidden=false;
  }
}
function showGenerated(items,key){
  badge('Updated '+prettyDay(key),'live');
  renderBrief(items,
   '<strong>How this column works.</strong> Written by Claude on '+esc(prettyDay(key))+' and cached for the day, so it refreshes '
  +'once daily rather than once per visitor. It is <strong>perspective, not reporting</strong> — the model was explicitly '
  +'instructed not to invent events, announcements, or statistics, because it has no live feed. Treat these as prompts for a '
  +'conversation, not as verified news, and check anything you intend to act on.');
  bGo.hidden=false; bGo.textContent='Regenerate';
}

async function briefInit(){
  if(!bBody) return;

  /* Tier A — self-hosted live feed */
  if(NEWS_ENDPOINT){
    try{
      var r=await fetch(NEWS_ENDPOINT,{headers:{'Accept':'application/json'}});
      if(r.ok){
        var d=await r.json();
        if(d&&d.items&&d.items.length){
          var when=d.generatedAt?new Date(d.generatedAt):new Date();
          badge('Live · '+when.toLocaleDateString(undefined,{month:'short',day:'numeric'}),'live');
          renderBrief(d.items,'<strong>Live feed.</strong> Headlines are pulled from sources the firm curates and refreshed daily. Each item links to its original source — follow the link before acting on anything here.');
          return;
        }
      }
    }catch(e){ /* fall through */ }
  }

  /* Tier B — artifact runtime: cached day, then on-demand generation */
  var db=null,sample=null;
  if(window.claude&&typeof window.claude.use==='function'){
    try{ db=await window.claude.use('db'); }catch(e){}
    try{ sample=await window.claude.use('sample'); }catch(e){}
  }
  if(db){
    try{
      var snap=await db.doc(BRIEF_DOC).get();
      if(snap&&snap.exists){
        var data=snap.data()||{};
        if(data.items&&data.items.length){
          showGenerated(data.items,data.date||dayKey());
          if(data.date===dayKey()){ bGo.hidden=true; }        /* fresh today */
          else if(sample){ bGo.hidden=false; bGo.textContent='Refresh for today'; }
          return;
        }
      }
    }catch(e){}
  }
  if(sample){
    badge('Ready',''); bGo.hidden=false; bGo.textContent='Generate today’s briefing';
    bBody.innerHTML='<div class="brief-empty"><p><strong>Today’s briefing has not been generated yet.</strong> '
     +'The first visitor of the day generates it and it is then cached for everyone else, so this normally costs one '
     +'generation per day rather than one per visit.</p></div>';
    bDisc.innerHTML='Generation asks Claude on your behalf and will request your permission the first time.';
    return;
  }

  /* Tier C — nothing available */
  badge('Not live','');
  renderEmpty('This copy is running without a feed endpoint or the Artifact runtime.');
}
if(bGo){
  bGo.addEventListener('click',async function(){
    var db=null,sample=null;
    if(window.claude&&typeof window.claude.use==='function'){
      try{ db=await window.claude.use('db'); }catch(e){}
      try{ sample=await window.claude.use('sample'); }catch(e){}
    }
    if(sample) generateBrief(sample,db);
    else renderEmpty('Generation is not available in this view.');
  });
}
briefInit();


/* ================= AI JOB CLASSIFIEDS =================
   A posted board, not a generated one. Listings live in the artifact's
   shared `db` store (collection "listings"), so a post or an edit is
   immediately what every other viewer sees — subscribed live, no reload.

   Storage tiers, in order:
     A. db  — shared, durable, live. Writes need edit access on the page.
     B. localStorage — this browser only, clearly labelled. Lets the board
        be filled in and previewed before the page is published.
   When the board has no listings yet it falls back to generated ROLE
   PATTERNS (the `sample` capability, cached for the day in db), always
   labelled as patterns and never presented as open positions.
   ===================================================================== */
var JOBS_ENDPOINT = window.NORTHKEY_JOBS_ENDPOINT || '';
var JOBS_COL = 'listings';            /* one document per listing        */
var JOBS_CACHE = 'cache/classifieds'; /* generated fallback, one per day */
var JOBS_LS = 'nk-classifieds';

var jBody=$('#jobsBody'),jBadge=$('#jobsBadge'),jGo=$('#jobsGo'),jDisc=$('#jobsDisc'),
    jPost=$('#jobsPost'),jForm=$('#jobsForm'),jCount=$('#jobsCount'),jErr=$('#jobsErr'),
    jFormTitle=$('#jobsFormTitle'),jStore=$('#jobsStore');

var jDb=null, jSample=null, jMode='none', jEditing=null, jItems=[];

function jbadge(text,cls){ jBadge.textContent=text; jBadge.className='brief-badge'+(cls?' '+cls:''); }
function jshow(el,on){ if(el) el.hidden=!on; }

/* ---------- reading and writing listings ---------- */

function lsRead(){
  try{ var raw=localStorage.getItem(JOBS_LS); var v=raw?JSON.parse(raw):[]; return v.length?v:[]; }
  catch(e){ return []; }
}
function lsWrite(items){
  try{ localStorage.setItem(JOBS_LS,JSON.stringify(items)); return true; }catch(e){ return false; }
}

function listingFromForm(){
  var skills=$('#jf-skills').value.split(',').map(function(s){return s.trim();}).filter(Boolean).slice(0,8);
  return {
    title:$('#jf-title').value.trim(),
    track:$('#jf-track').value.trim(),
    level:$('#jf-level').value,
    mode:$('#jf-mode').value,
    summary:$('#jf-summary').value.trim(),
    skills:skills,
    location:$('#jf-location').value.trim(),
    apply:$('#jf-apply').value.trim(),
    postedAt:(jEditing&&jEditing.postedAt)||new Date().toISOString(),
    updatedAt:new Date().toISOString()
  };
}

function fillForm(it){
  $('#jf-title').value=(it&&it.title)||'';
  $('#jf-track').value=(it&&it.track)||'';
  $('#jf-level').value=(it&&it.level)||'';
  $('#jf-mode').value=(it&&it.mode)||'';
  $('#jf-summary').value=(it&&it.summary)||'';
  $('#jf-skills').value=(it&&it.skills||[]).join(', ');
  $('#jf-location').value=(it&&it.location)||'';
  $('#jf-apply').value=(it&&it.apply)||'';
  $$('.field',jForm).forEach(function(f){ f.classList.remove('bad'); });
  jshow(jErr,false);
}

function openForm(it){
  jEditing=it||null;
  jFormTitle.textContent=it?'Edit listing':'Post a listing';
  $('#jobsSave').textContent=it?'Save changes':'Publish listing';
  fillForm(it);
  jshow(jForm,true);
  jForm.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
  $('#jf-title').focus();
}
function closeForm(){ jEditing=null; jshow(jForm,false); fillForm(null); }

async function saveListing(){
  var data=listingFromForm(), bad=false;
  [['#jf-title',data.title],['#jf-summary',data.summary]].forEach(function(pair){
    var f=$(pair[0]).closest('.field');
    var ok=pair[1]!=='';
    f.classList.toggle('bad',!ok);
    if(!ok) bad=true;
  });
  if(bad){ return; }
  jshow(jErr,false);

  if(jMode==='db'){
    try{
      if(jEditing&&jEditing.id) await jDb.collection(JOBS_COL).doc(jEditing.id).set(data);
      else await jDb.collection(JOBS_COL).add(data);
      closeForm();          /* the live subscription repaints the board */
    }catch(err){
      var code=(err&&err.code)||'';
      jErr.textContent = code==='invalid_argument'
        ? 'This listing could not be saved — posting to the board needs edit access on this page. Ask the owner to give you edit access, or export the listing and send it to them.'
        : code==='quota_exceeded'
          ? 'The board is full. Remove an old listing before adding another.'
          : 'The listing could not be saved'+(code?' ('+esc(code)+')':'')+'. Nothing was lost — try again.';
      jshow(jErr,true);
    }
    return;
  }

  /* local fallback */
  var items=lsRead();
  if(jEditing&&jEditing.id){
    items=items.map(function(x){ return x.id===jEditing.id?Object.assign({},data,{id:jEditing.id}):x; });
  }else{
    data.id='l'+Date.now().toString(36);
    items.unshift(data);
  }
  if(!lsWrite(items)){
    jErr.textContent='This browser refused to store the listing, so it was not saved.';
    jshow(jErr,true); return;
  }
  closeForm();
  paintBoard(items,'local');
}

async function removeListing(id){
  if(jMode==='db'){
    try{ await jDb.collection(JOBS_COL).doc(id).delete(); }
    catch(err){
      jErr.textContent='That listing could not be removed — removing needs edit access on this page.';
      jshow(jErr,true);
    }
    return;
  }
  var items=lsRead().filter(function(x){ return x.id!==id; });
  lsWrite(items);
  paintBoard(items,'local');
}

/* ---------- rendering ---------- */

function jobsLoading(){
  jBody.innerHTML='<ul class="rescards jobs brief-skel" aria-hidden="true">'
    +'<li><div class="ln s"></div><div class="ln l"></div><div class="ln m"></div><div class="ln m"></div></li>'.repeat(3)+'</ul>';
}

function applyLink(v){
  if(!v) return '';
  var href = /^https?:\/\//i.test(v) ? v : (v.indexOf('@')>-1 ? 'mailto:'+v : '');
  if(!href) return '<span class="soon">Apply: '+esc(v)+'</span>';
  var ext = href.indexOf('mailto:')===0 ? '' : ' target="_blank" rel="noopener noreferrer"';
  return '<span class="soon"><a href="'+esc(href)+'"'+ext+'>Apply for this role</a></span>';
}

function cardHtml(it,editable){
  var skills=(it.skills||[]).slice(0,6).map(function(s){return esc(s);}).join(' · ');
  var meta=[it.track||'Artificial Intelligence',it.mode,it.location].filter(Boolean).map(esc).join(' · ');
  return '<li>'
    +'<span class="kind">'+meta+'</span>'
    +'<b>'+esc(it.title||'Untitled role')+'</b>'
    +(it.level?'<span class="jlvl">'+esc(it.level)+'</span>':'')
    +'<span>'+esc(it.summary||'')+'</span>'
    +(skills?'<span class="sk"><i>Skills</i>'+skills+'</span>':'')
    +(it.apply?applyLink(it.apply):'<span class="soon"><a href="#talent">Join the talent network</a></span>')
    +(editable
      ? '<span class="acts"><button type="button" class="jact" data-act="edit" data-id="'+esc(it.id)+'">Edit</button>'
        +'<button type="button" class="jact jdel" data-act="del" data-id="'+esc(it.id)+'">Remove</button></span>'
      : '')
    +'</li>';
}

function paintBoard(items,source){
  jItems=items||[];
  if(!jItems.length){ return jobsFallback(); }
  var editable = source==='db' || source==='local';
  jBody.innerHTML='<ul class="rescards jobs">'+jItems.map(function(it){return cardHtml(it,editable);}).join('')+'</ul>';
  jCount.textContent=jItems.length+(jItems.length===1?' open listing':' open listings');
  if(source==='db'){
    jbadge('Live board','live');
    jDisc.innerHTML='<strong>Stored with the page.</strong> These listings are saved in the artifact’s own store, shared by everyone who opens it and updated live — an edit made here replaces the listing for every visitor. Posting and editing require edit access on this page.';
  }else{
    jbadge('This browser only','warn');
    jDisc.innerHTML='<strong>Not shared yet.</strong> The page is running without its shared store, so these listings are saved in this browser only — nobody else can see them and clearing site data removes them. Publish the page to move the board to shared storage.';
  }
}

function renderPatterns(items,meta,key){
  jBody.innerHTML='<p class="jobs-pattern-note">No roles are open on the board right now. The listings below are <strong>generated role patterns</strong> — the shapes of role this market scopes — shown so the board is not empty. They are not open positions.</p>'
    +'<ul class="rescards jobs jobs-pattern">'+items.slice(0,6).map(function(it){
    var skills=(it.skills||[]).slice(0,5).map(function(s){return esc(s);}).join(' · ');
    return '<li>'
      +'<span class="kind">'+esc(it.track||'Artificial Intelligence')+(it.mode?' · '+esc(it.mode):'')+'</span>'
      +'<b>'+esc(it.title||'')+'</b>'
      +(it.level?'<span class="jlvl">'+esc(it.level)+'</span>':'')
      +'<span>'+esc(it.summary||'')+'</span>'
      +(skills?'<span class="sk"><i>Skills it turns on</i>'+skills+'</span>':'')
      +'<span class="soon">'+(it.evidence?'Evidenced by the '+esc(it.evidence)+' assessment · ':'')
      +'<a href="#talent">Join the talent network</a></span>'
      +'</li>';
  }).join('')+'</ul>';
  jCount.textContent='No open listings — showing generated patterns';
  jbadge('Patterns · '+prettyDay(key),'');
  jDisc.innerHTML=meta;
}

function renderJobsEmpty(reason){
  jBody.innerHTML='<div class="brief-empty"><p><strong>The board has no listings yet.</strong> '+esc(reason)+'</p>'
   +'<p style="margin-top:.75rem">Post a listing and it is stored with the page, so every visitor sees it until it is edited or removed. Published as an Artifact the board uses shared storage; opened as a local file it falls back to this browser only.</p></div>';
  jCount.textContent='No open listings';
  jDisc.innerHTML='No placeholder vacancies are shown here on purpose. Invented job ads are exactly the kind of claim this firm says it will not publish.';
}

/* ---------- generated patterns (fallback only) ---------- */

async function generateJobs(){
  if(!jSample){ return renderJobsEmpty('Pattern generation is not available in this view.'); }
  jbadge('Generating','warn'); jobsLoading(); jshow(jGo,false);
  var key=dayKey();
  var prompt=
   'Today is '+key+'. Write a set of AI job role patterns for NorthKey AI, a US-based AI consulting, '
  +'development, training and talent firm. The readers are AI professionals deciding what to learn next '
  +'and what kind of work to pursue.\n\n'
  +'Produce exactly 6 entries describing ROLE PATTERNS in the US AI market — the shapes of role that '
  +'consulting clients scope. Use the date above to vary which roles you choose, so the set differs '
  +'from day to day.\n\n'
  +'These are NOT vacancies. Name no employer, no client, no recruiter, no location, no salary or rate, '
  +'no headcount and no closing date. Do not imply that any position is currently open.\n\n'
  +'Each entry needs:\n'
  +'- track: the discipline, e.g. AI Engineering, MLOps, AI Architecture, Governance, Data\n'
  +'- title: a real role title in under 6 words\n'
  +'- level: one of Junior, Mid, Senior, Staff, Principal\n'
  +'- mode: one of Contract, Full-time, Staff augmentation, Dedicated team\n'
  +'- summary: exactly 2 sentences on what the role does day to day and what makes it hard\n'
  +'- skills: 3 to 5 short concrete skills, each under 5 words\n'
  +'- evidence: the single assessment track that best evidences the role, chosen from AI, Generative AI, '
  +'Python, Machine Learning, LLMs, Prompt Engineering, AI Engineering, MLOps, AI Agents, AI Architecture\n\n'
  +SAMPLE_PROMPT_RULES+'\n\n'
  +'Return JSON only: {"items":[{"track":"","title":"","level":"","mode":"","summary":"","skills":[],"evidence":""}]}';
  try{
    var out=await jSample.json(prompt,{modelTier:'default',cache:{gcTime:60*60*1000}});
    var items=(out&&out.items)||[];
    if(!items.length) throw {code:'empty'};
    if(jDb){ try{ await jDb.doc(JOBS_CACHE).set({date:key,items:items,source:'sample'}); }catch(e){} }
    showPatterns(items,key);
  }catch(err){
    var code=(err&&err.code)||'';
    if(code==='not_granted'){ renderJobsEmpty('Generating patterns needs your permission to ask Claude, and that was declined.'); jbadge('Board empty',''); return; }
    if(code==='rate_limited'){ renderJobsEmpty('Rate limited — try again in a few minutes.'); jbadge('Rate limited','warn'); jshow(jGo,true); return; }
    renderJobsEmpty('Pattern generation failed'+(code?' ('+esc(code)+')':'')+'.'); jbadge('Board empty',''); jshow(jGo,true);
  }
}

function showPatterns(items,key){
  renderPatterns(items,
   '<strong>These are patterns, not vacancies.</strong> Written by Claude on '+esc(prettyDay(key))+' and cached for the day. '
  +'The model was explicitly instructed not to invent employers, locations, salaries or deadlines, because it has no live '
  +'job feed. They disappear as soon as a real listing is posted to the board.',key);
  jshow(jGo,true); jGo.textContent='Regenerate patterns';
}

async function jobsFallback(){
  jCount.textContent='No open listings';
  /* A self-hosted board endpoint wins if one is configured. */
  if(JOBS_ENDPOINT){
    try{
      var r=await fetch(JOBS_ENDPOINT,{headers:{'Accept':'application/json'}});
      if(r.ok){
        var d=await r.json();
        if(d&&d.items&&d.items.length){ return paintBoard(d.items,'feed'); }
      }
    }catch(e){}
  }
  if(jDb){
    try{
      var snap=await jDb.doc(JOBS_CACHE).get();
      if(snap&&snap.exists){
        var data=snap.data()||{};
        if(data.items&&data.items.length){
          showPatterns(data.items,data.date||dayKey());
          if(data.date!==dayKey()&&jSample){ jGo.textContent='Refresh patterns'; }
          return;
        }
      }
    }catch(e){}
  }
  if(jSample){ jshow(jGo,true); jGo.textContent='Generate example patterns'; }
  renderJobsEmpty(jSample
    ? 'Post the first one, or generate example role patterns to see how the board reads.'
    : 'Post the first one to fill the board.');
}

/* ---------- wiring ---------- */

if(jForm){
  jForm.addEventListener('submit',function(e){ e.preventDefault(); saveListing(); });
  $('#jobsCancel').addEventListener('click',closeForm);
}
if(jPost){ jPost.addEventListener('click',function(){ openForm(null); }); }
if(jGo){ jGo.addEventListener('click',function(){ generateJobs(); }); }

/* delegated, because the board repaints on every change */
if(jBody){
  jBody.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('.jact'); if(!b) return;
    var id=b.getAttribute('data-id');
    var it=jItems.filter(function(x){return x.id===id;})[0];
    if(b.getAttribute('data-act')==='edit'){ if(it) openForm(it); return; }
    /* two-step delete — no blocking browser dialog */
    if(b.getAttribute('data-confirm')==='1'){ removeListing(id); return; }
    $$('.jdel',jBody).forEach(function(x){ x.removeAttribute('data-confirm'); x.textContent='Remove'; });
    b.setAttribute('data-confirm','1'); b.textContent='Confirm removal';
  });
}

async function jobsInit(){
  if(!jBody) return;

  if(window.claude&&typeof window.claude.use==='function'){
    try{ jDb=await window.claude.use('db'); }catch(e){}
    try{ jSample=await window.claude.use('sample'); }catch(e){}
  }

  if(jDb){
    jMode='db'; jshow(jPost,true); jStore.textContent='Shared with everyone who opens this page';
    jDb.collection(JOBS_COL).orderBy('postedAt','desc').limit(50).onSnapshot(function(snap){
      var items=snap.docs.map(function(d){
        var o=Object.assign({},d.data()); o.id=d.id; return o;
      });
      paintBoard(items,'db');
    },function(err){
      jMode='local';
      jStore.textContent='Saved in this browser only';
      paintBoard(lsRead(),'local');
      jErr.textContent='Live updates stopped ('+esc(err&&err.code||'unavailable')+'). Reload the page to reconnect.';
      jshow(jErr,true);
    });
    return;
  }

  /* No shared store in this view — fall back to this browser. */
  jMode='local'; jshow(jPost,true); jStore.textContent='Saved in this browser only';
  var local=lsRead();
  if(local.length) paintBoard(local,'local');
  else jobsFallback();
}
jobsInit();

})();

/* ===== mega menu: click to open, full keyboard support ===== */
(function(){
  var items=Array.prototype.slice.call(document.querySelectorAll('.mega-i'));
  if(!items.length) return;
  var scrim=document.createElement('div');
  scrim.className='mega-scrim'; document.body.appendChild(scrim);
  var current=null;
  function panel(i){ return i.querySelector('.mega-p'); }
  function btn(i){ return i.querySelector('.mega-t'); }
  function open(i){
    if(current && current!==i) close(current,true);
    var p=panel(i), b=btn(i); if(!p||!b) return;
    p.hidden=false; i.setAttribute('data-open','true'); b.setAttribute('aria-expanded','true');
    scrim.classList.add('on'); current=i;
  }
  function close(i,keep){
    var p=panel(i), b=btn(i); if(!p||!b) return;
    p.hidden=true; i.setAttribute('data-open','false'); b.setAttribute('aria-expanded','false');
    if(current===i) current=null;
    if(!keep && !current) scrim.classList.remove('on');
  }
  function closeAll(){ items.forEach(function(i){ close(i,true); }); current=null; scrim.classList.remove('on'); }
  items.forEach(function(i,idx){
    var b=btn(i); if(!b) return;
    var t;
    i.addEventListener('mouseenter',function(){ clearTimeout(t); open(i); });
    i.addEventListener('mouseleave',function(){ clearTimeout(t); t=setTimeout(function(){ close(i,false); },140); });
    b.addEventListener('keydown',function(e){
      if(e.key==='ArrowDown'){
        e.preventDefault(); open(i);
        var f=i.querySelector('.mega-col a'); if(f) f.focus();
      } else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
        e.preventDefault();
        var d=e.key==='ArrowRight'?1:-1, nx=(idx+d+items.length)%items.length;
        var nb=btn(items[nx]); if(nb) nb.focus();
      }
    });
    i.addEventListener('focusout',function(e){
      if(!i.contains(e.relatedTarget)) close(i,false);
    });
  });
  scrim.addEventListener('click',closeAll);
  document.addEventListener('click',function(e){
    if(current && !current.contains(e.target)) closeAll();
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape' && current){ var b=btn(current); closeAll(); if(b) b.focus(); }
  });
  window.addEventListener('resize',closeAll);
})();

/* mobile drawer close button */
(function(){
  var x=document.getElementById('mnavX'), m=document.getElementById('mnav'),
      b=document.getElementById('burger');
  if(!x||!m||!b) return;
  x.addEventListener('click',function(){
    m.classList.remove('open');
    b.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
    b.focus();
  });
})();
