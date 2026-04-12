// ===== CONSTANTS =====
const FLAVORS = [
  { name:'Menthe',   emoji:'🌿', color:'#26c6da', bg:'rgba(38,198,218,0.2)' },
  { name:'Poire',    emoji:'🍐', color:'#8bc34a', bg:'rgba(139,195,74,0.2)' },
  { name:'Pêche',    emoji:'🍑', color:'#ffb300', bg:'rgba(255,179,0,0.2)' },
  { name:'Fraise',   emoji:'🍓', color:'#ec407a', bg:'rgba(236,64,122,0.2)' },
  { name:'Ananas',   emoji:'🍍', color:'#f59300', bg:'rgba(245,147,0,0.2)' },
  { name:'Pomme',    emoji:'🍏', color:'#43a047', bg:'rgba(67,160,71,0.2)' },
];
const BONUS_ITEMS = ['🧊','✨','🫧','💧'];
let bestScores = JSON.parse(localStorage.getItem('delio_best')||'{}');

// ===== BACKGROUND CANVAS =====
(function() {
  const c = document.getElementById('bg-canvas');
  const ctx = c.getContext('2d');
  let W, H, bubbles = [];

  function resize() {
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for(let i = 0; i < 28; i++) {
    bubbles.push({
      x: Math.random()*1000,
      y: Math.random()*800,
      r: 4 + Math.random()*18,
      vx: (Math.random()-.5)*.3,
      vy: -.1 - Math.random()*.4,
      alpha: 0.04 + Math.random()*0.1,
      color: FLAVORS[Math.floor(Math.random()*6)].color
    });
  }

  function draw(ts) {
    ctx.clearRect(0,0,W,H);
    // Deep ocean gradient bg
    const gr = ctx.createLinearGradient(0,0,W,H);
    gr.addColorStop(0,'#0a1438');
    gr.addColorStop(0.4,'#0d1b4b');
    gr.addColorStop(0.7,'#122366');
    gr.addColorStop(1,'#091030');
    ctx.fillStyle = gr;
    ctx.fillRect(0,0,W,H);

    // Subtle radial glow center
    const cg = ctx.createRadialGradient(W*.5,H*.3,0,W*.5,H*.3,W*.7);
    cg.addColorStop(0,'rgba(39,86,208,0.12)');
    cg.addColorStop(1,'transparent');
    ctx.fillStyle = cg;
    ctx.fillRect(0,0,W,H);

    // Floating bubbles
    bubbles.forEach(b => {
      b.x += b.vx + Math.sin(ts*.0005 + b.r)*.15;
      b.y += b.vy;
      if(b.y < -30) { b.y = H + 20; b.x = Math.random()*W; }
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = b.alpha;
      ctx.stroke();
      ctx.globalAlpha = b.alpha * .3;
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.restore();
    });

    // Sparkle stars
    ctx.save();
    ctx.globalAlpha = 0.3 + Math.sin(ts*.001)*.1;
    for(let i=0;i<6;i++){
      const sx = (W*.1+i*W*.15 + Math.sin(ts*.0003+i)*(W*.04));
      const sy = (H*.1 + i*H*.08 + Math.cos(ts*.0004+i)*(H*.03));
      ctx.fillStyle = '#f5c200';
      ctx.font = '12px serif';
      ctx.fillText('✦', sx, sy);
    }
    ctx.restore();

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

// ===== NAVIGATION =====
let activeTimers = [];
function clearActiveTimers() {
  activeTimers.forEach(id => { clearInterval(id); clearTimeout(id); });
  activeTimers = [];
  if(window._g1raf) { cancelAnimationFrame(window._g1raf); window._g1raf = null; }
}

function goHome() {
  clearActiveTimers();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('home').classList.add('active');
}

function startGame(n) {
  clearActiveTimers();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('game'+n).classList.add('active');
  if(n===1) initGame1();
  if(n===2) initGame2();
  if(n===3) initGame3();
  if(n===4) initGame4();
}

// ===== UTILS =====
function spawnParticle(x, y, emoji) {
  const p = document.createElement('div');
  p.className = 'particle';
  p.textContent = emoji;
  p.style.left = x+'px';
  p.style.top = y+'px';
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 900);
}

function showCombo(text, color='#f5c200') {
  const c = document.createElement('div');
  c.className = 'combo-flash';
  c.style.color = color;
  c.textContent = text;
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 800);
}

function bumpScore(id, val) {
  const el = document.getElementById(id);
  if(el) { el.textContent = val+' pts'; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
}

function makeStars(score, max) {
  const pct = score/max;
  const stars = pct > 0.7 ? 3 : pct > 0.4 ? 2 : pct > 0.1 ? 1 : 0;
  const s = ['⭐','⭐','⭐'].map((st,i)=>`<span class="star ${i<stars?'lit':''}">${st}</span>`).join('');
  return s;
}

// ===== GAME 1: SPARKLE CATCH =====
function initGame1() {
  let score=0, lives=3, flavorIdx=0, items=[], lastItem=0, speed=2.8, active=true;
  const canvas = document.getElementById('g1canvas');
  const parent = canvas.parentElement;
  const W = Math.min(parent.clientWidth, 480);
  const H = parent.clientHeight || 400;
  canvas.width = W; canvas.height = H;
  canvas.style.height = H+'px';
  const ctx = canvas.getContext('2d');
  let bottleX = W/2;

  document.getElementById('g1over').classList.remove('show');

  function setFlavor() {
    flavorIdx = Math.floor(Math.random()*6);
    const f = FLAVORS[flavorIdx];
    document.getElementById('g1dot').style.background = f.color;
    document.getElementById('g1dot').style.boxShadow = '0 0 8px '+f.color;
    document.getElementById('g1flavorname').textContent = f.emoji+' '+f.name;
  }
  setFlavor();

  function updateHUD() {
    bumpScore('g1score', score);
    document.getElementById('g1lives').textContent = '❤️'.repeat(lives) || '💀';
  }

  function spawnItem() {
    const isBonus = Math.random() < 0.18;
    let emoji, isTarget=false, fi=-1;
    if(isBonus) {
      emoji = BONUS_ITEMS[Math.floor(Math.random()*BONUS_ITEMS.length)];
    } else {
      isTarget = Math.random() < 0.42;
      fi = isTarget ? flavorIdx : Math.floor(Math.random()*6);
      while(!isTarget && fi===flavorIdx) fi=Math.floor(Math.random()*6);
      emoji = FLAVORS[fi].emoji;
    }
    items.push({
      x: 20 + Math.random()*(W-40),
      y: -30,
      vy: speed + Math.random()*1.8,
      emoji, isTarget, isBonus,
      size: 26 + Math.random()*10,
      wobble: Math.random()*Math.PI*2,
      fi
    });
  }

  function drawBottle(x, y, fi) {
    const f = FLAVORS[fi];
    ctx.save();
    // Glow
    ctx.shadowColor = f.color;
    ctx.shadowBlur = 14;
    // Body
    ctx.fillStyle = f.color;
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(x-13, y-32, 26, 42, 7);
    else { ctx.rect(x-13, y-32, 26, 42); }
    ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x-6, y-28, 5, 18);
    // Cap
    ctx.fillStyle = f.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(x-7, y-42, 14, 12, 4);
    else ctx.rect(x-7, y-42, 14, 12);
    ctx.fill();
    // Emoji
    ctx.shadowBlur = 0;
    ctx.font = '13px serif';
    ctx.textAlign = 'center';
    ctx.fillText(f.emoji, x, y-14);
    ctx.restore();
  }

  function loop(ts) {
    if(!active) return;
    ctx.clearRect(0,0,W,H);

    // Solid dark bg so emojis are fully opaque
    ctx.fillStyle = '#0d1b4b';
    ctx.fillRect(0,0,W,H);

    // Subtle lane guides
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for(let i=0;i<W;i+=60) {
      ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke();
    }

    if(ts-lastItem > 750-Math.min(score*0.5,350)) { spawnItem(); lastItem=ts; }

    for(let i=items.length-1;i>=0;i--) {
      const it = items[i];
      it.y += it.vy;
      it.wobble += 0.05;
      const wx = it.x + Math.sin(it.wobble)*2;
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.font = it.size+'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000'; // fallback
      ctx.fillText(it.emoji, wx, it.y);
      ctx.restore();

      const bY = H-50;
      if(it.y > bY-15 && it.y < bY+20 && Math.abs(wx-bottleX)<28) {
        items.splice(i,1);
        if(it.isBonus) {
          score += 5;
          showCombo('+5 ✨', '#26c6da');
        } else if(it.isTarget) {
          score += 10;
          showCombo('+10 !', FLAVORS[flavorIdx].color);
          spawnParticle(bottleX, bY-20, FLAVORS[flavorIdx].emoji);
          if(Math.random()<0.18) setFlavor();
        } else {
          lives--;
          showCombo('Raté ! -❤️', '#e53935');
          if(lives<=0) {
            active=false;
            document.getElementById('g1final').textContent=score;
            document.getElementById('g1stars').innerHTML=makeStars(score,500);
            document.getElementById('g1over').classList.add('show');
            bestScores.g1 = Math.max(bestScores.g1||0, score);
            localStorage.setItem('delio_best', JSON.stringify(bestScores));
            return;
          }
        }
        updateHUD();
      } else if(it.y > H+20) {
        items.splice(i,1);
      }
    }

    drawBottle(bottleX, H-50, flavorIdx);

    // Catch zone indicator
    ctx.save();
    ctx.strokeStyle = FLAVORS[flavorIdx].color;
    ctx.globalAlpha = 0.2 + Math.sin(ts*.003)*.1;
    ctx.lineWidth = 1;
    ctx.setLineDash([4,6]);
    ctx.beginPath();
    ctx.arc(bottleX, H-50, 32, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();

    window._g1raf = requestAnimationFrame(loop);
  }

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    bottleX = (e.clientX - r.left) * (W / r.width);
  });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    bottleX = (e.touches[0].clientX - r.left) * (W / r.width);
  }, {passive:false});

  window._g1raf = requestAnimationFrame(loop);
}

// ===== GAME 2: MATCH-3 =====
function initGame2() {
  const COLS=7, ROWS=8;
  let score=0, moves=30, combos=0, selected=null, animating=false, board=[];

  document.getElementById('g2over').classList.remove('show');

  function makeBoard() {
    board=[];
    for(let r=0;r<ROWS;r++){board.push([]);for(let c=0;c<COLS;c++)board[r].push(Math.floor(Math.random()*6));}
    while(findMatches().length) {
      for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) board[r][c]=Math.floor(Math.random()*6);
    }
  }
  makeBoard();

  function updateHUD() {
    bumpScore('g2score', score);
    document.getElementById('g2pts').textContent = score;
    document.getElementById('g2moves').textContent = moves;
    document.getElementById('g2combos').textContent = combos;
  }

  function render() {
    const el = document.getElementById('g2board');
    el.innerHTML='';
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) {
      const d=document.createElement('div');
      d.className='g2cell';
      if(board[r][c]===-1){d.classList.add('matched');}
      else {
        d.textContent=FLAVORS[board[r][c]].emoji;
        d.style.background = FLAVORS[board[r][c]].bg;
      }
      if(selected && selected.r===r && selected.c===c) d.classList.add('selected');
      d.onclick=()=>cellClick(r,c);
      el.appendChild(d);
    }
    updateHUD();
  }

  function cellClick(r,c) {
    if(animating||board[r][c]===-1) return;
    if(!selected){selected={r,c};render();return;}
    const {r:sr,c:sc}=selected; selected=null;
    if(Math.abs(r-sr)+Math.abs(c-sc)===1) {
      [board[sr][sc],board[r][c]]=[board[r][c],board[sr][sc]];
      moves--;
      const matches=findMatches();
      if(matches.length){
        animating=true;
        processMatches(matches);
      } else {
        [board[sr][sc],board[r][c]]=[board[r][c],board[sr][sc]];
        moves++;
      }
      render();
      if(!animating && moves<=0) endGame2();
    } else render();
  }

  function findMatches(){
    const m=new Set();
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS-2;c++) if(board[r][c]!==-1&&board[r][c]===board[r][c+1]&&board[r][c]===board[r][c+2]) for(let k=0;k<3;k++) m.add(r*COLS+c+k);
    for(let c=0;c<COLS;c++) for(let r=0;r<ROWS-2;r++) if(board[r][c]!==-1&&board[r][c]===board[r+1][c]&&board[r][c]===board[r+2][c]) for(let k=0;k<3;k++) m.add((r+k)*COLS+c);
    return [...m];
  }

  function processMatches(matches) {
    const pts = matches.length * 10;
    score += pts; combos++;
    const fi = board[Math.floor(matches[0]/COLS)][matches[0]%COLS];
    if(fi>=0) showCombo('+'+pts+'!', FLAVORS[fi].color);
    matches.forEach(i=>{board[Math.floor(i/COLS)][i%COLS]=-1;});
    render();
    const t1=setTimeout(()=>{
      gravity();
      render();
      const m2=findMatches();
      if(m2.length) {
        const t2=setTimeout(()=>processMatches(m2),350);
        activeTimers.push(t2);
      } else {
        animating=false;
        if(moves<=0) endGame2();
      }
    },350);
    activeTimers.push(t1);
  }

  function gravity(){
    for(let c=0;c<COLS;c++){
      let col=board.map(r=>r[c]).filter(v=>v!==-1);
      while(col.length<ROWS) col.unshift(Math.floor(Math.random()*6));
      for(let r=0;r<ROWS;r++) board[r][c]=col[r];
    }
  }

  function endGame2(){
    document.getElementById('g2final').textContent=score;
    document.getElementById('g2stars').innerHTML=makeStars(score,1000);
    document.getElementById('g2over').classList.add('show');
    bestScores.g2=Math.max(bestScores.g2||0,score);
    localStorage.setItem('delio_best',JSON.stringify(bestScores));
  }

  render();
}

// ===== GAME 3: WHACK =====
function initGame3() {
  let score=0, timeLeft=45, targetIdx=0, streak=0;
  let activeHoles={}, holeTimers={};
  document.getElementById('g3over').classList.remove('show');

  function setTarget(){
    targetIdx=Math.floor(Math.random()*6);
    document.getElementById('g3emoji').textContent=FLAVORS[targetIdx].emoji;
    document.getElementById('g3name').textContent=FLAVORS[targetIdx].name;
    document.getElementById('g3name').style.color=FLAVORS[targetIdx].color;
  }
  setTarget();

  const grid=document.getElementById('g3grid');
  grid.innerHTML='';
  for(let i=0;i<9;i++){
    const d=document.createElement('div');
    d.className='g3hole';
    d.dataset.i=i;
    d.innerHTML='<span class="emoji-inner"></span>';
    d.onclick=()=>holeClick(i,d);
    grid.appendChild(d);
  }

  function showItem(){
    const avail=[];
    for(let i=0;i<9;i++) if(!activeHoles[i]) avail.push(i);
    if(!avail.length) return;
    const hole=avail[Math.floor(Math.random()*avail.length)];
    const fi=Math.floor(Math.random()*6);
    activeHoles[hole]=fi;
    const d=grid.children[hole];
    d.querySelector('.emoji-inner').textContent=FLAVORS[fi].emoji;
    d.classList.add('active');
    d.style.borderColor=FLAVORS[fi].color+'80';
    const tid=setTimeout(()=>{
      if(activeHoles[hole]!==undefined){
        d.classList.remove('active','hit-right','hit-wrong');
        d.querySelector('.emoji-inner').textContent='';
        d.style.borderColor='';
        delete activeHoles[hole];
      }
    }, 1100 + Math.random()*400);
    holeTimers[hole]=tid;
    activeTimers.push(tid);
  }

  function holeClick(i,d){
    if(activeHoles[i]===undefined) return;
    const fi=activeHoles[i];
    clearTimeout(holeTimers[i]);
    d.classList.remove('active');
    d.querySelector('.emoji-inner').textContent='';
    d.style.borderColor='';
    delete activeHoles[i];
    if(fi===targetIdx){
      score+=10+streak*2;
      streak++;
      d.classList.add('hit-right');
      showCombo(streak>2?'SÉRIE x'+streak+' !':'+'+(10+streak*2), FLAVORS[fi].color);
      if(Math.random()<0.25) setTarget();
    } else {
      streak=0;
      score=Math.max(0,score-5);
      d.classList.add('hit-wrong');
      showCombo('Raté ! -5', '#e53935');
    }
    document.getElementById('g3pts').textContent=score;
    document.getElementById('g3streak').textContent=streak;
    bumpScore('g3score', score);
    const t=setTimeout(()=>d.classList.remove('hit-right','hit-wrong'),400);
    activeTimers.push(t);
  }

  const spawnI=setInterval(showItem,550);
  activeTimers.push(spawnI);

  const tickI=setInterval(()=>{
    timeLeft--;
    document.getElementById('g3time').textContent=timeLeft;
    document.getElementById('g3bar').style.width=(timeLeft/45*100)+'%';
    if(timeLeft<=10) document.getElementById('g3bar').style.background='linear-gradient(90deg,#e53935,#ff5722)';
    if(timeLeft<=0){
      clearInterval(spawnI);
      clearInterval(tickI);
      document.getElementById('g3final').textContent=score;
      document.getElementById('g3stars').innerHTML=makeStars(score,600);
      document.getElementById('g3over').classList.add('show');
      bestScores.g3=Math.max(bestScores.g3||0,score);
      localStorage.setItem('delio_best',JSON.stringify(bestScores));
    }
  },1000);
  activeTimers.push(tickI);
}

// ===== GAME 4: MEMORY =====
function initGame4() {
  let flipped=[], matched=0, moves=0, locked=false;
  const pairs=[...FLAVORS,...FLAVORS].sort(()=>Math.random()-.5);
  document.getElementById('g4win').classList.remove('show');
  const best = bestScores.g4 || null;
  document.getElementById('g4best').textContent = best ? best+' cp' : '—';

  const board=document.getElementById('g4board');
  board.innerHTML='';
  pairs.forEach((f,i)=>{
    const card=document.createElement('div');
    card.className='g4card';
    const fi=FLAVORS.indexOf(f);
    card.dataset.fi=fi;
    card.innerHTML=`<div class="g4inner"><div class="g4face g4front">?</div><div class="g4face g4back" style="background:${f.color}22;border-color:${f.color}88">${f.emoji}<div class="card-name">${f.name}</div></div></div>`;
    card.style.background=f.bg;
    card.onclick=()=>cardClick(card);
    // stagger entrance
    card.style.animation=`popIn 0.4s ${i*.04}s both`;
    board.appendChild(card);
  });

  function updateHUD(){
    bumpScore('g4score', Math.max(0,(matched*50)-(moves*5)));
    document.getElementById('g4matched').textContent=matched+' / 6';
    document.getElementById('g4moves').textContent=moves;
  }

  function cardClick(card){
    if(locked||card.classList.contains('flipped')||card.classList.contains('matched')) return;
    card.classList.add('flipped');
    flipped.push(card);
    if(flipped.length===2){
      locked=true;
      moves++;
      const [a,b]=flipped;
      if(a.dataset.fi===b.dataset.fi){
        a.classList.add('matched');b.classList.add('matched');
        matched++;
        showCombo('Paire ! +50', FLAVORS[parseInt(a.dataset.fi)].color);
        spawnParticle(window.innerWidth*.5, window.innerHeight*.5, FLAVORS[parseInt(a.dataset.fi)].emoji);
        flipped=[];locked=false;
        updateHUD();
        if(matched===6){
          const t=setTimeout(()=>{
            document.getElementById('g4final').textContent=moves;
            document.getElementById('g4stars').innerHTML=makeStars(moves<=10?3:moves<=16?2:1,3);
            document.getElementById('g4win').classList.add('show');
            bestScores.g4=Math.min(bestScores.g4||9999,moves);
            document.getElementById('g4best').textContent=bestScores.g4+' cp';
            localStorage.setItem('delio_best',JSON.stringify(bestScores));
          },600);
          activeTimers.push(t);
        }
      } else {
        const t=setTimeout(()=>{
          a.classList.remove('flipped');b.classList.remove('flipped');
          flipped=[];locked=false;updateHUD();
        },1100);
        activeTimers.push(t);
        updateHUD();
      }
    }
  }
  updateHUD();
}