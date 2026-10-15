(function(){
"use strict";
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* ---------- DOM refs ---------- */
const el = {
  video:$('#video'), container:$('#container'), poster:$('#poster'), posterTitle:$('#posterTitle'), posterHint:$('#posterHint'),
  overlay:$('#overlay'), chip:$('#chip'),
  btnPlay:$('#btnPlay'), btnPrev:$('#btnPrev'), btnNext:$('#btnNext'), btnStop:$('#btnStop'),
  btnPrevBig:$('#btnPrevBig'), btnNextBig:$('#btnNextBig'),
  btnFrameBack:$('#btnFrameBack'), btnFrameFwd:$('#btnFrameFwd'),
  btnRepeat:$('#btnRepeat'), btnShuffle:$('#btnShuffle'), btnAb:$('#btnAb'),
  btnVol:$('#btnVol'), volume:$('#volume'), btnSpeed:$('#btnSpeed'), btnEq:$('#btnEq'),
  btnSnapshot:$('#btnSnapshot'), btnAspect:$('#btnAspect'), btnPip:$('#btnPip'), btnFull:$('#btnFull'), btnTheater:$('#btnTheater'),
  timeline:$('#timeline'), tlBuffer:$('#tlBuffer'), tlPlayed:$('#tlPlayed'), tlHandle:$('#tlHandle'), tlChapters:$('#tlChapters'), tlAb:$('#tlAb'),
  timeCur:$('#timeCur'), timeDur:$('#timeDur'),
  scrubTip:$('#scrubTip'), scrubImg:$('#scrubImg'), scrubTime:$('#scrubTime'),
  stats:$('#stats'),
  plList:$('#plList'), plSearch:$('#plSearch'), plCount:$('#plCount'), plTotal:$('#plTotal'),
  sidebar:$('#sidebar'), playlistPanel:$('#playlistPanel'), status:$('#status'),
  fileInput:$('#fileInput'), folderInput:$('#folderInput'), subInput:$('#subInput'), chapterInput:$('#chapterInput'),
  drawer:$('#drawer'), toasts:$('#toasts'), ctx:$('#ctx'),
};

/* ---------- State ---------- */
const st = {
  playlist:[], current:-1,
  volume:0.8, muted:false, speed:1, repeat:'off', shuffle:false, aspect:'fit',
  boost:1, eq:[0,0,0,0,0], eqPreset:'Flat',
  filters:{brightness:1, contrast:1, saturate:1}, rotate:0, flipH:false, flipV:false,
  ab:{a:null, b:null},
  recent:[], bookmarks:[], history:[], resume:{},
  theme:'dark', accent:'#0078d7', view:'list',
  seekStep:5, resumeOn:true, autoplay:true,
  subOffset:0, subStyle:{fontSize:'20px', color:'#ffffff', bg:'rgba(0,0,0,.75)'},
  subTrack:null, chapters:[], scrubThumbs:[], thumbDone:{},
  seeking:false, dragging:false, idleTimer:null, saveTimer:null,
  audio:{ctx:null, src:null, boost:null, bands:null, ready:false},
  statsOn:false, theater:false
};

/* ---------- Helpers ---------- */
const fmt = s => {
  if(!isFinite(s)||s<0) return '0:00';
  s=Math.floor(s); const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=s%60,p=n=>String(n).padStart(2,'0');
  return h>0?`${h}:${p(m)}:${p(ss)}`:`${m}:${p(ss)}`;
};
const base = p => (p||'').split(/[\\/]/).pop() || p || '';
const esc = t => { const d=document.createElement('div'); d.textContent=t==null?'':t; return d.innerHTML; };
const uid = () => 'v'+Date.now()+Math.random().toString(36).slice(2,7);

function setStatus(msg, ms=2500){
  el.status.textContent = msg;
  clearTimeout(setStatus._t);
  setStatus._t = setTimeout(()=>el.status.textContent='Ready', ms);
}
function toast(msg, icon='fa-circle-info'){
  const t=document.createElement('div'); t.className='toast'; t.innerHTML=`<i class="fa-solid ${icon}"></i>${esc(msg)}`;
  el.toasts.appendChild(t);
  setTimeout(()=>{ t.classList.add('out'); setTimeout(()=>t.remove(),240); }, 2600);
}
const persist = () => { try{ saveStore(); }catch(e){ console.warn(e); } };

/* ---------- Persistence ---------- */
function saveStore(){
  const cleanPl = st.playlist.filter(it=>!it.src.startsWith('blob:')).map(({id,src,title,duration,thumb,kind})=>({id,src,title,duration,thumb,kind}));
  localStorage.setItem('vp_playlist', JSON.stringify(cleanPl));
  localStorage.setItem('vp_settings', JSON.stringify({
    volume:st.volume,muted:st.muted,speed:st.speed,repeat:st.repeat,shuffle:st.shuffle,aspect:st.aspect,
    boost:st.boost,eq:st.eq,eqPreset:st.eqPreset,filters:st.filters,rotate:st.rotate,flipH:st.flipH,flipV:st.flipV,
    theme:st.theme,accent:st.accent,view:st.view,seekStep:st.seekStep,resumeOn:st.resumeOn,autoplay:st.autoplay,
    subOffset:st.subOffset,subStyle:st.subStyle
  }));
  localStorage.setItem('vp_recent', JSON.stringify(st.recent));
  localStorage.setItem('vp_bookmarks', JSON.stringify(st.bookmarks));
  localStorage.setItem('vp_history', JSON.stringify(st.history));
  localStorage.setItem('vp_resume', JSON.stringify(st.resume));
}
function loadStore(){
  try{
    const pl=JSON.parse(localStorage.getItem('vp_playlist')||'[]');
    st.playlist = pl.filter(it=>it.src && !it.src.startsWith('blob:')).map(it=>({...it,id:it.id||uid()}));
    const s=JSON.parse(localStorage.getItem('vp_settings')||'{}');
    Object.assign(st,{
      volume:s.volume??0.8,muted:s.muted??false,speed:s.speed??1,repeat:s.repeat??'off',shuffle:s.shuffle??false,aspect:s.aspect??'fit',
      boost:s.boost??1,eq:s.eq??[0,0,0,0,0],eqPreset:s.eqPreset??'Flat',filters:s.filters??{brightness:1,contrast:1,saturate:1},
      rotate:s.rotate??0,flipH:s.flipH??false,flipV:s.flipV??false,theme:s.theme??'dark',accent:s.accent??'#0078d7',
      view:s.view??'list',seekStep:s.seekStep??5,resumeOn:s.resumeOn??true,autoplay:s.autoplay??true,
      subOffset:s.subOffset??0,subStyle:s.subStyle??{fontSize:'20px',color:'#ffffff',bg:'rgba(0,0,0,.75)'}
    });
    st.recent=JSON.parse(localStorage.getItem('vp_recent')||'[]');
    st.bookmarks=JSON.parse(localStorage.getItem('vp_bookmarks')||'[]');
    st.history=JSON.parse(localStorage.getItem('vp_history')||'[]');
    st.resume=JSON.parse(localStorage.getItem('vp_resume')||'{}');
  }catch(e){ console.warn('loadStore',e); }
}

/* ---------- Theme / accent ---------- */
function applyTheme(){
  document.body.dataset.theme = st.theme;
  document.documentElement.style.setProperty('--accent', st.accent);
  document.documentElement.style.setProperty('--accent-2', shade(st.accent, 40));
  $$('#themeBtns button').forEach(b=>b.classList.toggle('active', b.dataset.theme===st.theme));
  $$('#accentSwatches .swatch').forEach(s=>s.classList.toggle('active', s.dataset.color===st.accent));
}
function shade(hex, amt){
  const n=parseInt(hex.slice(1),16); let r=(n>>16)+amt,g=((n>>8)&255)+amt,b=(n&255)+amt;
  r=Math.max(0,Math.min(255,r));g=Math.max(0,Math.min(255,g));b=Math.max(0,Math.min(255,b));
  return '#'+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0');
}

/* ---------- Audio graph (boost + EQ) ---------- */
const EQ_FREQS=[60,230,910,3600,14000];
function audioEligible(){
  const s=el.video.currentSrc||el.video.src||'';
  return s.startsWith('blob:') || s.startsWith('data:') || s.startsWith(location.origin);
}
function initAudio(){
  if(st.audio.ready) return st.audio.ctx;
  if(!audioEligible()) return null;
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext; if(!Ctx) return null;
    const ctx=new Ctx();
    const src=ctx.createMediaElementSource(el.video);
    const boost=ctx.createGain(); boost.gain.value=st.boost;
    let node=src.connect(boost);
    const bands=EQ_FREQS.map((f,i)=>{
      const b=ctx.createBiquadFilter(); b.type='peaking'; b.frequency.value=f; b.Q.value=1; b.gain.value=st.eq[i]||0;
      node.connect(b); node=b; return b;
    });
    node.connect(ctx.destination);
    st.audio={ctx,src,boost,bands,ready:true};
    return ctx;
  }catch(e){ console.warn('audio init',e); return null; }
}
function applyEq(){ if(st.audio.ready) st.audio.bands.forEach((b,i)=>b.gain.value=st.eq[i]||0); }
function applyBoost(){ if(st.audio.ready) st.audio.boost.gain.value=st.boost; }
const EQ_PRESETS={
  Flat:[0,0,0,0,0], 'Bass Boost':[9,6,0,-1,-2], 'Treble Boost':[-2,-1,0,6,9], Rock:[6,3,-2,3,6],
  Pop:[-1,2,4,2,-1], Vocal:[-3,0,5,4,0], Classical:[4,2,-2,2,4], Loudness:[8,4,-4,4,8], Podcast:[-2,1,4,2,-1]
};

/* ---------- Playlist ---------- */
function updateToggles(){
  el.btnRepeat.classList.toggle('active', st.repeat!=='off');
  el.btnRepeat.title = 'Repeat: '+st.repeat;
  el.btnShuffle.classList.toggle('active', st.shuffle);
  el.btnAb.classList.toggle('active', st.ab.a!=null);
  el.btnSpeed.textContent = st.speed+'×';
}
function renderPlaylist(){
  const q=el.plSearch.value.toLowerCase();
  el.plList.className='pl-list'+(st.view==='grid'?' grid':'');
  el.plList.innerHTML='';
  let count=0, total=0;
  st.playlist.forEach((it,i)=>{
    if(q && !it.title.toLowerCase().includes(q)) return;
    count++;
    if(it.duration) total+=it.duration;
    const active=i===st.current;
    const li=document.createElement('li');
    li.className='pl-item'+(active?' active':''); li.dataset.index=i; li.draggable=true;
    const thumb = it.thumb ? `<img src="${it.thumb}">` : `<i class="fa-solid fa-film"></i>`;
    const badge = it.kind==='remote' ? `<span class="pl-badge">URL</span>` : '';
    li.innerHTML=`
      <div class="pl-thumb">${thumb}<div class="playing-bars"><i class="fa-solid fa-volume-high"></i></div></div>
      <div class="pl-info">
        <div class="pl-title" title="${esc(it.title)}">${esc(it.title)}</div>
        <div class="pl-sub"><span>${it.duration?fmt(it.duration):'--:--'}</span>${badge}</div>
      </div>
      <button class="pl-remove" data-index="${i}" title="Remove"><i class="fa-solid fa-xmark"></i></button>`;
    li.addEventListener('click',e=>{ if(e.target.closest('.pl-remove')) return; app.playIndex(i); });
    li.querySelector('.pl-remove').addEventListener('click',e=>{ e.stopPropagation(); removeItem(i); });
    li.addEventListener('contextmenu',e=>{ e.preventDefault(); showCtx(e, i); });
    li.addEventListener('dragstart',e=>{ st.dragFrom=i; li.classList.add('dragging'); e.dataTransfer.effectAllowed='move'; });
    li.addEventListener('dragend',()=>{ li.classList.remove('dragging'); $$('.pl-item').forEach(x=>x.classList.remove('drop-target')); });
    li.addEventListener('dragover',e=>{ e.preventDefault(); li.classList.add('drop-target'); });
    li.addEventListener('dragleave',()=>li.classList.remove('drop-target'));
    li.addEventListener('drop',e=>{ e.preventDefault(); li.classList.remove('drop-target'); if(st.dragFrom==null||st.dragFrom===i) return; reorder(st.dragFrom,i); });
    el.plList.appendChild(li);
  });
  el.plCount.textContent=count+' item'+(count!==1?'s':'');
  el.plTotal.textContent='Total '+fmt(total);
  updateToggles();
}
function reorder(from,to){
  const [it]=st.playlist.splice(from,1);
  st.playlist.splice(to,0,it);
  if(st.current===from) st.current=to;
  else if(st.current>from&&st.current<=to) st.current--;
  else if(st.current>=to&&st.current<from) st.current++;
  persist(); renderPlaylist(); toast('Playlist reordered','fa-arrow-up-wide-short');
}
function addItems(files){
  let added=0;
  files.forEach(f=>{
    if(st.playlist.some(p=>p.src===f.src)) return;
    st.playlist.push({id:uid(),src:f.src,title:f.title||base(f.src),duration:f.duration||0,thumb:f.thumb||'',kind:f.kind||'local'});
    added++;
  });
  if(!added){ toast('Already in playlist','fa-circle-info'); return; }
  persist(); renderPlaylist();
  if(st.current===-1&&st.playlist.length) app.playIndex(0);
  toast(`Added ${added} item${added!==1?'s':''}`,'fa-plus');
}
function removeItem(i){
  const wasCurrent=i===st.current;
  st.playlist.splice(i,1);
  if(wasCurrent){ app.stop(); st.current=-1; }
  else if(st.current>i) st.current--;
  persist(); renderPlaylist();
  if(wasCurrent) refreshVideoUI();
}
function clearPlaylist(){
  st.playlist=[]; st.current=-1; el.video.pause(); el.video.removeAttribute('src'); el.video.load();
  persist(); renderPlaylist(); showPoster('No video loaded','Click Open or drag & drop');
  toast('Playlist cleared','fa-trash');
}

/* ---------- Playback ---------- */
function showPoster(title,hint){
  el.poster.style.display='flex';
  if(title) el.posterTitle.textContent=title;
  if(hint) el.posterHint.textContent=hint;
}
function hidePoster(){ el.poster.style.display='none'; }

function playIndex(i,force){
  if(!st.playlist.length) return;
  i=((i%st.playlist.length)+st.playlist.length)%st.playlist.length;
  if(st.current===i && !force && !el.video.paused) return;
  st.current=i;
  const it=st.playlist[i];
  if(!it.src){ setStatus('File needs re-adding — click Open'); return; }
  el.chip.textContent=it.title; el.chip.style.display='block';
  clearTimeout(playIndex._ct); playIndex._ct=setTimeout(()=>el.chip.style.display='none',2200);
  el.video.poster='';
  el.video.src=it.src; el.video.load();
  // resume position
  if(st.resumeOn && st.resume[it.title]>3){
    const t=st.resume[it.title];
    el.video.addEventListener('loadedmetadata',function once(){
      el.video.currentTime=Math.min(t, (el.video.duration||t)-0.5);
      el.video.removeEventListener('loadedmetadata',once);
      toast(`Resumed from ${fmt(t)}`,'fa-clock-rotate-left');
    });
  }
  el.video.play().catch(()=>setStatus('Click Play to start'));
  renderPlaylist(); addRecent(it); addHistory(it); updateMediaSession(it);
  setStatus('Playing: '+it.title);
  genScrubThumbs(it);
}
function refreshVideoUI(){
  if(st.current>=0&&st.current<st.playlist.length){
    const it=st.playlist[st.current]; el.video.src=it.src; el.video.load();
  }else{ el.video.removeAttribute('src'); }
  updatePlayBtn();
}
const playPause=()=>{
  if(!st.playlist.length){ toast('Playlist is empty','fa-triangle-exclamation'); return; }
  if(st.current===-1){ app.playIndex(0); return; }
  if(el.video.paused||el.video.ended) el.video.play().catch(()=>{});
  else el.video.pause();
};
const stop=()=>{
  el.video.pause(); el.video.currentTime=0;
  if(st.playlist[st.current]) saveResume(st.playlist[st.current],0);
  updatePlayBtn(); showPoster('Stopped','Click Play to resume'); setStatus('Stopped');
};
const next=()=>{
  if(!st.playlist.length) return;
  if(st.shuffle){ let n=randOther(); app.playIndex(n); }
  else if(st.repeat==='all') app.playIndex(st.current+1);
  else if(st.current+1<st.playlist.length) app.playIndex(st.current+1);
  else { setStatus('End of playlist'); toast('End of playlist','fa-list'); }
};
const prev=()=>{
  if(!st.playlist.length) return;
  if(el.video.currentTime>3){ el.video.currentTime=0; return; }
  if(st.shuffle){ app.playIndex(randOther()); }
  else if(st.repeat==='all') app.playIndex(st.current-1);
  else app.playIndex(Math.max(0,st.current-1));
};
function randOther(){ if(st.playlist.length<2) return st.current; let n=st.current; while(n===st.current) n=Math.floor(Math.random()*st.playlist.length); return n; }

const toggleRepeat=()=>{
  const o=['off','all','one']; st.repeat=o[(o.indexOf(st.repeat)+1)%o.length];
  persist(); updateToggles(); toast('Repeat: '+st.repeat,'fa-repeat');
};
const toggleShuffle=()=>{ st.shuffle=!st.shuffle; persist(); updateToggles(); toast('Shuffle: '+(st.shuffle?'On':'Off'),'fa-shuffle'); };
const setVolume=v=>{ st.volume=Math.max(0,Math.min(1,+v)); if(st.muted&&st.volume>0)st.muted=false; el.video.volume=st.muted?0:st.volume; el.volume.value=st.volume; updateVol(); persist(); };
const toggleMute=()=>{ st.muted=!st.muted; el.video.volume=st.muted?0:st.volume; updateVol(); persist(); toast(st.muted?'Muted':'Unmuted', st.muted?'fa-volume-xmark':'fa-volume-high'); };
function updateVol(){
  let i='fa-volume-high'; if(st.muted||el.video.volume===0)i='fa-volume-xmark'; else if(el.video.volume<0.5)i='fa-volume-low';
  el.btnVol.innerHTML=`<i class="fa-solid ${i}"></i>`;
  el.btnVol.classList.toggle('active', st.muted||el.video.volume===0);
}
const setSpeed=v=>{ st.speed=+v; el.video.playbackRate=st.speed; $('#setSpeed').value=st.speed; persist(); updateToggles(); toast('Speed '+st.speed+'×','fa-gauge-high'); };
const cycleSpeed=()=>{ const a=[0.5,0.75,1,1.25,1.5,2]; let i=a.indexOf(st.speed); if(i<0)i=2; setSpeed(a[(i+1)%a.length]); };

/* ---------- A-B loop ---------- */
function setA(){ st.ab.a=el.video.currentTime; if(st.ab.b!=null&&st.ab.b<=st.ab.a) st.ab.b=null; renderAb(); toast('A set at '+fmt(st.ab.a),'fa-a'); }
function setB(){ if(st.ab.a==null){ toast('Set A first','fa-triangle-exclamation'); return; } st.ab.b=el.video.currentTime; if(st.ab.b<=st.ab.a){ st.ab.b=null; toast('B must be after A','fa-triangle-exclamation'); return; } renderAb(); toast('B set at '+fmt(st.ab.b),'fa-b'); }
function clearAb(){ st.ab={a:null,b:null}; renderAb(); toast('A–B cleared','fa-xmark'); }
function cycleAb(){ if(st.ab.a==null) setA(); else if(st.ab.b==null) setB(); else clearAb(); }
function renderAb(){
  const d=el.video.duration||0;
  if(st.ab.a!=null&&st.ab.b!=null&&d){
    el.tlAb.classList.add('show');
    el.tlAb.style.left=(st.ab.a/d*100)+'%';
    el.tlAb.style.width=((st.ab.b-st.ab.a)/d*100)+'%';
  }else el.tlAb.classList.remove('show');
  updateToggles();
}

/* ---------- Frame step ---------- */
function frameStep(dir){
  if(el.video.paused){} else el.video.pause();
  const step=1/30;
  el.video.currentTime=Math.max(0,Math.min((el.video.duration||0), el.video.currentTime+dir*step));
  updateUI();
}

/* ---------- Snapshot ---------- */
function snapshot(){
  if(!el.video.videoWidth){ toast('No video to capture','fa-triangle-exclamation'); return; }
  try{
    const c=document.createElement('canvas'); c.width=el.video.videoWidth; c.height=el.video.videoHeight;
    c.getContext('2d').drawImage(el.video,0,0,c.width,c.height);
    c.toBlob(b=>{
      const a=document.createElement('a');
      a.href=URL.createObjectURL(b);
      a.download=(st.playlist[st.current]?.title||'snapshot').replace(/\.[^.]+$/,'')+'_'+Math.floor(el.video.currentTime)+'s.png';
      a.click(); URL.revokeObjectURL(a.href);
    },'image/png');
    toast('Snapshot saved','fa-camera');
  }catch(e){ toast('Snapshot failed (CORS)','fa-triangle-exclamation'); }
}

/* ---------- Fullscreen / PiP / Theater ---------- */
function toggleFull(){ if(!document.fullscreenElement) el.container.requestFullscreen?.(); else document.exitFullscreen?.(); }
function togglePip(){ if(!document.pictureInPictureEnabled){toast('PiP not supported','fa-triangle-exclamation');return;} if(document.pictureInPictureElement)document.exitPictureInPicture(); else el.video.requestPictureInPicture().catch(()=>{}); }
function toggleTheater(){
  st.theater=!st.theater; el.btnTheater.classList.toggle('active',st.theater);
  el.sidebar.classList.toggle('hidden',st.theater); el.playlistPanel.classList.toggle('hidden',st.theater);
  toast('Theater mode '+(st.theater?'on':'off'),'fa-tv');
}
function cycleAspect(){ const o=['fit','fill','stretch']; st.aspect=o[(o.indexOf(st.aspect)+1)%o.length]; el.container.className='video-container '+st.aspect; persist(); toast('Aspect: '+st.aspect,'fa-crop-simple'); }

/* ---------- Filters ---------- */
function applyFilters(){
  const f=st.filters;
  el.video.style.filter=`brightness(${f.brightness}) contrast(${f.contrast}) saturate(${f.saturate})`;
  const sx=st.flipH?-1:1, sy=st.flipV?-1:1;
  el.video.style.transform=`rotate(${st.rotate}deg) scale(${sx},${sy})`;
}
function setFilter(k,v){ st.filters[k]=+v; applyFilters(); persist(); const map={brightness:'#brightVal',contrast:'#contrastVal',saturate:'#satVal'}; const e2=$(map[k]); if(e2)e2.textContent=Math.round(v*100)+'%'; }
function rotate(d){ st.rotate=(st.rotate+d)%360; applyFilters(); persist(); toast('Rotated '+st.rotate+'°','fa-rotate'); }
function flip(a){ if(a==='h')st.flipH=!st.flipH; else st.flipV=!st.flipV; applyFilters(); persist(); }
function resetVideo(){ st.filters={brightness:1,contrast:1,saturate:1}; st.rotate=0; st.flipH=false; st.flipV=false; applyFilters();
  $('#setBright').value=1;$('#setContrast').value=1;$('#setSat').value=1; persist(); toast('Video reset','fa-rotate-left'); }

/* ---------- Audio controls ---------- */
function setBoost(v){ st.boost=+v; $('#boostVal').textContent=Math.round(st.boost*100)+'%'; if(audioEligible()){ initAudio(); applyBoost(); } persist(); }
function setEqBand(i,v){ st.eq[i]=+v; applyEq(); persist(); }
function setEqPreset(name){ st.eqPreset=name; st.eq=[...EQ_PRESETS[name]]; renderEq(); initAudio(); applyEq(); persist(); toast('EQ: '+name,'fa-sliders'); }
function renderEq(){
  const wrap=$('#eqBands'); if(!wrap) return;
  wrap.innerHTML='';
  EQ_FREQS.forEach((f,i)=>{
    const d=document.createElement('div'); d.className='eq-band';
    d.innerHTML=`<input type="range" min="-12" max="12" step="1" value="${st.eq[i]||0}" data-i="${i}"><span>${f>=1000?(f/1000)+'k':f}</span>`;
    d.querySelector('input').addEventListener('input',e=>setEqBand(i,+e.target.value));
    wrap.appendChild(d);
  });
  const pl=$('#eqPresets'); pl.innerHTML='';
  Object.keys(EQ_PRESETS).forEach(name=>{
    const b=document.createElement('button'); b.textContent=name; b.classList.toggle('active',name===st.eqPreset);
    b.addEventListener('click',()=>setEqPreset(name)); pl.appendChild(b);
  });
}

/* ---------- Subtitles ---------- */
function parseSubs(text){
  const cues=[], blocks=text.replace(/\ufeff/,'').replace(/\r/g,'').split(/\n\s*\n/);
  for(const b of blocks){
    const lines=b.trim().split('\n');
    const tl=lines.find(l=>/\d{1,2}:\d{2}:\d{2}[.,]\d{1,3}\s*-->\s*\d{1,2}:\d{2}:\d{2}[.,]\d{1,3}/.test(l));
    if(!tl) continue;
    const m=tl.match(/(\d{1,2}):(\d{2}):(\d{2})[.,](\d{1,3})\s*-->\s*(\d{1,2}):(\d{2}):(\d{2})[.,](\d{1,3})/);
    if(!m) continue;
    const t=(h,mi,s,ms)=>+h*3600+ +mi*60+ +s + +ms.padEnd(3,'0')/1000;
    const txt=lines.filter(l=>l!==tl&&!/^\d+$/.test(l.trim())).map(l=>l.trim()).filter(Boolean).join(' ');
    cues.push({start:t(m[1],m[2],m[3],m[4]), end:t(m[5],m[6],m[7],m[8]), text:txt});
  }
  return cues;
}
function applySubStyle(){
  let css='::cue{';
  css+=`font-size:${st.subStyle.fontSize};color:${st.subStyle.color};background:${st.subStyle.bg};`;
  css+='font-family:"Segoe UI",Arial,sans-serif;line-height:1.35;}';
  let s=$('#cueStyle'); if(!s){ s=document.createElement('style'); s.id='cueStyle'; document.head.appendChild(s); }
  s.textContent=css;
}
function loadSubFile(){ el.subInput.value=''; el.subInput.click(); }
el.subInput.addEventListener('change',e=>{
  const f=e.target.files[0]; if(!f) return;
  const url=URL.createObjectURL(f);
  if(st.subTrack){ try{el.video.removeTextTrack(st.subTrack);}catch(_){} st.subTrack=null; }
  const track=el.video.addTextTrack('subtitles','Subtitle','und'); track.mode='showing';
  fetch(url).then(r=>r.text()).then(text=>{
    const cues=parseSubs(text);
    const off=st.subOffset;
    cues.forEach(c=>{ try{ track.addCue(new VTTCue(c.start+off,c.end+off,c.text)); }catch(_){} });
    st.subTrack=track; applySubStyle(); toast(`Loaded ${cues.length} subtitle cues`,'fa-closed-captioning');
  }).catch(()=>toast('Failed to load subtitle','fa-triangle-exclamation')).finally(()=>URL.revokeObjectURL(url));
});
function toggleSub(){ if(!st.subTrack){ toast('No subtitle loaded','fa-closed-captioning'); return; } st.subTrack.mode=st.subTrack.mode==='showing'?'hidden':'showing'; toast('Subtitles '+(st.subTrack.mode==='showing'?'on':'off'),'fa-closed-captioning'); }
function setSubOffset(v){ st.subOffset=+v; $('#subOffVal').textContent=(+v).toFixed(1)+'s'; persist(); }

/* ---------- Chapters ---------- */
function loadChapterFile(){ el.chapterInput.value=''; el.chapterInput.click(); }
el.chapterInput.addEventListener('change',e=>{
  const f=e.target.files[0]; if(!f) return;
  const url=URL.createObjectURL(f);
  fetch(url).then(r=>r.text()).then(text=>{
    st.chapters=parseSubs(text).map(c=>({t:c.start,title:c.text}));
    renderChapters(); toast(`Loaded ${st.chapters.length} chapters`,'fa-bookmark');
  }).catch(()=>toast('Failed to load chapters','fa-triangle-exclamation')).finally(()=>URL.revokeObjectURL(url));
});
function renderChapters(){
  el.tlChapters.innerHTML='';
  const d=el.video.duration||0; if(!d) return;
  st.chapters.forEach(c=>{ const m=document.createElement('div'); m.className='tl-chapter'; m.style.left=(c.t/d*100)+'%'; m.title=c.title||fmt(c.t); el.tlChapters.appendChild(m); });
}

/* ---------- Scrub thumbnail generation ---------- */
function seekTo(v,t){ return new Promise(res=>{ const h=()=>{v.removeEventListener('seeked',h);res();}; v.addEventListener('seeked',h); v.currentTime=t; }); }
async function genScrubThumbs(it){
  if(st.thumbDone[it.title]) return;
  st.thumbDone[it.title]=true;
  st.scrubThumbs=[];
  try{
    const v=document.createElement('video'); v.muted=true; v.preload='auto'; v.src=it.src;
    const c=document.createElement('canvas'); const ctx=c.getContext('2d');
    await new Promise((res,rej)=>{ v.addEventListener('loadeddata',res,{once:true}); v.addEventListener('error',()=>rej(new Error('load')),{once:true}); setTimeout(rej,8000); });
    const dur=v.duration; if(!isFinite(dur)||dur<=0){ return; }
    c.width=160; c.height=Math.max(1,Math.round(160*(v.videoHeight/v.videoWidth)||90));
    const N=Math.min(30,Math.max(8,Math.round(dur/12)));
    for(let i=0;i<N;i++){
      await seekTo(v,(dur*(i+0.5))/N);
      let url;
      try{ ctx.drawImage(v,0,0,c.width,c.height); url=c.toDataURL('image/jpeg',0.6); }catch(_){ break; }
      st.scrubThumbs.push({t:(dur*(i+0.5))/N, url});
      if(i===Math.floor(N*0.15)) setItemThumb(it,url);
    }
    v.src='';
  }catch(e){ /* thumbnails are best-effort */ }
}
function setItemThumb(it,url){ it.thumb=url; persist(); renderPlaylist(); }

/* ---------- Resume ---------- */
function saveResume(it,t){
  if(!it||!st.resumeOn) return;
  if(t<3||(it.duration&&t>it.duration-3)){ delete st.resume[it.title]; }
  else st.resume[it.title]=Math.floor(t);
  persist();
}

/* ---------- UI update ---------- */
function updatePlayBtn(){ const playing=!el.video.paused&&!el.video.ended; el.btnPlay.innerHTML=`<i class="fa-solid ${playing?'fa-pause':'fa-play'}"></i>`; }
function updateUI(){
  updatePlayBtn();
  const d=el.video.duration;
  if(!st.dragging&&d){
    const pct=el.video.currentTime/d*100;
    el.tlPlayed.style.width=pct+'%';
    el.tlHandle.style.left=pct+'%';
  }
  el.timeCur.textContent=fmt(el.video.currentTime);
  el.timeDur.textContent=isFinite(d)?fmt(d):'0:00';
  // buffered
  try{
    if(el.video.buffered.length&&d){
      const end=el.video.buffered.end(el.video.buffered.length-1);
      el.tlBuffer.style.width=Math.min(100,end/d*100)+'%';
    }
  }catch(_){}
  // auto-hide poster once playing
  if(!el.video.paused && (el.video.currentTime>0 || el.video.readyState>=3)) hidePoster();
  if(st.statsOn) renderStats();
}
function renderStats(){
  const v=el.video; let drop=0;
  try{ const q=v.getVideoPlaybackQuality?.(); if(q) drop=q.droppedVideoFrames; }catch(_){}
  el.stats.textContent=
`Resolution : ${v.videoWidth}×${v.videoHeight}
Duration   : ${fmt(v.duration)}
Position   : ${fmt(v.currentTime)}
Speed      : ${v.playbackRate}×
Volume     : ${Math.round((st.muted?0:v.volume)*100)}%  Boost ${Math.round(st.boost*100)}%
ReadyState : ${v.readyState} / ${v.networkState}
Dropped    : ${drop} frames
Src        : ${(v.currentSrc||'').slice(0,60)}`;
}

/* ---------- Timeline interaction ---------- */
function seekFromEvent(e){
  const r=el.timeline.getBoundingClientRect();
  const pct=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
  if(el.video.duration) el.video.currentTime=pct*el.video.duration;
  el.tlPlayed.style.width=(pct*100)+'%'; el.tlHandle.style.left=(pct*100)+'%';
  el.timeCur.textContent=fmt(pct*(el.video.duration||0));
}
el.timeline.addEventListener('mousedown',e=>{ st.dragging=true; seekFromEvent(e); });
window.addEventListener('mousemove',e=>{ if(st.dragging) seekFromEvent(e); });
window.addEventListener('mouseup',()=>{ if(st.dragging){ st.dragging=false; const it=st.playlist[st.current]; if(it) saveResume(it,el.video.currentTime); } });
el.timeline.addEventListener('mousemove',e=>{
  const r=el.timeline.getBoundingClientRect();
  const pct=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
  const t=pct*(el.video.duration||0);
  el.scrubTime.textContent=fmt(t)+' / '+fmt(el.video.duration||0);
  if(st.scrubThumbs.length){
    let best=st.scrubThumbs[0];
    for(const s of st.scrubThumbs) if(Math.abs(s.t-t)<Math.abs(best.t-t)) best=s;
    el.scrubImg.src=best.url; el.scrubImg.style.display='block';
  }else el.scrubImg.style.display='none';
  el.scrubTip.style.left=Math.max(0,Math.min(el.container.clientWidth-160, e.clientX-el.container.getBoundingClientRect().left-80))+'px';
  el.scrubTip.classList.add('show');
});
el.timeline.addEventListener('mouseleave',()=>el.scrubTip.classList.remove('show'));

/* ---------- Context menu ---------- */
function showCtx(e,i){
  const it=st.playlist[i];
  el.ctx.innerHTML=`
    <button data-act="play"><i class="fa-solid fa-play"></i> Play</button>
    <button data-act="queue"><i class="fa-solid fa-arrow-turn-down"></i> Play next</button>
    <div class="divider"></div>
    <button data-act="bookmark"><i class="fa-solid fa-bookmark"></i> Bookmark current time</button>
    <button data-act="copy"><i class="fa-regular fa-copy"></i> Copy title</button>
    <div class="divider"></div>
    <button data-act="remove"><i class="fa-solid fa-xmark"></i> Remove</button>`;
  el.ctx.style.left=Math.min(e.clientX,innerWidth-200)+'px';
  el.ctx.style.top=Math.min(e.clientY,innerHeight-240)+'px';
  el.ctx.classList.add('show');
  el.ctx.onclick=ev=>{
    const b=ev.target.closest('button'); if(!b) return; const act=b.dataset.act; el.ctx.classList.remove('show');
    if(act==='play') app.playIndex(i);
    else if(act==='queue'){ const [m]=st.playlist.splice(i,1); st.playlist.splice(st.current+1,0,m); persist(); renderPlaylist(); toast('Queued next','fa-arrow-turn-down'); }
    else if(act==='bookmark'){ if(st.current!==i) app.playIndex(i); toggleBookmark(it); }
    else if(act==='copy'){ navigator.clipboard?.writeText(it.title).then(()=>toast('Copied','fa-copy')); }
    else if(act==='remove') removeItem(i);
  };
}
window.addEventListener('click',()=>el.ctx.classList.remove('show'));

/* ---------- Library ---------- */
function addRecent(it){ st.recent=st.recent.filter(r=>r.title!==it.title); st.recent.unshift({title:it.title,src:it.src,thumb:it.thumb,duration:it.duration,at:Date.now()}); if(st.recent.length>40)st.recent.pop(); }
function addHistory(it){ st.history.unshift({title:it.title,src:it.src,at:Date.now(),pos:el.video.currentTime}); if(st.history.length>80)st.history.pop(); }
function toggleBookmark(it){ if(!it) return; const idx=st.bookmarks.findIndex(b=>b.title===it.title); if(idx<0){ st.bookmarks.push({title:it.title,src:it.src,time:el.video.currentTime}); toast('Bookmarked at '+fmt(el.video.currentTime),'fa-bookmark'); } else { st.bookmarks.splice(idx,1); toast('Bookmark removed','fa-bookmark'); } persist(); renderLibrary(); }
function renderLibrary(){
  const mk=(listId,emptyId,items,onClick)=>{
    const list=$(listId), empty=$(emptyId); list.innerHTML='';
    if(!items.length){ empty.style.display='block'; return; } empty.style.display='none';
    items.forEach(it=>{
      const d=document.createElement('div'); d.className='list-item';
      d.innerHTML=`<strong>${esc(it.title)}</strong><span>${it.time!=null?fmt(it.time)+' • ':''}${esc(base(it.src))}</span>`;
      d.addEventListener('click',()=>onClick(it)); list.appendChild(d);
    });
  };
  mk('#recentList','#recentEmpty',st.recent,it=>{ addItems([{src:it.src,title:it.title,thumb:it.thumb,duration:it.duration}]); const idx=st.playlist.findIndex(p=>p.src===it.src); app.playIndex(idx>=0?idx:0); });
  mk('#bmList','#bmEmpty',st.bookmarks,it=>{ addItems([{src:it.src,title:it.title}]); const idx=st.playlist.findIndex(p=>p.src===it.src); app.playIndex(idx>=0?idx:0); const wait=()=>{ if(el.video.readyState>=1){ el.video.currentTime=it.time||0; el.video.play(); } else setTimeout(wait,200); }; wait(); });
  mk('#histList','#histEmpty',st.history,it=>{ addItems([{src:it.src,title:it.title}]); const idx=st.playlist.findIndex(p=>p.src===it.src); app.playIndex(idx>=0?idx:0); });
}
function switchTab(t){ $$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===t)); $$('.tab-panel').forEach(p=>p.classList.toggle('active',p.id==='tab-'+t)); }

/* ---------- Import / Export ---------- */
function exportPlaylist(){
  const lines=['#EXTM3U'];
  st.playlist.forEach(it=>{ lines.push('#EXTINF:'+Math.round(it.duration||0)+','+it.title); lines.push(it.src); });
  const blob=new Blob([lines.join('\n')],{type:'audio/x-mpegurl'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='playlist.m3u'; a.click(); URL.revokeObjectURL(a.href);
  toast('Playlist exported','fa-file-export');
}
function importPlaylist(){
  const inp=document.createElement('input'); inp.type='file'; inp.accept='.m3u,.m3u8,.txt';
  inp.onchange=e=>{
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{
      const items=[];
      r.result.split(/\r?\n/).forEach(line=>{
        line=line.trim(); if(!line||line.startsWith('#')) return;
        items.push({src:line,title:base(line),kind:/^https?:/.test(line)?'remote':'local'});
      });
      if(items.length) addItems(items); else toast('No entries found','fa-triangle-exclamation');
    };
    r.readAsText(f);
  };
  inp.click();
}

/* ---------- Media Session ---------- */
function updateMediaSession(it){
  if(!('mediaSession' in navigator)) return;
  try{
    navigator.mediaSession.metadata=new MediaMetadata({title:it.title,artist:'NovaPlay',album:'Playlist'});
    navigator.mediaSession.setActionHandler('play',()=>app.playPause());
    navigator.mediaSession.setActionHandler('pause',()=>app.playPause());
    navigator.mediaSession.setActionHandler('previoustrack',()=>prev());
    navigator.mediaSession.setActionHandler('nexttrack',()=>next());
    navigator.mediaSession.setActionHandler('seekbackward',()=>{ el.video.currentTime-=st.seekStep; });
    navigator.mediaSession.setActionHandler('seekforward',()=>{ el.video.currentTime+=st.seekStep; });
  }catch(_){}
}

/* ---------- Show stats ---------- */
function showStats(){ st.statsOn=!st.statsOn; el.stats.classList.toggle('show',st.statsOn); if(st.statsOn) renderStats(); }

/* ---------- Public API ---------- */
const app={
  init(){
    loadStore();
    el.video.volume=st.muted?0:st.volume; el.video.playbackRate=st.speed; el.volume.value=st.volume;
    el.container.className='video-container '+st.aspect;
    el.plList.classList.toggle('grid',st.view==='grid');
    $('#btnViewToggle').innerHTML=`<i class="fa-solid ${st.view==='grid'?'fa-list':'fa-table-cells'}"></i>`;
    updateVol(); updateToggles(); applyTheme(); applyFilters(); applySubStyle();
    if(!$('#accentSwatches').children.length){
      ['#0078d7','#7c3aed','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899'].forEach(c=>{
        const s=document.createElement('div'); s.className='swatch'; s.dataset.color=c; s.style.background=c;
        s.addEventListener('click',()=>{ st.accent=c; applyTheme(); persist(); }); $('#accentSwatches').appendChild(s);
      });
    }
    $('#setSpeed').value=st.speed; $('#setSeek').value=st.seekStep; $('#setView').value=st.view;
    $('#setResume').checked=st.resumeOn; $('#setAutoplay').checked=st.autoplay;
    $('#setBoost').value=st.boost; $('#boostVal').textContent=Math.round(st.boost*100)+'%';
    $('#setBright').value=st.filters.brightness; $('#setContrast').value=st.filters.contrast; $('#setSat').value=st.filters.saturate;
    $('#setSubSize').value=parseInt(st.subStyle.fontSize); $('#setSubColor').value=st.subStyle.color;
    $('#subSizeVal').textContent=parseInt(st.subStyle.fontSize);
    renderEq(); renderLibrary(); renderPlaylist();
    wireEvents(); wireKeyboard(); applyTheme();
    setStatus('Ready');
  },
  playPause, stop, prev, next, playIndex, clearPlaylist, removeItem,
  toggleRepeat, toggleShuffle, setVolume, toggleMute, setSpeed, cycleSpeed,
  toggleFull, togglePip, toggleTheater, cycleAspect,
  snapshot, frameStep, cycleAb, setA, setB, clearAb,
  setFilter, rotate, flip, resetVideo,
  setBoost, setEqBand, setEqPreset,
  loadSubFile, toggleSub, setSubOffset, setSubStyle(k,v){ st.subStyle[k]=v; if(k==='fontSize')$('#subSizeVal').textContent=parseInt(v); applySubStyle(); persist(); },
  loadChapterFile, showStats, toggleDrawer(){ el.drawer.classList.toggle('show'); },
  togglePlaylist(){ el.playlistPanel.classList.toggle('hidden'); },
  toggleSidebar(){ el.sidebar.classList.toggle('hidden'); },
  toggleView(){ st.view=st.view==='list'?'grid':'list'; el.plList.classList.toggle('grid',st.view==='grid'); $('#setView').value=st.view; $('#btnViewToggle').innerHTML=`<i class="fa-solid ${st.view==='grid'?'fa-list':'fa-table-cells'}"></i>`; persist(); },
  setView(v){ st.view=v; el.plList.classList.toggle('grid',v==='grid'); persist(); },
  setSeekStep(v){ st.seekStep=+v; persist(); toast('Seek step '+v+'s','fa-forward'); },
  setResume(v){ st.resumeOn=v; persist(); },
  setAutoplay(v){ st.autoplay=v; persist(); },
  importPlaylist, exportPlaylist, toggleBookmark,
  addFiles(){ el.fileInput.value=''; el.fileInput.click(); },
  addFolder(){ el.folderInput.value=''; el.folderInput.click(); },
  openUrl(){ const u=prompt('Enter video URL:'); if(u){ addItems([{src:u.trim(),title:base(u.trim()),kind:'remote'}]); } },
  loadSample(){ addItems([{src:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',title:'Big Buck Bunny (sample)',kind:'remote'}]); toast('Sample added — click it to play','fa-flask'); },
};

/* ---------- Events ---------- */
function wireEvents(){
  el.btnPlay.addEventListener('click',playPause);
  el.video.addEventListener('click',playPause);
  el.video.addEventListener('dblclick',toggleFull);
  el.btnPrev.addEventListener('click',prev); el.btnNext.addEventListener('click',next); el.btnStop.addEventListener('click',stop);
  el.btnPrevBig.addEventListener('click',prev); el.btnNextBig.addEventListener('click',next);
  el.btnFrameBack.addEventListener('click',()=>frameStep(-1)); el.btnFrameFwd.addEventListener('click',()=>frameStep(1));
  el.btnRepeat.addEventListener('click',toggleRepeat); el.btnShuffle.addEventListener('click',toggleShuffle); el.btnAb.addEventListener('click',cycleAb);
  el.btnVol.addEventListener('click',toggleMute);
  el.volume.addEventListener('input',e=>setVolume(+e.target.value));
  el.btnSpeed.addEventListener('click',cycleSpeed);
  el.btnEq.addEventListener('click',()=>{ el.drawer.classList.add('show'); initAudio(); applyEq(); applyBoost(); setTimeout(()=>$('#eqBands').scrollIntoView({behavior:'smooth',block:'center'}),150); });
  el.btnSnapshot.addEventListener('click',snapshot);
  el.btnAspect.addEventListener('click',cycleAspect);
  el.btnPip.addEventListener('click',togglePip);
  el.btnTheater.addEventListener('click',toggleTheater);
  el.btnFull.addEventListener('click',toggleFull);

  el.fileInput.addEventListener('change',e=>{ const fs=Array.from(e.target.files); if(fs.length) addItems(fs.map(f=>({src:URL.createObjectURL(f),title:f.name}))); });
  el.folderInput.addEventListener('change',e=>{ const fs=Array.from(e.target.files).filter(f=>/\.(mp4|webm|mkv|avi|mov|m4v|ogv)$/i.test(f.name)); if(fs.length) addItems(fs.map(f=>({src:URL.createObjectURL(f),title:f.name}))); else toast('No video files in folder','fa-folder-open'); });
  el.plSearch.addEventListener('input',renderPlaylist);
  el.fileInput.addEventListener('click',e=>{ e.target.value=''; });

  el.video.addEventListener('play',updateUI);
  el.video.addEventListener('playing',()=>{ hidePoster(); updateUI(); });
  el.video.addEventListener('pause',()=>{ updateUI(); const it=st.playlist[st.current]; if(it) saveResume(it,el.video.currentTime); });
  el.video.addEventListener('timeupdate',()=>{
    updateUI(); throttleResume();
    // A-B loop enforcement
    if(st.ab.a!=null&&st.ab.b!=null&&el.video.currentTime>=st.ab.b){ el.video.currentTime=st.ab.a; }
  });
  el.video.addEventListener('ended',()=>{
    const it=st.playlist[st.current]; if(it) saveResume(it,el.video.duration);
    if(st.repeat==='one'){ el.video.currentTime=0; el.video.play(); return; }
    if(st.autoplay) next();
  });
  el.video.addEventListener('loadedmetadata',()=>{
    updateUI(); renderAb(); renderChapters();
    const it=st.playlist[st.current];
    if(it&&!it.duration){ it.duration=el.video.duration; persist(); renderPlaylist(); }
    if('mediaSession' in navigator) try{ navigator.mediaSession.setPositionState({duration:el.video.duration||0,playbackRate:el.video.playbackRate,position:el.video.currentTime||0}); }catch(_){}
  });
  el.video.addEventListener('volumechange',()=>{ if(!st.muted) st.volume=el.video.volume; updateVol(); });
  el.video.addEventListener('ratechange',()=>{ st.speed=el.video.playbackRate; updateToggles(); });
  el.video.addEventListener('progress',updateUI);
  el.video.addEventListener('error',()=>{
    const er=el.video.error; const codes={1:'Loading aborted',2:'Network error — file not found',3:'Decode error — file corrupted',4:'Format/codec not supported'};
    const m=er?(codes[er.code]||('Error '+er.code)):'Cannot play this video';
    console.error('Video error:',er,'src:',el.video.currentSrc||el.video.src);
    setStatus('⚠ '+m,8000); toast(m,'fa-triangle-exclamation');
  });
  el.container.addEventListener('mousemove',showControls);
  el.container.addEventListener('click',showControls);

  document.addEventListener('fullscreenchange',()=>{ el.btnFull.innerHTML=`<i class="fa-solid ${document.fullscreenElement?'fa-compress':'fa-expand'}"></i>`; });

  // drag & drop
  ['dragover','drop'].forEach(t=>document.addEventListener(t,e=>{ e.preventDefault(); }));
  document.addEventListener('drop',e=>{ const fs=Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith('video/')||/\.(mp4|webm|mkv|avi|mov|m4v)$/i.test(f.name)); if(fs.length) addItems(fs.map(f=>({src:URL.createObjectURL(f),title:f.name}))); });

  // tabs
  $$('.tab').forEach(t=>t.addEventListener('click',()=>switchTab(t.dataset.tab)));
  $$('#themeBtns button').forEach(b=>b.addEventListener('click',()=>{ st.theme=b.dataset.theme; applyTheme(); persist(); }));
}
function throttleResume(){
  const now=Date.now(); if(now-(throttleResume._t||0)<4000) return; throttleResume._t=now;
  const it=st.playlist[st.current]; if(it) saveResume(it,el.video.currentTime);
}
function showControls(){ el.overlay.classList.add('show'); clearTimeout(st.idleTimer); st.idleTimer=setTimeout(()=>{ if(!el.video.paused) el.overlay.classList.remove('show'); },3200); }

/* ---------- Keyboard ---------- */
function wireKeyboard(){
  document.addEventListener('keydown',e=>{
    if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||e.target.tagName==='TEXTAREA') return;
    const k=e.key.toLowerCase(); const ctrl=e.ctrlKey||e.metaKey;
    if(k===' '){ e.preventDefault(); playPause(); }
    else if(k==='k'){ e.preventDefault(); playPause(); }
    else if(k==='arrowright'){ e.preventDefault(); el.video.currentTime+=ctrl?60:st.seekStep; }
    else if(k==='arrowleft'){ e.preventDefault(); el.video.currentTime-=ctrl?60:st.seekStep; }
    else if(k==='arrowup'){ e.preventDefault(); setVolume(st.volume+0.05); }
    else if(k==='arrowdown'){ e.preventDefault(); setVolume(st.volume-0.05); }
    else if(k==='j'){ el.video.currentTime-=10; }
    else if(k==='l'){ el.video.currentTime+=10; }
    else if(k===','){ frameStep(-1); } else if(k==='.'){ frameStep(1); }
    else if(k==='m'){ toggleMute(); }
    else if(k==='f'){ toggleFull(); }
    else if(k==='t'){ toggleTheater(); }
    else if(k==='p'){ prev(); } else if(k==='n'){ next(); }
    else if(k==='pagedown'){ e.preventDefault(); next(); } else if(k==='pageup'){ e.preventDefault(); prev(); }
    else if(k==='s'){ stop(); }
    else if(k==='c'){ toggleSub(); }
    else if(k==='b'){ toggleBookmark(st.playlist[st.current]); }
    else if(k==='o'){ e.preventDefault(); addFiles(); }
    else if(k==='g'){ el.drawer.classList.toggle('show'); }
    else if(k==='i'){ showStats(); }
    else if(k==='['){ setA(); } else if(k===']'){ setB(); } else if(k==='\\'){ clearAb(); }
    else if(k==='+'||k==='='){ setSpeed(Math.min(4,+(st.speed+0.25).toFixed(2))); }
    else if(k==='-'){ setSpeed(Math.max(0.25,+(st.speed-0.25).toFixed(2))); }
    else if(k==='escape'){ if(document.fullscreenElement)document.exitFullscreen(); el.drawer.classList.remove('show'); el.ctx.classList.remove('show'); }
    else if(ctrl&&k==='a'){ e.preventDefault(); addFiles(); }
    else if(/^[0-9]$/.test(k)){ e.preventDefault(); if(el.video.duration) el.video.currentTime=(+k/10)*el.video.duration; }
  });
}

window.app=app;
document.addEventListener('DOMContentLoaded',()=>app.init());
})();
