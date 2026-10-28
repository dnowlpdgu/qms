const SCHEMA = 'SiteReady/1';
const scripts = new Map();
export async function library(path,globalName) {
  if (window[globalName]) return window[globalName];
  if (!scripts.has(path)) scripts.set(path,new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src=path;
    script.onload=()=>window[globalName]?resolve(window[globalName]):reject(new Error('Report library did not initialize.'));
    script.onerror=()=>{scripts.delete(path);script.remove();reject(new Error('Could not load report library. Please retry.'));};
    document.head.append(script);
  }));
  return scripts.get(path);
}
const metaNames = {organization:'Organization',location:'Location','assessment-date':'Assessment date','assessment-lead':'Assessment lead',scope:'Scope',criteria:'Audit criteria / licensed edition'};
const fields = ['ID','Clause','PDCA','Section','Question','Suggested evidence','Status','Evidence','Finding','Action','Owner','Due date','Action status'];
function filename(report,extension) { const location=(report.meta.location||'location').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,60)||'location';return 'SiteReady-'+report.type+'-'+location+'.'+extension; }
export function download(blob,name) { const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),30000); }
function rows(report) { return report.items.map(item=>{const a=report.answers[item.id]||{};return {'ID':item.id,'Clause':item.clause,'PDCA':item.phase,'Section':item.section,'Question':item.question,'Suggested evidence':item.evidence,'Status':a.status||'','Evidence':a.note||'','Finding':a.finding||'','Action':a.action||'','Owner':a.owner||'','Due date':a.due||'','Action status':a.closure||''};}); }
function counts(report) { return Object.entries(report.statuses).map(([key,label])=>({key,label,count:report.items.filter(item=>report.answers[item.id]?.status===key).length})); }
function percent(value) { return value===null?'Not scored':value+'%'; }
function scoring(report) {return report.type==='audit'?'Tool-defined scoring, not ISO-mandated. Conforming = 3; opportunity for improvement = 2; minor nonconformity = 1; major nonconformity = 0. Score = earned points / (3 x assessed applicable items).':'In place = 1; partly or not in place = 0. Score = in-place items / assessed applicable items.';}
const limitation='This original checklist is an internal aid, not the ISO standard or a certification decision. Scores exclude unanswered and not-applicable items; review completion and all findings separately.';

export async function exportWorkbook(report) {
  const XLSX=await library('vendor/xlsx.full.min.js','XLSX');
  const book=XLSX.utils.book_new();
  const metadata=[['Key','Value'],['Format',SCHEMA],['Type',report.type],['Basis',report.basis],['Exported',new Date().toISOString()],...Object.entries(metaNames).map(([key])=>[key,report.meta[key]||''])];
  const sheet=XLSX.utils.aoa_to_sheet(metadata);sheet['!cols']=[{wch:25},{wch:110}];XLSX.utils.book_append_sheet(book,sheet,'Metadata');
  const checklist=XLSX.utils.json_to_sheet(rows(report),{header:fields});
  checklist['!cols']=[12,12,12,32,90,65,16,65,65,65,25,16,20].map(wch=>({wch}));
  checklist['!autofilter']={ref:checklist['!ref']};
  XLSX.utils.book_append_sheet(book,checklist,'Checklist');
  const summary=[['Measure','Value'],['Title',report.title],['Organization',report.meta.organization||''],['Location',report.meta.location||''],['Total questions',report.summary.total],['Assessed',report.summary.assessed],['Assessed applicable',report.summary.applicable],['Completion',Math.round(report.summary.assessed/report.summary.total*100)+'%'],['Score',percent(report.summary.percent)],...counts(report).map(c=>[c.label,c.count]),['Scoring',scoring(report)],['Limitations',limitation],['Reference clause 1','Scope: confirm applicability to the organization and its intended QMS outcomes.'],['Reference clause 2','Normative references: apply the references identified for this assessment.'],['Reference clause 3','Terms and definitions: apply referenced QMS vocabulary consistently. Clauses 1-3 are not scored.']];
  const summarySheet=XLSX.utils.aoa_to_sheet(summary);summarySheet['!cols']=[{wch:30},{wch:120}];XLSX.utils.book_append_sheet(book,summarySheet,'Summary');
  if(report.type==='audit') {
    const metrics=report.phaseScores.map(s=>({Group:s.phase,Total:s.total,Assessed:s.assessed,'Assessed applicable':s.applicable,Points:s.earned,'Score (%)':s.percent??'Not scored'})).concat(report.clauseScores.map(s=>({Group:'Clause '+s.clause,Total:s.total,Assessed:s.assessed,'Assessed applicable':s.applicable,Points:s.earned,'Score (%)':s.percent??'Not scored'})));
    const metricsSheet=XLSX.utils.json_to_sheet(metrics);metricsSheet['!cols']=[22,12,12,22,12,18].map(wch=>({wch}));XLSX.utils.book_append_sheet(book,metricsSheet,'PDCA and clauses');
    const findings=rows(report).filter(r=>r.Status==='major'||r.Status==='minor');const findingsSheet=XLSX.utils.json_to_sheet(findings,{header:fields});findingsSheet['!cols']=checklist['!cols'];XLSX.utils.book_append_sheet(book,findingsSheet,'Action register');
  }
  const guide=[['Read me'],['Status codes are listed below. Use the Status column to record each answer.'],[],['Status code','Meaning'],...Object.entries(report.statuses),[],['Guidance','N/A items require a written justification in Evidence. For findings, record the requirement, sample evidence and gap in Finding; record correction, cause and corrective action in Action.'],['Action status','Use Open, In progress or Verified closed (or leave blank).'],['Dates','Use YYYY-MM-DD or an Excel date cell.'],['Scoring',scoring(report)],['Limitations',limitation],['Reference clause 1','Scope: confirm applicability to the organization and its intended QMS outcomes.'],['Reference clause 2','Normative references: apply the references identified for this assessment.'],['Reference clause 3','Terms and definitions: apply referenced QMS vocabulary consistently. Clauses 1-3 are not scored.']];
  const guideSheet=XLSX.utils.aoa_to_sheet(guide);guideSheet['!cols']=[{wch:100},{wch:90}];XLSX.utils.book_append_sheet(book,guideSheet,'Read me');
  const data=XLSX.write(book,{bookType:'xlsx',type:'array',compression:true});download(new Blob([data],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),filename(report,'xlsx'));
}
const checklistFields = ['ID','Section','Question','Rating','Evidence'];
export async function exportChecklistWorkbook({type,title,items,ratings,evidence,ratingOptions}) {
  const XLSX=await library('vendor/xlsx.full.min.js','XLSX');
  const labels=new Map(ratingOptions);
  const body=items.map(item=>[item.id,item.section,item.question,labels.get(String(ratings[item.id]??''))||'',evidence[item.id]||'']);
  const book=XLSX.utils.book_new();
  const metadata=[['Key','Value'],['Format',SCHEMA],['Type',type],['Title',title],['Exported',new Date().toISOString()]];
  const metaSheet=XLSX.utils.aoa_to_sheet(metadata);metaSheet['!cols']=[{wch:25},{wch:110}];XLSX.utils.book_append_sheet(book,metaSheet,'Metadata');
  const sheet=XLSX.utils.aoa_to_sheet([checklistFields,...body]);
  sheet['!cols']=[12,40,90,24,70].map(wch=>({wch}));
  sheet['!autofilter']={ref:sheet['!ref']};
  XLSX.utils.book_append_sheet(book,sheet,'Checklist');
  const guide=[['Read me'],[],['Rating','Scale from 1 (NCR) to 5 (Exceeds). Rating labels are listed below.'],...ratingOptions.map(([value,label])=>[label,'Score '+value+'.']),[],['Evidence','Response or evidence recorded for the question.']];
  const guideSheet=XLSX.utils.aoa_to_sheet(guide);guideSheet['!cols']=[{wch:40},{wch:100}];XLSX.utils.book_append_sheet(book,guideSheet,'Read me');
  const data=XLSX.write(book,{bookType:'xlsx',type:'array',compression:true});
  download(new Blob([data],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),'SiteReady-'+type+'.xlsx');
}
async function chartImage(groups,title) {
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=440;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1200,440);ctx.fillStyle='#262626';ctx.font='600 27px Arial';ctx.fillText(title,30,42);
  const rowHeight=Math.min(72,330/groups.length);
  groups.forEach((group,index)=>{const y=80+index*rowHeight;ctx.fillStyle='#5e5e5e';ctx.font='20px Arial';ctx.fillText(group.phase||'Clause '+group.clause,30,y+21);ctx.fillStyle='#eeeeee';ctx.fillRect(170,y,900,25);if(group.percent!==null){ctx.fillStyle='#414141';ctx.fillRect(170,y,group.percent*9,25);}ctx.fillStyle='#262626';ctx.font='19px Arial';ctx.fillText(percent(group.percent),1090,y+21);});
  return new Uint8Array(await (await new Promise(resolve=>canvas.toBlob(resolve,'image/png'))).arrayBuffer());
}
export async function exportWord(report) {
  const d=await library('vendor/docx.umd.js','docx');
  const {Document,Packer,Paragraph,TextRun,HeadingLevel,Table,TableRow,TableCell,WidthType,ImageRun}=d;
  const para=(text,options={})=>new Paragraph({children:[new TextRun({text:String(text),size:20})],spacing:{after:90},...options});
  const heading=(text,level=HeadingLevel.HEADING_2)=>new Paragraph({text,heading:level,spacing:{before:220,after:100}});
  const table=data=>new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:data.map((row,index)=>new TableRow({children:row.map(value=>new TableCell({shading:index===0?{fill:'EDEDED'}:undefined,children:[para(value,{spacing:{after:55}})]}))}))});
  const children=[new Paragraph({text:'SITE READY',spacing:{after:100},children:[new TextRun({text:'',color:'414141'})]}),heading(report.title,HeadingLevel.TITLE),para(report.basis),...Object.entries(metaNames).map(([key,label])=>para(label+': '+(report.meta[key]||'Not recorded'))),heading('Executive summary'),table([['Measure','Result'],['Audit score',percent(report.summary.percent)],['Completion',report.summary.assessed+' / '+report.summary.total],['Scored applicable items',report.summary.applicable],...counts(report).map(c=>[c.label,c.count])]),para(scoring(report)),para(limitation)];
  if(report.type==='audit'){
    children.push(heading('Performance by PDCA'),new Paragraph({children:[new ImageRun({type:'png',data:await chartImage(report.phaseScores,'PDCA score · assessed applicable items'),transformation:{width:600,height:220}})]}),heading('Performance by clause'),new Paragraph({children:[new ImageRun({type:'png',data:await chartImage(report.clauseScores,'Clause score · assessed applicable items'),transformation:{width:600,height:220}})]}));
  }
  children.push(heading('Reference clauses 1–3'),para('1 · Scope: confirm applicability to the organization and its intended QMS outcomes. 2 · Normative references: apply the references identified for this assessment. 3 · Terms and definitions: apply referenced QMS vocabulary consistently. These clauses are not scored.'),heading('Complete checklist',HeadingLevel.HEADING_1));
  let section='';let phase='';
  for(const item of report.items){
    if(item.phase!==phase){phase=item.phase;children.push(heading(phase,HeadingLevel.HEADING_1));}
    if(item.section!==section){section=item.section;children.push(heading(item.clause+' · '+section));}
    const a=report.answers[item.id]||{};
    children.push(para(item.id+' · '+item.question,{keepNext:true}),para('Status: '+(report.statuses[a.status]||'Not assessed')),para('Suggested evidence: '+item.evidence),para('Recorded evidence / N/A justification: '+(a.note||'Not recorded')));
    if(a.finding||a.action||a.status==='major'||a.status==='minor')children.push(para('Finding: '+(a.finding||'Not recorded')),para('Corrective action: '+(a.action||'Not recorded')),para('Owner: '+(a.owner||'Unassigned')+' | Due: '+(a.due||'Not set')+' | Action status: '+(a.closure||'Open')));
  }
  if(report.type==='audit'){
    children.push(heading('Corrective-action register',HeadingLevel.HEADING_1));
    const gaps=report.items.filter(i=>['major','minor'].includes(report.answers[i.id]?.status));
    if(!gaps.length)children.push(para('No nonconformities recorded.'));
    for(const item of gaps){const a=report.answers[item.id];children.push(heading(item.id+' · '+report.statuses[a.status]),para('Finding: '+(a.finding||'Not recorded')),para('Action: '+(a.action||'Not recorded')),para('Owner: '+(a.owner||'Unassigned')+' | Due: '+(a.due||'Not set')+' | Action status: '+(a.closure||'Open')));}
  }
  const document=new Document({creator:'Site Ready',title:report.title,description:report.basis,styles:{default:{document:{run:{font:'Arial',size:20,color:'303030'}}}},sections:[{properties:{page:{margin:{top:800,bottom:800,left:700,right:700}}},children}]});
  download(await Packer.toBlob(document),filename(report,'docx'));
}
function wrapChunks(text,max=1400) {
  const value=String(text||'');if(!value)return ['Not recorded'];const chunks=[];let rest=value;
  while(rest.length>max){let end=rest.lastIndexOf(' ',max);if(end<max/2)end=max;chunks.push(rest.slice(0,end));rest=rest.slice(end).trimStart();}if(rest)chunks.push(rest);return chunks;
}
export async function exportPowerPoint(report) {
  const PptxGenJS=await library('vendor/pptxgen.bundle.js','PptxGenJS');const pptx=new PptxGenJS();pptx.layout='LAYOUT_WIDE';pptx.author='Site Ready';pptx.subject=report.basis;pptx.title=report.title;pptx.company=(report.meta.organization||'Site Ready').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));pptx.lang='en-US';
  pptx.theme={headFontFace:'Arial',bodyFontFace:'Arial',lang:'en-US'};
  let slideCount=0;
  function slide(title,kicker='INTERNAL QUALITY AUDIT'){
    const s=pptx.addSlide();s.background={color:'F6F6F6'};slideCount++;
    s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:13.334,h:.12,fill:{color:'414141'},line:{color:'414141'}});
    s.addText('SITE READY  /  '+kicker,{x:.55,y:.35,w:12,h:.25,fontFace:'Arial',fontSize:9,color:'727272',charSpacing:1.6,margin:0});
    s.addText(title,{x:.55,y:.9,w:12.2,h:.7,fontFace:'Arial',fontSize:27,bold:false,color:'262626',margin:0,breakLine:false,fit:'shrink'});
    s.addText('Internal audit aid · '+(report.meta.location||'Location not specified'),{x:.55,y:7.08,w:11.5,h:.2,fontFace:'Arial',fontSize:8,color:'7C8F7D',margin:0});s.addText(String(slideCount),{x:12.1,y:7.08,w:.6,h:.2,fontFace:'Arial',fontSize:8,color:'7C8F7D',align:'right',margin:0});return s;
  }
  function text(s,value,y,h=1,options={}){s.addText(String(value),{x:.6,y,w:12.1,h,fontFace:'Arial',fontSize:16,color:'414141',margin:0,breakLine:false,fit:'shrink',valign:'top',...options});}
  let s=slide(report.title,'AUDIT REPORT');
  text(s,report.meta.organization||'Organization not recorded',2, .5,{fontSize:25,color:'414141'});
  text(s,Object.entries(metaNames).map(([key,label])=>label+': '+(report.meta[key]||'Not recorded')).join('\n'),2.8,2.6,{fontSize:15,breakLine:false});
  text(s,report.basis,5.8,.65,{fontSize:11,color:'7E775A'});
  // Long metadata values are also preserved in the appendix instead of silently clipping them.
  s=slide('Audit at a glance');
  text(s,percent(report.summary.percent)+'  audit score',1.9,.8,{fontSize:35,color:'414141'});
  text(s,report.summary.assessed+' / '+report.summary.total+' assessed   ·   '+report.summary.applicable+' scored applicable items',2.85,.5,{fontSize:19});
  text(s,counts(report).map(c=>c.label+': '+c.count).join('   |   '),3.6,.8,{fontSize:16});
  text(s,scoring(report),4.7,.8,{fontSize:13});text(s,limitation,5.7,.9,{fontSize:12,color:'7E775A'});
  s=slide('Reference clauses 1–3','AUDIT CRITERIA');text(s,'1 · Scope\nConfirm applicability to the organization and its intended QMS outcomes.\n\n2 · Normative references\nApply the references identified for this assessment.\n\n3 · Terms and definitions\nApply the referenced QMS vocabulary consistently. These clauses are not scored.',1.9,4.8,{fontSize:17});
  s=slide('Performance by PDCA');
  s.addChart(pptx.ChartType.bar,[{name:'Score (%)',labels:report.phaseScores.map(g=>g.phase),values:report.phaseScores.map(g=>g.percent??0)}],{x:.65,y:1.9,w:11.8,h:4.5,fontFace:'Arial',barDir:'bar',catAxisLabelFontSize:14,valAxisMinVal:0,valAxisMaxVal:100,valAxisMajorUnit:25,showValue:true,dataLabelPosition:'outEnd',chartColors:['414141'],showLegend:false,showTitle:false,showCatName:false,showBorder:false,showCatName:false,showShadow:false});
  text(s,'A zero bar may mean no scored responses. '+report.phaseScores.map(g=>g.phase+': '+percent(g.percent)+' ('+g.applicable+' scored)').join(' · '),6.5,.3,{fontSize:10});
  s=slide('Clause-level performance');
  s.addChart(pptx.ChartType.bar,[{name:'Score (%)',labels:report.clauseScores.map(g=>'Clause '+g.clause),values:report.clauseScores.map(g=>g.percent??0)}],{x:.65,y:1.8,w:11.8,h:4.7,fontFace:'Arial',barDir:'bar',catAxisLabelFontSize:12,valAxisMinVal:0,valAxisMaxVal:100,showValue:true,dataLabelPosition:'outEnd',chartColors:['414141'],showLegend:false});
  text(s,'Zero may mean no scored responses. '+report.clauseScores.map(g=>g.clause+': '+percent(g.percent)+' ('+g.applicable+' scored)').join(' · '),6.6,.3,{fontSize:10});
  s=slide('Finding distribution');const distribution=counts(report);
  if(report.summary.assessed)s.addChart(pptx.ChartType.doughnut,[{name:'Responses',labels:distribution.map(c=>c.label),values:distribution.map(c=>c.count)}],{x:.7,y:1.8,w:7.8,h:4.7,fontFace:'Arial',holeSize:65,showLegend:true,legendPos:'r',legendFontSize:12,chartColors:['4d4d4d','7399AA','CC995C','B75B4B','B9C3BC'],showValue:true,showPercent:false});
  else text(s,'No responses have been recorded.',2.2,1,{fontSize:22});
  text(s,distribution.map(c=>c.label+': '+c.count).join('\n'),2.1,3.8,{x:9,w:3.5,fontSize:14});
  // The complete question, evidence and action records are included, not just a summary deck.
  for(const item of report.items){
    const a=report.answers[item.id]||{};
    const record=[['Audit question',item.question],['Status',report.statuses[a.status]||'Not assessed'],['Suggested evidence',item.evidence],['Recorded evidence / N/A justification',a.note||'Not recorded']];
    if(a.finding||a.action||a.status==='major'||a.status==='minor')record.push(['Finding',a.finding||'Not recorded'],['Corrective action',a.action||'Not recorded'],['Action owner / due / status',(a.owner||'Unassigned')+' / '+(a.due||'Not set')+' / '+(a.closure||'Open')]);
    // Field-by-field pagination preserves long imported notes in the deck.
    let current=slide(item.clause+' · '+item.section,item.phase.toUpperCase()+' / '+item.id);let y=1.8;
    for(const [label,value] of record){for(const chunk of wrapChunks(value,850)){
      const lines=Math.max(chunk.split('\n').length,Math.ceil(chunk.length/115));const height=Math.min(3.4,Math.max(.65,.24*lines+.36));
      if(y+height>6.75){current=slide(item.id+' · continued',item.phase.toUpperCase());y=1.8;}
      text(current,label.toUpperCase(),y,.2,{fontSize:9,color:'747474',charSpacing:1});
      text(current,chunk,y+.27,height-.2,{fontSize:13});y+=height+.15;
    }}
  }
  for(const [key,label] of Object.entries(metaNames)){if((report.meta[key]||'').length>150){for(const chunk of wrapChunks(report.meta[key],1300)){s=slide('Assessment details · '+label,'APPENDIX');text(s,chunk,1.9,4.8,{fontSize:15});}}}
  await pptx.writeFile({fileName:filename(report,'pptx'),compression:true});
}
