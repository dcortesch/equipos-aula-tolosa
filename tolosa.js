'use strict';
const STORE='tolosa-equipos-v1';
let archive={version:1,groups:{},history:[]};
const el=id=>document.getElementById(id);
const status=message=>{el('tolosa-status').textContent=message;};
const copy=x=>JSON.parse(JSON.stringify(x));
function validState(s){
 if(!s||typeof s.group!=='string'||typeof s.subject!=='string'||!Array.isArray(s.students)||!Array.isArray(s.distribution))return false;
 const ids=new Set();
 for(const a of s.students){if(!a||typeof a.id!=='string'||ids.has(a.id)||typeof a.name!=='string'||!['helper','autonomous','needs-help'].includes(a.type))return false;ids.add(a.id);}
 const assigned=new Set();
 for(const g of s.distribution){if(!Array.isArray(g))return false;for(const a of g){if(!a||!ids.has(a.id)||assigned.has(a.id))return false;assigned.add(a.id);}}
 return !s.distribution.length||assigned.size===ids.size;
}
function validArchive(a){return a&&a.version===1&&a.groups&&typeof a.groups==='object'&&!Array.isArray(a.groups)&&Object.values(a.groups).every(validState)&&Array.isArray(a.history)&&a.history.every(h=>h&&typeof h.date==='string'&&typeof h.activity==='string'&&validState(h.state));}
try{const raw=localStorage.getItem(STORE);if(raw){const a=JSON.parse(raw);if(!validArchive(a))throw Error();archive=a;}}catch{status('No se pudo recuperar el guardado. Restaura una copia si la tienes.');}
function persist(){
 if(appState.group)archive.groups[appState.group]={...copy(appState),separations:el('separations').value};
 try{localStorage.setItem(STORE,JSON.stringify(archive));status('Guardado en este navegador.');}catch{status('No se pudo guardar. Descarga una copia antes de cerrar.');}
}
function recover(s){Object.assign(appState,copy(s));el('select-grupo').value=s.group;el('select-asignatura').value=s.subject;el('manual-names').value=s.students.map(x=>x.name).join('\n');el('separations').value=s.separations||'';renderConfigTab();renderClassroom();updateCounts();updateExportPreview();}
function historyMenu(){const select=el('history');select.replaceChildren(new Option('Selecciona una distribución',''));archive.history.forEach((h,i)=>{if(h.state.group===appState.group)select.add(new Option(h.date+' · '+h.activity,String(i)));});}
// Escape every imported name before the original card renderer uses HTML.
const escapeHTML=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const baseCard=createCard;
createCard=function(s){return baseCard({...s,name:escapeHTML(s.name)});};
const baseSave=saveData;
saveData=function(auto=false){
 const names=el('manual-names').value.split('\n').map(x=>x.trim()).filter(Boolean);
 if(new Set(names).size!==names.length){alert('Hay nombres repetidos. Añade un segundo apellido o identificador.');return;}
 if(!names.length)return;
 appState.distribution=[];baseSave(auto);renderClassroom();persist();historyMenu();
};
const baseDrop=drop;
drop=function(e,t){baseDrop(e,t);appState.distribution=[];renderClassroom();persist();};
function pairs(){const names=new Map(appState.students.map(x=>[x.name,x.id]));return el('separations').value.split('\n').filter(x=>x.trim()).map(line=>{const p=line.split('|').map(x=>x.trim());if(p.length!==2||!names.has(p[0])||!names.has(p[1])||p[0]===p[1])throw Error('Revisa la separación: '+line);return p.map(x=>names.get(x));});}
function compatible(student,group,restrictions){return !restrictions.some(([a,b])=>student.id===a&&group.some(x=>x.id===b)||student.id===b&&group.some(x=>x.id===a));}
function buildTeams(students,size,mode,restrictions){
 if(!students.length)return [];
 const n=Math.ceil(students.length/size),base=Math.floor(students.length/n),rem=students.length%n;
 const caps=Array.from({length:n},(_,i)=>base+(i<rem?1:0));
 const groups=caps.map(()=>[]),degree=id=>restrictions.filter(p=>p.includes(id)).length;
 const order=students.map(s=>({...s,r:Math.random()})).sort((a,b)=>degree(b.id)-degree(a.id)||a.r-b.r);
 let visits=0;
 function solve(k){if(k===order.length)return true;if(++visits>150000)return false;const s=order[k];
 const options=groups.map((g,i)=>({i,score:mode==='heterogeneo'?g.filter(x=>x.type===s.type).length*10+g.length:g.filter(x=>x.type!==s.type).length*10+g.length/10})).sort((a,b)=>a.score-b.score);
 const seen=new Set();for(const {i} of options){const g=groups[i];if(g.length>=caps[i]||!compatible(s,g,restrictions))continue;const sig=caps[i]+':'+g.map(x=>x.id).sort().join(',');if(seen.has(sig))continue;seen.add(sig);g.push(s);if(solve(k+1))return true;g.pop();}return false;}
 if(!solve(0))throw Error('No se ha encontrado un reparto que respete todas las separaciones. Revisa las restricciones o cambia el tamaño.');
 return groups.map(g=>g.map(({r,...s})=>s));
}
distributeStudents=function(){try{if(!appState.students.length)throw Error('Carga primero el alumnado.');appState.distribution=buildTeams(appState.students,Number(el('select-espacio').value),document.querySelector('[name="agrupamiento"]:checked').value,pairs());renderClassroom();persist();}catch(e){alert(e.message);}};
dropInDesk=function(e,t){e.preventDefault();try{const s=JSON.parse(e.dataTransfer.getData('text'));const src=appState.distribution.findIndex(g=>g.some(x=>x.id===s.id));if(src<0||src===t)return;const target=appState.distribution[t];if(target.length>=Number(el('select-espacio').value))throw Error('La mesa ya tiene el máximo de integrantes.');const real=appState.distribution[src].find(x=>x.id===s.id);if(!compatible(real,target,pairs()))throw Error('El movimiento incumple una separación.');if(appState.distribution[src].length<=1)throw Error('No se puede dejar una mesa vacía.');appState.distribution[src]=appState.distribution[src].filter(x=>x.id!==s.id);target.push(real);renderClassroom();persist();}catch(err){alert(err.message);}};
saveDistribution=function(){persist();switchTab('tab-export');};
el('open-group').onclick=()=>{if(appState.group)persist();const group=el('tolosa-group').value;recover(archive.groups[group]||{group,subject:'Matemáticas',students:[],distribution:[]});historyMenu();switchTab('tab-datos');status('Grupo abierto: '+group);};
el('separations').onchange=persist;
el('save-history').onclick=()=>{if(!appState.distribution.length)return alert('Genera primero los equipos.');archive.history.push({date:new Date().toLocaleString('es-ES'),activity:el('activity').value.trim()||'Actividad cooperativa',state:{...copy(appState),separations:el('separations').value}});persist();historyMenu();};
el('load-history').onclick=()=>{const v=el('history').value;if(v==='')return;recover(archive.history[Number(v)].state);persist();switchTab('tab-aula');};
el('backup').onclick=()=>{persist();const url=URL.createObjectURL(new Blob([JSON.stringify(archive,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='copia-privada-equipos-tolosa.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
el('restore').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>5000000)throw Error();const incoming=JSON.parse(await file.text());if(!validArchive(incoming))throw Error();if(!confirm('¿Reemplazar los grupos e historial locales con esta copia? Descarga antes una copia si quieres conservarlos.'))return;archive=incoming;appState.group='';persist();el('open-group').click();status('Copia restaurada.');}catch{alert('La copia no es válida. No se ha importado.');}finally{e.target.value='';}};
el('pupil-mode').onclick=()=>{const on=document.body.classList.toggle('pupil');el('pupil-mode').textContent=on?'Volver a vista docente':'Mostrar vista alumnado';if(on)switchTab('tab-aula');};
const basePDF=generatePDF;
generatePDF=function(){const before=document.body.classList.contains('pupil');document.body.classList.add('pupil');basePDF();setTimeout(()=>{if(!before)document.body.classList.remove('pupil');},1000);};
// The exported map always uses neutral colors, independently of teacher view.
const style=document.createElement('style');style.textContent='#print-area .student-helper,#print-area .student-autonomous,#print-area .student-needs-help{background:#e8f0fa!important;color:#183450!important;border-color:#9baec4!important}';document.head.appendChild(style);
resetApp=function(){if(!confirm('¿Vaciar el grupo actual? Las distribuciones del historial se conservarán.'))return;recover({group:appState.group,subject:appState.subject,students:[],distribution:[]});persist();switchTab('tab-datos');};
document.addEventListener('DOMContentLoaded',()=>{el('select-grupo').value='1º ESO E';el('select-asignatura').value='Matemáticas';});
