const app=document.getElementById('app');
const toastEl=document.getElementById('toast');
const DB='confesionario-sr-db', STORE='videos';
const SUPABASE_URL='https://uubdolbrrxtkogsybkyz.supabase.co';
// Pega aquí la Publishable/anon key de tu proyecto Supabase.
const SUPABASE_ANON_KEY='sb_publishable_bEmWJp9EJLRi8Yn8qr3vtw_IJ0lJWNI';
const MAX_SECONDS=60;
const questions={
 individual:[
  '¿Cuál es tu secreto mejor guardado de esta boda?',
  '¿A quién de los novios le das el premio a “más probable que mande en casa”?',
  'Confiesa: ¿qué pensaste la primera vez que conociste a Sara o a Ramón?',
  '¿Cuál es la mayor locura que has hecho por amor?',
  '¿Qué canción no puede faltar esta noche aunque dé vergüenza reconocerlo?',
  '¿Con quién de los invitados te irías de fiesta hasta las 8 de la mañana?',
  '¿Qué es lo más ridículo que has hecho estando de fiesta?',
  'Si pudieras robarle una cosa a uno de los novios, ¿qué sería?',
  '¿Cuál ha sido tu peor cita?',
  '¿Qué mentira piadosa has contado alguna vez para librarte de un plan?',
  '¿Qué invitado crees que tiene más papeletas para acabar haciendo algo memorable?',
  'Confiesa algo que nunca hayas contado en una boda.',
  '¿Qué canción describe mejor tu vida amorosa?',
  '¿Qué es lo más raro que has hecho para conseguir algo que querías?',
  'Si tuvieras que describir a Sara y Ramón con tres palabras, ¿cuáles serían?'
 ],
 group:[
  '¿Quién conoció primero a los novios?',
  '¿Quién de vosotros se emborracha antes?',
  '¿Quién tiene más posibilidades de acabar bailando encima de una silla?',
  '¿Quién ligaría antes si todos estuvierais solteros?',
  '¿Quién es el más cotilla del grupo?',
  '¿Quién llega siempre tarde?',
  '¿Quién tiene más posibilidades de perder el móvil esta noche?',
  '¿Quién será el último en abandonar la boda?',
  '¿Quién tiene más papeletas para acabar cantando a gritos?',
  '¿Quién cuenta peor los chistes?',
  '¿Quién de vosotros conoció a Sara antes? ¿Y a Ramón?',
  '¿Quién de los dos novios manda realmente?',
  '¿Quién de los novios creéis que ha tardado más en organizar esta boda?',
  '¿Cuál es el mejor recuerdo que tenéis con Sara y Ramón?',
  'Contad una anécdota de los novios que ellos hayan olvidado.',
  'Inventad el titular del periódico del día después de esta boda.',
  '¿Qué creéis que pasará esta noche y que mañana nadie querrá reconocer?',
  '¿Cuál de vosotros tiene más posibilidades de aparecer en un vídeo viral mañana?',
  '¿Quién tiene el mayor talento inútil y cuál es?',
  '¿Quién va a decir mañana “yo no hice eso”?',
  '¿Quién tiene más posibilidades de mandar un mensaje del que mañana se arrepienta?',
  '¿Quién sería capaz de abandonar la boda para irse de fiesta a otro sitio?',
  '¿Quién se va a emocionar y acabará llorando?',
  '¿Quién tiene más posibilidades de acabar cantando con el DJ?',
  '¿Quién va a ser el primero en quitarse los zapatos?',
  '¿Quién tiene más posibilidades de perder algo esta noche?',
  '¿Quién tiene más posibilidades de contar una intimidad sin darse cuenta?',
  '¿Quién de este grupo NO debería tener acceso al micrófono después de las 2 de la mañana?',
  '¿Quién es el más peligroso cuando dice “solo una copa”?',
  '¿Quién tiene más posibilidades de liarla esta noche?',
  '¿Quién tiene más posibilidades de ser protagonista de la anécdota de esta boda?',
  '¿Quién tiene más posibilidades de despertarse mañana y pensar: “¿Qué hice anoche?”'
 ]
};
// La última pregunta estaba repetida en la lista original; la mantenemos una sola vez.
questions.group=questions.group.filter((q,i)=>q!==questions.group[i-1]);
let currentMode=null, pendingFile=null;
function bg(n,cls=''){return `<section class="screen bg${n} ${cls}"></section>`}
function home(){app.innerHTML=bg(1)+`<button class="hotspot home-start" aria-label="Empezar" onclick="choose()"></button>`}
function choose(){app.innerHTML=bg(2)+`<button class="hotspot choice c1" aria-label="Ponme a prueba" onclick="question('individual')"></button><button class="hotspot choice c2" aria-label="Ponednos a prueba" onclick="question('group')"></button><button class="hotspot choice c3" aria-label="Tenemos algo que decir" onclick="freeMode()"></button>`}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function question(mode){currentMode=mode;const q=pick(questions[mode]);const n=mode==='individual'?3:4;app.innerHTML=bg(n)+`<div class="dynamic-question">${q}</div><button class="hotspot record-hotspot" aria-label="Abrir cámara" onclick="openCamera()"></button>`}
function freeMode(){currentMode='libre';app.innerHTML=bg(5)+`<button class="hotspot record-hotspot" aria-label="Abrir cámara" onclick="openCamera()"></button>`}
function openCamera(){
 let input=document.getElementById('cameraInput');
 if(!input){input=document.createElement('input');input.type='file';input.id='cameraInput';input.accept='video/*';input.setAttribute('capture','user');input.style.display='none';document.body.appendChild(input);input.addEventListener('change',handleVideoFile)}
 input.value='';input.click();
}
async function handleVideoFile(e){const file=e.target.files?.[0];if(!file)return;pendingFile=file;const duration=await getDuration(file);if(duration>MAX_SECONDS+0.5){pendingFile=null;toast('El vídeo supera el máximo de 60 segundos.');return}showSelectedVideo(file,duration)}
function showSelectedVideo(file,duration){
 const url=URL.createObjectURL(file);
 app.innerHTML=`<div class="camera-review"><div class="review-card"><h1>CONFESIONARIO</h1><video id="selectedVideo" controls playsinline src="${url}"></video><p>¿Está bien el vídeo?</p><div class="review-actions"><button onclick="confirmVideo(${duration})">GUARDAR VÍDEO</button><button class="secondary" onclick="openCamera()">VOLVER A GRABAR</button></div></div></div>`;
}
async function confirmVideo(duration){if(!pendingFile)return;const file=pendingFile;pendingFile=null;await saveRecord(file,duration)}
function getDuration(file){return new Promise((resolve)=>{const u=URL.createObjectURL(file),v=document.createElement('video');v.preload='metadata';v.onloadedmetadata=()=>{const d=v.duration;URL.revokeObjectURL(u);resolve(Number.isFinite(d)?d:0)};v.onerror=()=>{URL.revokeObjectURL(u);resolve(0)};v.src=u})}
async function saveRecord(file,duration){
 const type=file.type||'video/mp4';
 const blob=file.slice(0,file.size,type);const id=Date.now();const created=new Date().toISOString();
 app.innerHTML=`<div class="processing"><div><h1>Guardando vuestra confesión…</h1><p>Un momento, por favor.</p></div></div>`;
 try{
  // 1) Guardado local interno del confesionario.
  await putVideo({id,blob,mode:currentMode||'libre',duration:Math.round(duration),created,type});
  // 2) Descarga como archivo real en la tablet (normalmente en Descargas).
  downloadLocal(blob,id,type);
  // 3) Copia temporal en Supabase.
  let remote=null;
  if(SUPABASE_ANON_KEY!=='PEGA_AQUI_TU_PUBLISHABLE_KEY') remote=await uploadToSupabase(blob,id,type);
  showThanks(remote,id,type);
 }catch(e){
  console.error(e);
  toast('La copia local se ha guardado, pero ha fallado una parte del proceso.');
  setTimeout(()=>finish(),3000);
 }
}
function extensionFor(type){return (type||'').includes('mp4')?'mp4':'webm'}
function downloadLocal(blob,id,type){
 const ext=extensionFor(type);const u=URL.createObjectURL(blob);const a=document.createElement('a');
 a.href=u;a.download=`confesion-${id}.${ext}`;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(u),10000);
}
async function uploadToSupabase(blob,id,type){
 const fd=new FormData();const ext=extensionFor(type);fd.append('video',blob,`confesion-${id}.${ext}`);
 const r=await fetch(`${SUPABASE_URL}/functions/v1/upload-video`,{method:'POST',headers:{Authorization:`Bearer ${SUPABASE_ANON_KEY}`,apikey:SUPABASE_ANON_KEY},body:fd});
 const data=await r.json().catch(()=>({}));
 if(!r.ok||!data.success)throw new Error(data.error||`HTTP ${r.status}`);return data;
}
function showThanks(remote,id,type){
 const localName=`confesion-${id}.${extensionFor(type)}`;
 app.innerHTML=bg(6)+`<div class="thanks-panel">
   <p class="local-ok">✓ Vídeo guardado en la tablet</p>
   ${remote?`<p class="upload-ok">✓ Copia temporal preparada durante 10 minutos</p>
     <div class="qr-box"><div id="qrcode"></div><p>Escanea este código para descargar tu vídeo</p><small>El enlace dejará de funcionar al caducar la copia temporal.</small></div>
     <a class="download-fallback" href="${escapeAttr(remote.downloadUrl)}" target="_blank" rel="noopener">Abrir descarga del vídeo</a>`:
     `<p class="upload-warn">⚠ La copia temporal no se ha podido preparar.</p><p class="upload-help">El vídeo local sigue guardado en la tablet.</p>`}
   <p class="filename">Copia local: ${localName}</p>
 </div><button class="hotspot home-start" aria-label="Volver al inicio" onclick="home()"></button>`;
 if(remote?.downloadUrl) makeQr(remote.downloadUrl);
 setTimeout(home,20000);
}
function escapeAttr(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function makeQr(url){
 const el=document.getElementById('qrcode');if(!el)return;
 if(window.QRCode){new QRCode(el,{text:url,width:190,height:190,correctLevel:QRCode.CorrectLevel.M});}
 else {el.innerHTML=`<div class="qr-fallback">QR no disponible sin conexión.<br><a href="${escapeAttr(url)}" target="_blank" rel="noopener">Abrir enlace de descarga</a></div>`;}
}
function finish(){pendingFile=null;setTimeout(home,80)}
function toast(msg){toastEl.textContent=msg;toastEl.classList.add('show');setTimeout(()=>toastEl.classList.remove('show'),3000)}
function db(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function putVideo(v){const d=await db();return new Promise((res,rej)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).put(v);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
async function allVideos(){const d=await db();return new Promise((res,rej)=>{const r=d.transaction(STORE,'readonly').objectStore(STORE).getAll();r.onsuccess=()=>res(r.result.sort((a,b)=>b.id-a.id));r.onerror=()=>rej(r.error)})}
async function clearVideos(){if(!confirm('¿Borrar TODAS las confesiones de esta tablet?'))return;const d=await db();await new Promise((res,rej)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});admin()}
function admin(){app.innerHTML=`<div class="admin"><button class="back" onclick="home()">← Volver</button><h1>Archivo de confesiones</h1><p>Los vídeos se guardan en esta tablet y también se descargan en la carpeta de descargas.</p><div class="admin-actions"><button onclick="renderVideos()">Actualizar</button><button onclick="downloadAll()">Descargar todos</button><button onclick="clearVideos()">Borrar todos</button></div><div id="videoList" class="video-list">Cargando…</div></div>`;renderVideos()}
async function renderVideos(){const el=document.getElementById('videoList');if(!el)return;const vs=await allVideos();el.innerHTML=vs.length?vs.map(v=>{const u=URL.createObjectURL(v.blob);return `<article class="video-card"><video controls preload="metadata" src="${u}"></video><small>${new Date(v.created).toLocaleString('es-ES')} · ${v.mode||''} · ${v.duration||0}s</small><br><a download="confesion-${v.id}.${extensionFor(v.type)}" href="${u}">Descargar</a></article>`}).join(''):'<p>No hay confesiones todavía.</p>'}
async function downloadAll(){const vs=await allVideos();if(!vs.length){toast('No hay vídeos guardados');return}for(const v of vs)downloadLocal(v.blob,v.id);toast('Descarga iniciada')}
let taps=0,tapTimer=null;document.addEventListener('click',e=>{if(e.clientY<160&&e.clientX>innerWidth*.35&&e.clientX<innerWidth*.65){taps++;clearTimeout(tapTimer);tapTimer=setTimeout(()=>taps=0,1000);if(taps>=5){taps=0;admin()}}});
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
home();
