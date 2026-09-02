const app=document.getElementById('app');
const toastEl=document.getElementById('toast');
const DB='confesionario-sr-db', STORE='videos';
const questions={
 individual:[
  '¿Cuál es el cotilleo de esta boda que estás deseando descubrir?',
  '¿Con qué invitado te irías de viaje mañana mismo?',
  '¿Qué crees que va a pasar esta noche que mañana nadie reconocerá?',
  '¿Qué consejo NO deberían seguir Sara y Ramón?',
  '¿Quién crees que será el último en abandonar la fiesta?',
  'Confiesa algo que nunca hayas dicho a Sara o Ramón.',
  '¿Qué apuesta haces sobre cómo serán Sara y Ramón dentro de 20 años?',
  '¿Cuál crees que será el momentazo de esta noche?',
  '¿Qué es lo más divertido que recuerdas de los novios?',
  'Si Sara y Ramón fueran una serie, ¿qué título tendría?'
 ],
 group:[
  '¿Quién tiene más posibilidades de acabar encima de una mesa?',
  '¿Quién sería el peor compañero de viaje?',
  '¿Quién conoce mejor a los novios? ¡Demostradlo!',
  'Inventad un titular para lo que va a ocurrir esta noche.',
  '¿Quién será el último de vuestro grupo en irse?',
  'Contad vuestra mejor anécdota con Sara o Ramón.',
  'Dadles un consejo matrimonial entre todos.',
  'Recread en 10 segundos cómo estarán Sara y Ramón dentro de 25 años.',
  '¿Quién del grupo se enamoraría primero de alguien en una boda?',
  'Describid a los novios con solo tres palabras, sin poneros de acuerdo.'
 ]
};
let stream=null,recorder=null,chunks=[],timerId=null,seconds=0,currentMode=null;

function bg(n,cls=''){return `<section class="screen bg${n} ${cls}"></section>`}
function home(){app.innerHTML=bg(1)+`<button class="hotspot home-start" aria-label="Empezar" onclick="choose()"></button>`}
function choose(){app.innerHTML=bg(2)+`<button class="hotspot choice c1" aria-label="Ponme a prueba" onclick="question('individual')"></button><button class="hotspot choice c2" aria-label="Ponednos a prueba" onclick="question('group')"></button><button class="hotspot choice c3" aria-label="Tenemos algo que decir" onclick="freeMode()"></button>`}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function question(mode){currentMode=mode;const q=pick(questions[mode]);const n=mode==='individual'?3:4;app.innerHTML=bg(n)+`<div class="dynamic-question">${q}</div><button class="hotspot record-hotspot" aria-label="Grabar" onclick="prepareRecord()"></button>`}
function freeMode(){app.innerHTML=bg(5)+`<button class="hotspot record-hotspot" aria-label="Grabar" onclick="prepareRecord()"></button>`}
async function prepareRecord(){
 try{await startCamera();showRecorder(false)}catch(e){toast('No se ha podido abrir la cámara o el micrófono. Revisa los permisos de Chrome.');}
}
async function startCamera(){
 if(stream) return stream;
 stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:true});
 return stream;
}
function mime(){const opts=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4'];return opts.find(x=>MediaRecorder.isTypeSupported(x))||''}
function showRecorder(auto){
 app.innerHTML=`<div class="screen bg5"></div><div class="recording-title">🔴 CONFESIONARIO</div><div class="center-overlay"><div class="video-shell"><video id="preview" autoplay playsinline muted></video><div class="record-ui"><div class="timer" id="timer">00:00</div><button class="rec-dot" id="recBtn" onclick="toggleRecord()">GRABAR</button><button class="cancel" onclick="cancelRecord()">Cancelar</button></div></div></div>`;
 document.getElementById('preview').srcObject=stream;
 if(auto) toggleRecord();
}
function toggleRecord(){
 if(recorder && recorder.state==='recording'){stopRecord();return}
 chunks=[];seconds=0;document.getElementById('timer').textContent='00:00';
 const type=mime(); recorder=new MediaRecorder(stream,type?{mimeType:type}:undefined);
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
 recorder.onstop=saveRecord;
 recorder.start(250);
 document.getElementById('recBtn').textContent='PARAR';document.getElementById('recBtn').classList.add('recording');
 timerId=setInterval(()=>{seconds++;document.getElementById('timer').textContent=format(seconds);if(seconds>=60)stopRecord()},1000);
}
function stopRecord(){if(!recorder||recorder.state!=='recording')return;clearInterval(timerId);recorder.stop()}
function cancelRecord(){clearInterval(timerId);if(recorder&&recorder.state==='recording')recorder.stop();else finish();}
function format(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
async function saveRecord(){
 const blob=new Blob(chunks,{type:recorder.mimeType||'video/webm'});const id=Date.now();
 try{await putVideo({id,blob,mode:currentMode||'libre',duration:seconds,created:new Date().toISOString()});toast('Confesión guardada');finish();}
 catch(e){console.error(e);toast('No se pudo guardar el vídeo en la tablet.');finish()}
}
function finish(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}recorder=null;chunks=[];setTimeout(()=>{app.innerHTML=bg(6)+`<button class="hotspot home-start" aria-label="Volver al inicio" onclick="home()"></button>`},80)}
function toast(msg){toastEl.textContent=msg;toastEl.classList.add('show');setTimeout(()=>toastEl.classList.remove('show'),2400)}
function db(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function putVideo(v){const d=await db();return new Promise((res,rej)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).put(v);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
async function allVideos(){const d=await db();return new Promise((res,rej)=>{const r=d.transaction(STORE,'readonly').objectStore(STORE).getAll();r.onsuccess=()=>res(r.result.sort((a,b)=>b.id-a.id));r.onerror=()=>rej(r.error)})}
async function clearVideos(){if(!confirm('¿Borrar TODAS las confesiones de esta tablet?'))return;const d=await db();await new Promise((res,rej)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});admin()}
function admin(){app.innerHTML=`<div class="admin"><button class="back" onclick="home()">← Volver</button><h1>Archivo de confesiones</h1><p>Zona privada. Los vídeos se guardan localmente en esta tablet.</p><div class="admin-actions"><button onclick="renderVideos()">Actualizar</button><button onclick="downloadAll()">Descargar todos</button><button onclick="clearVideos()">Borrar todos</button></div><div id="videoList" class="video-list">Cargando…</div></div>`;renderVideos()}
async function renderVideos(){const el=document.getElementById('videoList');if(!el)return;const vs=await allVideos();el.innerHTML=vs.length?vs.map(v=>{const u=URL.createObjectURL(v.blob);return `<article class="video-card"><video controls preload="metadata" src="${u}"></video><small>${new Date(v.created).toLocaleString('es-ES')} · ${v.mode||''} · ${v.duration||0}s</small><br><a download="confesion-${v.id}.webm" href="${u}">Descargar</a></article>`}).join(''):'<p>No hay confesiones todavía.</p>'}
async function downloadAll(){const vs=await allVideos();if(!vs.length){toast('No hay vídeos guardados');return}for(const v of vs){const u=URL.createObjectURL(v.blob);const a=document.createElement('a');a.href=u;a.download=`confesion-${v.id}.webm`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}toast('Descarga iniciada')}
let taps=0,tapTimer=null;document.addEventListener('click',e=>{if(e.clientY<160&&e.clientX>innerWidth*.35&&e.clientX<innerWidth*.65){taps++;clearTimeout(tapTimer);tapTimer=setTimeout(()=>taps=0,1000);if(taps>=5){taps=0;admin()}}});
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
home();
