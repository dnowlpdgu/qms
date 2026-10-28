import { readinessSections } from './readiness-data.js';
import { auditSections, basis, phases } from './audit-data.js';
import { exportWorkbook, exportWord, exportPowerPoint } from './exports.js';
import { createQuestionEdits, editInPlace } from './question-edits.js';

const isAudit = document.body.dataset.page === 'audit';
const type = isAudit ? 'audit' : 'readiness';
const storageKey = isAudit ? 'site-ready-internal-audit-v1' : 'site-ready-assessment-v1';
const baseSections = isAudit ? auditSections : readinessSections.map((s,si)=>({title:s.title,clause:String(si+1).padStart(2,'0'),phase:'Readiness',items:s.items.map(([question,evidence],ii)=>({id:si+'-'+ii,question,evidence}))}));
const questionEdits = createQuestionEdits(type);
const baseQuestions = new Map(baseSections.flatMap(s=>s.items.map(i=>[i.id,i.question])));
let sections, items;
function buildModel() {
  sections = baseSections.map(s=>({...s,items:s.items.filter(i=>!questionEdits.isDeleted(i.id)).map(i=>({...i,question:questionEdits.text(i.id,baseQuestions.get(i.id))}))}));
  items = sections.flatMap(s=>s.items.map(i=>({...i,clause:s.clause,phase:s.phase,section:s.title})));
}
buildModel();
const statuses = isAudit ? {conform:'Conforming',ofi:'Opportunity for improvement',minor:'Minor nonconformity',major:'Major nonconformity',na:'Not applicable'} : {ready:'In place',partial:'Partly in place',gap:'Not in place',na:'Not applicable'};
const points = isAudit ? {conform:3,ofi:2,minor:1,major:0} : {ready:1,partial:0,gap:0};
const colors = {conform:'#4d4d4d',ofi:'#7399aa',minor:'#cc995c',major:'#b75b4b',na:'#b9c3bc'};
const metaIds = ['organization','location','assessment-date','assessment-lead','scope','criteria'];
let state = {meta:{},answers:{}};
const openSections = new Set([0]);
let saveFailed = false;
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && typeof saved === 'object') {
    for (const id of metaIds) if(typeof saved.meta?.[id] === 'string') state.meta[id] = saved.meta[id];
    for (const item of items) {
      const a = saved.answers?.[item.id];
      if (!a || typeof a !== 'object') continue;
      const clean = {};
      if (Object.hasOwn(statuses,a.status)) clean.status = a.status;
      for (const f of ['note','finding','action','owner','due','closure']) if (typeof a[f] === 'string') clean[f] = a[f];
      state.answers[item.id] = clean;
    }
  }
} catch { saveFailed = true; }
let activePhase = 'All';
let toastTimer;
const $ = selector=>document.querySelector(selector);
const esc = value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isGap = status=>isAudit ? status==='minor'||status==='major' : status==='partial'||status==='gap';
const statusClass = status=>status==='ready'||status==='conform'?'status-ready':status==='major'?'status-major':status==='ofi'?'status-ofi':isGap(status)?'status-gap':status==='na'?'status-na':'';
function notify(message,error=false) { const box=$('#message'); clearTimeout(toastTimer); box.textContent=message; box.className='toast'+(error?' error':''); box.hidden=false; toastTimer=setTimeout(()=>box.hidden=true,error?10000:5000); }
function save() { try {localStorage.setItem(storageKey,JSON.stringify(state));saveFailed=false;} catch {saveFailed=true;} $('#save-state').textContent=saveFailed?'Not saved · export a backup':'Saved on this device'; }
function score(list) { const assessed=list.filter(i=>state.answers[i.id]?.status); const applicable=assessed.filter(i=>state.answers[i.id].status!=='na'); const earned=applicable.reduce((sum,i)=>sum+(points[state.answers[i.id].status]||0),0); return {total:list.length,assessed:assessed.length,applicable:applicable.length,earned,percent:applicable.length?Math.round(earned/(applicable.length*(isAudit?3:1))*100):null}; }
function chartRows(groups) { return groups.map(([label,list])=>{const result=score(list);return '<div class="chart-row"><span>'+esc(label)+'</span><div class="chart-track" role="img" aria-label="'+esc(label)+': '+(result.percent===null?'no scored responses':result.percent+' percent from '+result.applicable+' scored responses')+'"><span style="width:'+(result.percent??0)+'%"></span></div><b>'+(result.percent===null?'—':result.percent+'%')+'</b></div>'}).join(''); }
function render() {
  let previousPhase='';
  $('#checklist').innerHTML=sections.map((section,si)=>{
    let heading='';
    if(isAudit && section.phase!==previousPhase){previousPhase=section.phase;heading='<div class="pdca-heading" data-stage="'+section.phase+'"><span>'+String(phases.indexOf(section.phase)+1).padStart(2,'0')+'</span><h3>'+section.phase+'</h3></div>';}
    const open=openSections.has(si);
    return heading+'<section class="section" data-section="'+si+'"><button class="section-head" type="button" aria-expanded="'+open+'" aria-controls="section-'+si+'"><span class="section-num">'+section.clause+'</span><span class="section-title">'+esc(section.title)+(isAudit?'<small>'+section.phase.toUpperCase()+'</small>':'')+'</span><span class="section-progress"></span><i class="chevron" aria-hidden="true"></i></button><div class="section-items" id="section-'+si+'" '+(!open?'hidden':'')+'>'+section.items.map(item=>{
      const a=state.answers[item.id]||{};
      const gap=isGap(a.status);
      return '<article class="question" id="item-'+item.id+'" data-id="'+item.id+'"><div class="question-copy">'+(isAudit?'<div class="question-id">'+item.id+'</div>':'')+'<div class="question-title" tabindex="0" title="Click to edit">'+esc(item.question)+'</div><div class="question-help"><strong>'+(isAudit?'Sample evidence: ':'Look for: ')+'</strong>'+esc(item.evidence)+'</div><button class="question-remove" type="button" data-delete="'+item.id+'">Delete question</button></div><div class="question-controls"><select class="status-select '+statusClass(a.status)+'" data-field="status" aria-label="Status for '+esc(item.question)+'"><option value="">Not assessed</option>'+Object.entries(statuses).map(([value,label])=>'<option value="'+value+'" '+(a.status===value?'selected':'')+'>'+label+'</option>').join('')+'</select><textarea class="evidence" data-field="note" rows="2" aria-label="Evidence or N/A justification for '+item.id+'" placeholder="'+(isAudit?'Objective evidence / sample reference / N/A reason':'Evidence, action or N/A reason')+'">'+esc(a.note)+'</textarea><p class="na-hint" '+(a.status==='na'&&!a.note?.trim()?'':'hidden')+'>Record why this requirement is not applicable.</p>'+(isAudit?'<div class="action-fields" '+(!gap?'hidden':'')+'><textarea class="evidence" data-field="finding" rows="2" aria-label="Finding for '+item.id+'" placeholder="Finding: requirement, evidence and gap">'+esc(a.finding)+'</textarea><textarea class="evidence" data-field="action" rows="2" aria-label="Corrective action for '+item.id+'" placeholder="Correction / root cause / corrective action">'+esc(a.action)+'</textarea><div class="action-meta"><label>Action owner<input class="control-input" data-field="owner" aria-label="Action owner for '+item.id+'" placeholder="Name" value="'+esc(a.owner)+'"></label><label>Target date<input class="control-input" type="date" data-field="due" aria-label="Target date for '+item.id+'" value="'+esc(a.due)+'"></label></div><select class="status-select" data-field="closure" aria-label="Action status for '+item.id+'">'+['Open','In progress','Verified closed'].map(value=>'<option '+(a.closure===value?'selected':'')+'>'+value+'</option>').join('')+'</select></div>':'')+'</div></article>';
    }).join('')+'</div></section>';
  }).join('');
  updateRestore(); update(); applyFilters();
}
function update() {
  const result=score(items); const gaps=items.filter(i=>isGap(state.answers[i.id]?.status));
  $('#question-total').textContent=items.length+' items';
  $('#score').textContent=result.percent===null?'—':result.percent+'%';
  $('#score-subtitle').textContent=result.applicable?result.applicable+' scored items':'No scored items';
  $('#progress-fill').style.width=(result.percent??0)+'%';
  $('#answered-count').textContent=result.assessed+' / '+result.total;
  $('#completion-caption').textContent=Math.round(result.assessed/result.total*100)+'% of checklist assessed';
  $('#gap-count').textContent=gaps.length;
  $('#evidence-count').textContent=items.filter(i=>state.answers[i.id]?.note?.trim()).length;
  document.querySelectorAll('.section').forEach(node=>{const s=sections[Number(node.dataset.section)];node.querySelector('.section-progress').textContent=score(s.items).assessed+' / '+s.items.length;});
  if (!isAudit) return;
  $('#pdca-chart').innerHTML=chartRows(phases.map(p=>[p,items.filter(i=>i.phase===p)]));
  $('#clause-chart').innerHTML=chartRows(['4','5','6','7','8','9','10'].map(c=>['Clause '+c,items.filter(i=>i.clause.split('.')[0]===c)]));
  const counts=Object.keys(statuses).map(key=>({key,count:items.filter(i=>state.answers[i.id]?.status===key).length}));
  let start=0;const stops=counts.map(({key,count})=>{const end=start+(result.assessed?count/result.assessed*100:0);const value=colors[key]+' '+start+'% '+end+'%';start=end;return value;});
  $('#finding-donut').style.background=result.assessed?'conic-gradient('+stops.join(',')+')':'#f0f0f0';
  $('#finding-donut').setAttribute('aria-label',counts.map(c=>statuses[c.key]+': '+c.count).join(', '));
  $('#donut-count').textContent=result.assessed;
  $('#distribution-total').textContent=result.assessed?result.assessed+' / '+items.length+' assessed':'No responses yet';
  $('#finding-legend').innerHTML=counts.map(({key,count})=>'<div class="legend-line"><i style="background:'+colors[key]+'"></i><span>'+statuses[key]+'</span><b>'+count+'</b></div>').join('');
  $('#action-register').innerHTML=gaps.length?'<div class="table-scroll"><table><thead><tr><th>Item</th><th>Classification</th><th>Finding & action</th><th>Owner</th><th>Due</th><th>Action status</th></tr></thead><tbody>'+gaps.map(i=>{const a=state.answers[i.id];return '<tr><td><a class="finding-link" href="#item-'+i.id+'" data-jump="'+i.id+'">'+i.id+'</a></td><td><span class="finding-tag '+(a.status==='major'?'major':'')+'">'+esc(statuses[a.status])+'</span></td><td>'+esc(a.finding||'Finding not recorded')+'<br><strong>Action:</strong> '+esc(a.action||'Not assigned')+'</td><td>'+esc(a.owner||'Unassigned')+'</td><td>'+esc(a.due||'Not set')+'</td><td>'+esc(a.closure||'Open')+'</td></tr>';}).join('')+'</tbody></table></div>':'<p class="register-empty">No nonconformities recorded. Findings will appear here as you assess the checklist.</p>';
}
function applyFilters() {
  const query=$('#search').value.trim().toLowerCase();const filter=$('#status-filter').value;let visible=0;
  document.querySelectorAll('.section').forEach(node=>{
    const section=sections[Number(node.dataset.section)];let matches=0;
    for(const itemNode of node.querySelectorAll('.question')){
      const item=section.items.find(i=>i.id===itemNode.dataset.id);const a=state.answers[item.id]||{};
      const match=(activePhase==='All'||section.phase===activePhase)&&(!query||(section.clause+' '+section.title+' '+item.question+' '+item.evidence+' '+(a.note||'')+' '+(a.finding||'')).toLowerCase().includes(query))&&(filter==='all'||filter==='unanswered'&&!a.status||filter==='gaps'&&isGap(a.status));
      itemNode.hidden=!match;if(match)matches++;
    }
    node.hidden=!matches;visible+=matches;
    if(matches&&(query||filter!=='all')){node.querySelector('.section-head').setAttribute('aria-expanded','true');node.querySelector('.section-items').hidden=false;}
  });
  document.querySelectorAll('.pdca-heading').forEach(node=>{node.hidden=!sections.some((s,index)=>s.phase===node.dataset.stage&&!document.querySelector('[data-section="'+index+'"]').hidden);});
  $('#empty-results').hidden=visible>0;
}
$('#checklist').addEventListener('click',event=>{
  const button=event.target.closest('.section-head');if(!button)return;
  const open=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!open));document.getElementById(button.getAttribute('aria-controls')).hidden=open;const index=Number(button.closest('.section').dataset.section);if(open)openSections.delete(index);else openSections.add(index);
});
function startEdit(title) {
  const id = title.closest('.question').dataset.id;
  const item = items.find(i=>i.id===id);
  if (!item) return;
  editInPlace(title, item.question, next=>{
    questionEdits.setText(id, next, baseQuestions.get(id));
    buildModel();
    render();
  });
}
function updateRestore() {
  const restoreButton = $('#restore-questions');
  const removed = questionEdits.removedCount();
  restoreButton.hidden = !removed;
  restoreButton.textContent = 'Restore ' + removed + ' removed question' + (removed === 1 ? '' : 's');
}
$('#checklist').addEventListener('click',event=>{
  const remove = event.target.closest('.question-remove');
  if (remove) {
    questionEdits.remove(remove.dataset.delete);
    buildModel();
    render();
    return;
  }
  const title = event.target.closest('.question-title');
  if (title) startEdit(title);
});
$('#checklist').addEventListener('keydown',event=>{
  if (event.key==='Enter' && event.target.matches('.question-title')) { event.preventDefault(); startEdit(event.target); }
});
$('#restore-questions').addEventListener('click',()=>{
  questionEdits.restore();
  buildModel();
  render();
});
$('#checklist').addEventListener('input',event=>{
  const field=event.target.dataset.field;if(!field)return;const question=event.target.closest('.question');const id=question.dataset.id;
  state.answers[id]={...state.answers[id],[field]:event.target.value};
  if(field==='status'){
    event.target.className='status-select '+statusClass(event.target.value);
    const action=question.querySelector('.action-fields');if(action)action.hidden=!isGap(event.target.value);
  }
  const a=state.answers[id];question.querySelector('.na-hint').hidden=!(a.status==='na'&&!a.note?.trim());
  save();update();
});
$('#checklist').addEventListener('change',event=>{if(event.target.dataset.field==='status')applyFilters();});
for(const id of metaIds){const input=document.getElementById(id);input.value=state.meta[id]||'';input.addEventListener('input',()=>{state.meta[id]=input.value;save();});}
$('#search').addEventListener('input',applyFilters);$('#status-filter').addEventListener('change',applyFilters);
document.querySelectorAll('[data-phase]').forEach(button=>button.addEventListener('click',()=>{activePhase=button.dataset.phase;document.querySelectorAll('[data-phase]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});applyFilters();}));
$('#action-register')?.addEventListener('click',event=>{const link=event.target.closest('[data-jump]');if(!link)return;event.preventDefault();activePhase='All';$('#search').value='';$('#status-filter').value='all';document.querySelector('[data-phase="All"]').click();const item=document.getElementById('item-'+link.dataset.jump);const section=item.closest('.section');section.querySelector('.section-head').setAttribute('aria-expanded','true');section.querySelector('.section-items').hidden=false;item.scrollIntoView({behavior:'smooth',block:'center'});});
$('#clear-button').addEventListener('click',()=>$('#clear-dialog').showModal());
$('#confirm-clear').addEventListener('click',event=>{event.preventDefault();state={meta:{},answers:{}};for(const id of metaIds)document.getElementById(id).value='';save();render();$('#clear-dialog').close();notify('Assessment cleared.');});
function snapshot(){return {type,title:isAudit?'Internal location audit':'Location readiness assessment',basis,items,statuses,meta:{...state.meta},answers:structuredClone(state.answers),summary:score(items),phaseScores:phases.map(phase=>({phase,...score(items.filter(i=>i.phase===phase))})),clauseScores:['4','5','6','7','8','9','10'].map(clause=>({clause,...score(items.filter(i=>i.clause.split('.')[0]===clause))}))};}
async function runExport(button,handler){const label=button.textContent;button.disabled=true;button.textContent='Preparing…';try{await handler(snapshot());notify('Report downloaded.');}catch(error){console.error(error);notify('Export failed: '+error.message,true);}finally{button.disabled=false;button.textContent=label;}}
$('#export-xlsx').addEventListener('click',event=>runExport(event.currentTarget,exportWorkbook));
$('#export-docx')?.addEventListener('click',event=>runExport(event.currentTarget,exportWord));
$('#export-pptx')?.addEventListener('click',event=>runExport(event.currentTarget,exportPowerPoint));
window.addEventListener('storage',event=>{if(event.key===storageKey)notify('This assessment changed in another tab. Reload before editing to avoid overwriting it.',true);});
render();if(saveFailed){$('#save-state').textContent='Storage unavailable · export a backup';}
