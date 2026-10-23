import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, Heart, Sparkles, PartyPopper, Star, Music2 } from 'lucide-react';
import { playBirthday, playPop, playBlower, playAirhorn, playBoing, playBonk, playSqueak, playTada, playDrumroll, playWhoosh, playChop, playSadTrombone, playFunny, startBelly, setMuted, unlockAudio, audioReady } from './sounds.js';
import './styles.css';

// ✨ PERSONALIZE THIS FILE: replace the name, captions, letter, and surprise notes.
const CONFIG = {
  friendName: 'IRISH MAAYYYYYY',
  shortName: 'Aiiiiiiiiiiii',
  birthdayLine: 'Today is all about celebrating YOU.',
  letter: `Some people make ordinary days feel a little brighter just by being themselves. You’re one of those people.\\n\\nThank you for the laughs, the random conversations, the memories, and all the little moments that somehow become the best stories. I hope this next chapter brings you new places to explore, reasons to laugh until your stomach hurts, and people who show up for you the way you show up for them.\\n\\nKeep being wonderfully, unapologetically you. You deserve a year full of good surprises and more Beers.🍻 💛`,
  photos: [
    { src: `${import.meta.env.BASE_URL}assets/memory-1.jpg`, shape: 'circle', caption: 'A moment worth keeping', tag: 'THE GOOD DAYS' },
    { src: `${import.meta.env.BASE_URL}assets/memory-2.jpg`, shape: 'polaroid', caption: 'Proof we have no chill', tag: 'CORE MEMORY' },
    { src: `${import.meta.env.BASE_URL}assets/memory-3.jpg`, shape: 'heart', caption: 'My favourite kind of chaos', tag: 'US BEING US' },
    { src: `${import.meta.env.BASE_URL}assets/memory-4.jpg`, shape: 'square', caption: 'One for the memory book', tag: 'LITTLE THINGS' },
    { src: `${import.meta.env.BASE_URL}assets/memory-5.jpg`, shape: 'polaroid', caption: 'And we would do it again', tag: 'NO REGRETS' },
    { src: `${import.meta.env.BASE_URL}assets/memory-6.jpg`, shape: 'circle', caption: 'More stories loading…', tag: 'TO BE CONTINUED' }
  ],
  surprises: [
    'Breaking news: you are not getting older, you are getting more limited edition. 🏷️',
    'Official birthday rule: calories do not count on your birthday. Neither does the second slice. 🍰',
    'You are not 1 year older. You are 365 days of experience points. Level up, legend. 🎮',
    'Your age is just a number. Your snack consumption today is a lifestyle. 🍕',
    'Fun fact: you have survived 100% of your worst days. That is an unbeaten record. 🏆',
    'Today you are legally allowed to be dramatic about every single thing. Go wild. 🎭',
    'Congratulations on another lap around the sun. Still no refund on the knees though. 🦴',
    'Plot twist: the cake is not a lie, and it has your name on it. 🎂',
    'Your friends are not just friends. They are unpaid birthday hype squad. We work for cake. 📣',
    'Reminder: you do not age, you just buffer. Please wait, loading wisdom… ⏳',
    'Scientists confirm you look amazing. (Scientists are me. I am the scientist.) 🔬',
    'Birthday wish status: processing. Estimated delivery: sooner than your online orders. 📦',
    'Dance your heart out today. The world is your disco ball. 🪩',
  ]
};

const COLORS = ['#f28f79', '#f2b8c6', '#b79cf0', '#f8d6a9', '#7fd1bd', '#ffd35c', '#ff7aa8', '#7fb4ff'];
const NO_FX = { type: '', n: 0 }; // gallery photos stay still; only the 4 rain photos react
const rnd = (a, b) => a + Math.random() * (b - a);

function Confetti({ burst }) {
  const ambient = useMemo(() => Array.from({ length: 34 }, (_, i) => i), []);
  const shots = useMemo(() => !burst ? [] : Array.from({ length: 190 }, (_, i) => {
    const side = i % 3, kind = i % 5 === 0 ? 'rib' : i % 4 === 0 ? 'dot' : '';
    const base = { i, kind, c: COLORS[i % COLORS.length], dur: rnd(2.6, 4.2), delay: rnd(0, .35), rot: rnd(-1400, 1400) };
    if (side === 0) return { ...base, sx: '1%', sy: '100%', dx: rnd(120, 780), up: rnd(380, 820), fall: '90px' };
    if (side === 1) return { ...base, sx: '99%', sy: '100%', dx: -rnd(120, 780), up: rnd(380, 820), fall: '90px' };
    return { ...base, sx: '50%', sy: '42%', dx: rnd(-520, 520), up: rnd(120, 420), fall: '60vh' };
  }), [burst]);
  const size = k => k === 'rib' ? { '--w': '4px', '--h': '34px' } : k === 'dot' ? { '--w': '9px', '--h': '9px' } : { '--w': `${rnd(7, 11)}px`, '--h': `${rnd(11, 18)}px` };
  return <div className="confetti" aria-hidden="true">
    {ambient.map(i => <span key={i} className="cf amb" style={{
      '--sx': `${(i * 47 + 9) % 100}%`, '--delay': `${(i % 11) * -.43}s`, '--dur': `${7 + (i % 7)}s`,
      '--c': COLORS[i % COLORS.length], '--drift': `${((i * 17) % 140) - 70}px`, '--fl': `${.5 + (i % 5) * .15}s`
    }}><b /></span>)}
    {shots.map(p => <span key={`${burst}-${p.i}`} className={`cf shot ${p.kind}`} style={{
      '--sx': p.sx, '--sy': p.sy, '--dx': `${p.dx}px`, '--up': `${p.up}px`, '--fall': p.fall, '--rot': `${p.rot}deg`,
      '--dur': `${p.dur}s`, '--delay': `${p.delay}s`, '--c': p.c, '--fl': `${rnd(.3, .8)}s`, ...size(p.kind)
    }}><b /></span>)}
  </div>;
}

// Extra photos for the click effects: auto-detects memory-7 ... memory-20 in /public/assets (jpg, jpeg, png, webp).
// Missing numbers (e.g. no memory-8) are simply skipped, so nothing breaks.
const RAIN_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG'];
const RAIN_SHAPES = ['polaroid', 'circle', 'square'];
const probeRain = n => new Promise(res => {
  let k = 0;
  const next = () => {
    if (k >= RAIN_EXTS.length) return res(null);
    const src = `${import.meta.env.BASE_URL}assets/memory-${n}.${RAIN_EXTS[k++]}`;
    const im = new Image(); im.onload = () => res(src); im.onerror = next; im.src = src;
  };
  next();
});

function RainPhoto({ p, i, n }) {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  return <span className={`rain-photo ${p.shape === 'polaroid' ? 'pol' : ''} ${p.shape === 'circle' ? 'rnd' : ''}`} style={{
    '--k': i, '--tx': `${Math.round(Math.cos(a) * 34)}vw`, '--ty': `${Math.round(Math.sin(a) * 24)}vh`,
    '--top': `${8 + (i % 2) * 14}vh`, '--l': `${6 + i * (80 / Math.max(n - 1, 1))}vw`
  }}><img src={p.src} alt="" /></span>;
}

// Photos fly across the whole screen so the effect is visible wherever the person is scrolled.
function PhotoRain({ rain, photos }) {
  if (!rain || !photos.length) return null;
  return <div key={rain.n} className={`photo-rain rain-${rain.type}`} aria-hidden="true">
    {photos.map((p, i) => <RainPhoto key={p.src} p={p} i={i} n={photos.length} />)}
  </div>;
}

// Full-screen collage of every picture at once. Stays open until the person hides it (button or Esc).
function AllPhotos({ open, photos, onClose }) {
  useEffect(() => {
    if (!open) return;
    const key = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', key);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = prev; };
  }, [open]);
  if (!open) return null;
  return <div className="all-photos" role="dialog" aria-label="All our pictures">
    <button className="all-close" onClick={onClose}>✕ Hide pictures</button>
    <h2 className="all-title">All our <em>memories,</em> together ✨</h2>
    <div className="all-grid">
      {photos.map((src, i) => <span key={src} className="all-tile" style={{
        '--i': i, '--r': `${((i * 53) % 9) - 4}deg`, '--fx': `${((i * 37) % 100) - 50}vw`, '--fy': `${((i * 61) % 100) - 50}vh`
      }}><img src={src} alt="" onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} /></span>)}
    </div>
  </div>;
}

function Gift({ open }) {
  return <div className={`gift-box ${open ? 'opened' : ''}`}>
    <div className="gb-glow" />
    {[0, 1, 2, 3, 4].map(k => <span key={k} className="gb-star" style={{ '--k': k, left: `${14 + k * 17}%` }}>{k % 2 ? '✧' : '✦'}</span>)}
    <div className="gb-body" /><div className="gb-lid"><span className="gb-bow">✿</span></div>
  </div>;
}

// state: 0 unlit, 1 lit, 2 blown out, 3 cutting the cake
function Cake({ state }) {
  const xs = [56, 80, 104];
  return <div className={`cake-scene s${state}`}>
    <div className="cake-glow" />
    {[[6, 20, 0], [88, 10, 1], [14, 62, 2], [80, 58, 3], [48, -8, 4]].map(([l, t, k]) =>
      <span key={k} className="spark" style={{ left: `${l}%`, top: `${t}px`, '--k': k }}>{k % 2 ? '✧' : '✦'}</span>)}
    <svg viewBox="0 0 160 130" className="cake-svg">
      <ellipse cx="80" cy="121" rx="66" ry="6" fill="#e9c9bd" opacity=".55" />
      <rect x="20" y="82" width="120" height="38" rx="9" fill="#f4a3ba" />
      <rect x="34" y="56" width="92" height="30" rx="8" fill="#ffd9a8" />
      <path d="M34 66c8 9 12-3 20 5s12-7 20 3 12-8 20 2 12-6 20 4 8-2 12 0V62a8 8 0 0 0-8-8H42a8 8 0 0 0-8 8z" fill="#fff6ef" />
      <path d="M20 92c8 9 12-3 20 5s12-7 20 3 12-8 20 2 12-6 20 4 12-4 20 0V90a8 8 0 0 0-8-8H28a8 8 0 0 0-8 8z" fill="#fff6ef" />
      {xs.map((x, k) => <g key={x} className="candle" transform={`translate(${x} 0)`}>
        <rect x="-3.5" y="32" width="7" height="24" rx="2" fill={['#b79cf0', '#f28f79', '#7fd1bd'][k]} />
        <path d="M-3.5 40l7 4M-3.5 48l7 4" stroke="#fff" strokeWidth="2" opacity=".7" />
        <line x1="0" y1="32" x2="0" y2="28" stroke="#5a4a5a" strokeWidth="1.2" />
        <g transform="translate(0 28)"><g className="flame" style={{ '--d': k }}>
          <path d="M0-17C7-7 7 1 0 5C-7 1-7-7 0-17Z" fill="#ff9a3c" />
          <path d="M0-10C3.5-4 3.5 0 0 3C-3.5 0-3.5-4 0-10Z" fill="#ffe27a" />
        </g></g>
        <g transform="translate(0 24)"><path className="smoke" style={{ '--d': k }} d="M0 0c-5-6 5-10 0-16s5-8 0-14" stroke="#b9a9b8" fill="none" strokeLinecap="round" strokeWidth="2" /></g>
      </g>)}
    </svg>
    <svg className="knife" viewBox="0 0 36 120" aria-hidden="true">
      <rect x="12" y="0" width="12" height="38" rx="5" fill="#7a5a6e" />
      <path d="M12 38h12v70l-12-14z" fill="#e4e8ef" stroke="#b9c0cc" strokeWidth="1" />
    </svg>
    <div className="cake-cut" />
    <div className="cake-slice" />
  </div>;
}


// A cartoon baby belly-dancing with the uploaded face. Drop a photo at src/assets/face.jpg
// (replace that file to change the face).
function BabyDance({ onParty }) {
  const defaultFace = `${import.meta.env.BASE_URL}assets/face.jpg`;
  const [face, setFace] = useState(null);
  const [dance, setDance] = useState(false);
  const stopRef = useRef(null);
  useEffect(() => { const im = new Image(); im.onload = () => setFace(f => f || defaultFace); im.src = defaultFace; }, []);
  useEffect(() => () => { stopRef.current?.(); }, []);
  const toggle = () => {
    if (dance) { stopRef.current?.(); stopRef.current = null; setDance(false); return; }
    setDance(true); onParty(); playBoing(); stopRef.current = startBelly();
  };
  const coins = [0, 1, 2, 3, 4, 5, 6].map(i => { const x = 78 + i * 14, d = (x - 120) / 46; return { x, y: 268 - d * d * 12 }; });
  return <article className="surprise-card reveal baby-card">
    <div className="baby-stage">
      <svg viewBox="0 0 240 350" className={`baby-svg ${dance ? 'dance' : ''}`} role="img" aria-label="A baby belly dancing">
        <defs><clipPath id="babyFace"><ellipse cx="120" cy="95" rx="56" ry="66" /></clipPath></defs>
        <ellipse className="b-shadow" cx="120" cy="340" rx="64" ry="7" fill="#352b39" opacity=".14" />
        <g className="b-all">
          <g className="b-hips">
            <path d="M76 258Q64 300 82 322L112 322L120 284L128 322L158 322Q176 300 164 258Z" fill="#8e6fd1" />
            <ellipse cx="97" cy="322" rx="15" ry="5.5" fill="#f6c45b" /><ellipse cx="143" cy="322" rx="15" ry="5.5" fill="#f6c45b" />
            <ellipse cx="97" cy="333" rx="15" ry="8" fill="#ffd7bd" /><ellipse cx="143" cy="333" rx="15" ry="8" fill="#ffd7bd" />
            <path d="M74 246Q120 262 166 246L166 258Q120 274 74 258Z" fill="#f6c45b" />
            {coins.map((c, i) => <circle key={i} className="coin" style={{ '--i': i }} cx={c.x} cy={c.y} r="5" fill="#ffd978" stroke="#d9a53a" strokeWidth="1" />)}
            <g className="b-torso">
              <g className="b-armL"><path d="M86 190Q42 196 38 142" stroke="#ffd7bd" strokeWidth="17" strokeLinecap="round" fill="none" /><circle cx="38" cy="134" r="11" fill="#ffd7bd" /><circle cx="42" cy="164" r="8.5" fill="none" stroke="#f6c45b" strokeWidth="3.5" /></g>
              <g className="b-armR"><path d="M154 190Q198 196 202 142" stroke="#ffd7bd" strokeWidth="17" strokeLinecap="round" fill="none" /><circle cx="202" cy="134" r="11" fill="#ffd7bd" /><circle cx="198" cy="164" r="8.5" fill="none" stroke="#f6c45b" strokeWidth="3.5" /></g>
              <ellipse cx="120" cy="212" rx="46" ry="50" fill="#ffd7bd" />
              <path d="M80 186Q120 174 160 186L156 206Q120 214 84 206Z" fill="#f58fb2" stroke="#f6c45b" strokeWidth="2.5" />
              <g className="b-belly">
                <path d="M78 218Q120 230 162 218L166 246Q120 260 74 246Z" fill="#ff9ec0" stroke="#f6c45b" strokeWidth="2" />
                <circle cx="120" cy="234" r="4.5" fill="#ffd978" /><circle cx="100" cy="231" r="2.5" fill="#fff" opacity=".8" /><circle cx="140" cy="231" r="2.5" fill="#fff" opacity=".8" />
              </g>
              <ellipse cx="120" cy="166" rx="20" ry="11" fill="#ffd7bd" />
              <g className="b-head">
                <circle cx="62" cy="72" r="14" fill="#f58fb2" /><circle cx="178" cy="72" r="14" fill="#f58fb2" />
                {face ? <image href={face} x="64" y="29" width="112" height="132" preserveAspectRatio="xMidYMid slice" clipPath="url(#babyFace)" />
                  : <g><ellipse cx="120" cy="95" rx="56" ry="66" fill="#ffd7bd" /><circle cx="100" cy="92" r="5" fill="#352b39" /><circle cx="140" cy="92" r="5" fill="#352b39" /><path d="M104 116Q120 132 136 116" stroke="#c0605f" strokeWidth="3.5" fill="none" strokeLinecap="round" /></g>}
                <ellipse cx="120" cy="95" rx="56" ry="66" fill="none" stroke="#fff" strokeWidth="5" />
                <path d="M80 52Q120 14 160 52" stroke="#f6c45b" strokeWidth="5" fill="none" strokeLinecap="round" />
                <circle cx="120" cy="27" r="6" fill="#ff7aa8" stroke="#f6c45b" strokeWidth="2.5" />
              </g>
            </g>
          </g>
        </g>
        {[[12, 70], [228, 80], [10, 230], [230, 240]].map(([x, y], i) => <text key={i} className="b-spark" style={{ '--i': i }} x={x} y={y} fontSize="20" fill="#f0a73f" textAnchor="middle">{i % 2 ? '✧' : '✦'}</text>)}
      </svg>
    </div>
    <h3>Baby dance party 💃</h3>
    <p>{face ? 'Look at those hips! Press play and watch the shimmy.' : 'Press play and watch this baby shimmy.'}</p>
    <div className="baby-actions">
      <button className="outline-btn" onClick={toggle}>{dance ? 'Stop the dance' : 'Start belly dancing'} ↗</button>
    </div>
  </article>;
}

function PhotoCard({ photo, index, fx }) {
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  const [soft, setSoft] = useState(false);
  const onLoad = e => { const r = e.target.naturalWidth / e.target.naturalHeight; if (photo.shape === 'circle' && Math.abs(r - 1) > .12) setSoft(true); };
  return <button className={`photo-card ${photo.shape} ${soft ? 'soft' : ''} photo-${index % 6} ${fx.type ? `fx-${fx.type}` : ''}`} onClick={() => { playSqueak(); setOpen(true); }} aria-label={`Open memory: ${photo.caption}`}>
    <span className="thread" aria-hidden="true" />
    <span className="photo-pin" aria-hidden="true">✦</span>
    <span className="photo-inner" key={fx.n}>
      {broken ? <span className="photo-placeholder"><span>✧</span><b>YOUR PHOTO HERE</b><small>{photo.tag}</small></span>
        : <img src={photo.src} alt={photo.caption} onError={() => setBroken(true)} onLoad={onLoad} loading="lazy" />}
    </span>
    <span className="photo-caption">{photo.caption}</span>
    <span className="photo-tag">{photo.tag}</span>
    {open && <span className="photo-overlay" onClick={e => { e.stopPropagation(); setOpen(false); }}><span className="photo-modal" onClick={e => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close photo">×</button>
      {broken ? <span className="photo-placeholder modal-placeholder"><span>✧</span><b>DROP IN A MEMORY</b><small>{photo.tag}</small></span> : <img src={photo.src} alt={photo.caption} />}
      <strong>{photo.caption}</strong><small>Replace this placeholder with your own memory ✨</small>
    </span></span>}
  </button>;
}

function App() {
  const [started, setStarted] = useState(false);
  const [burst, setBurst] = useState(0);
  const idRef = useRef(0);
  const timers = useRef([]);
  const [fx, setFx] = useState({ type: '', n: 0 });
  const [rain, setRain] = useState(null);
  const [rainPhotos, setRainPhotos] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [noteN, setNoteN] = useState(0);
  const [giftOpen, setGiftOpen] = useState(false);
  const [surpriseIndex, setSurpriseIndex] = useState(0);
  const [candle, setCandle] = useState(0); // 0 unlit, 1 lit, 2 blown out, 3 cutting
  const [musicOn, setMusicOn] = useState(true); // sound on by default; toggle mutes

  useEffect(() => { setMuted(!musicOn); }, [musicOn]);
  useEffect(() => { // unlock sound on the first tap (needed on phones), and again if the tab comes back
    const evs = ['touchend', 'pointerdown', 'click', 'keydown'];
    const go = () => { unlockAudio(); if (audioReady()) evs.forEach(e => window.removeEventListener(e, go)); };
    evs.forEach(e => window.addEventListener(e, go, { passive: true }));
    const vis = () => { if (!document.hidden) unlockAudio(); };
    document.addEventListener('visibilitychange', vis);
    return () => { evs.forEach(e => window.removeEventListener(e, go)); document.removeEventListener('visibilitychange', vis); };
  }, []);
  useEffect(() => {
    let alive = true;
    Promise.all(Array.from({ length: 14 }, (_, k) => probeRain(k + 7))).then(list => {
      if (alive) setRainPhotos(list.filter(Boolean).map((src, i) => ({ src, shape: RAIN_SHAPES[i % 3] })));
    });
    return () => { alive = false; };
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (!burst) return;
    const timer = window.setTimeout(() => setBurst(0), 4800);
    return () => window.clearTimeout(timer);
  }, [burst]);

  useEffect(() => {
    const targets = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { targets.forEach(el => el.classList.add('visible')); return; }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    targets.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!rain) return;
    const timer = window.setTimeout(() => setRain(null), 4800);
    return () => window.clearTimeout(timer);
  }, [rain]);

  const later = (fn, ms) => timers.current.push(window.setTimeout(fn, ms));
  const shoot = () => { setBurst(++idRef.current); playPop(); };
  const party = () => {
    (Math.random() < .7 ? playBlower : playAirhorn)(); later(shoot, 350);
    const type = ['gift', 'note', 'candle'][Math.floor(Math.random() * 3)];
    setRain(r => ({ type, n: (r?.n || 0) + 1 }));
  }; // party blower, then confetti pop
  const fire = type => { shoot(); setFx(f => ({ type, n: f.n + 1 })); setRain(r => ({ type, n: (r?.n || 0) + 1 })); };
  const nextNote = () => { playFunny(); setSurpriseIndex(i => (i + 1) % CONFIG.surprises.length); setNoteN(n => n + 1); fire('note'); };

  const candleStep = () => {
    if (candle === 2) return; // wait for the wish + knife
    if (candle === 3) { setCandle(0); playSadTrombone(); return; }
    if (candle === 0) { setCandle(1); fire('candle'); playBirthday(); return; }
    // 1 -> blow out, confetti, drumroll, then the knife cuts the cake
    setCandle(2); playBlower();
    later(shoot, 800);
    later(playDrumroll, 1300);
    later(() => { setCandle(3); playWhoosh(); }, 2300);
    later(playChop, 2300 + 1150);
    later(playTada, 2300 + 2300);
  };
  const candleText = [
    ['Make a birthday wish', 'Light the candles first, then make it a good one.', 'Light the candles'],
    ['The candles are lit ✨', 'Close your eyes, make a wish, then blow them out.', 'Blow them out'],
    ['Wish sent into the universe ✨', 'May the good things find their way to you.', 'Making a wish…'],
    ['Cake time! 🍰', 'Slice it up. The first piece is yours.', 'Light them again']
  ][candle];

  const toggleAll = () => { setShowAll(v => !v); if (!showAll) { playTada(); shoot(); } };

  const openSurprise = () => {
    setStarted(true); party();
    window.setTimeout(() => document.getElementById('birthday')?.scrollIntoView({ behavior: 'smooth' }), 120);
  };

  return <main>
    <Confetti burst={burst} />
    <PhotoRain rain={rain} photos={rainPhotos} />
    <AllPhotos open={showAll} photos={[...CONFIG.photos.map(p => p.src), ...rainPhotos.map(p => p.src)]} onClose={() => setShowAll(false)} />
    <nav className="topbar"><a className="brand" href="#home"><span className="brand-mark">✳</span> a little something......</a>
      <span className="nav-note">MADE WITH FRIENDSHIP <Heart size={13} fill="currentColor" /></span>
    </nav>

    <section className="hero" id="home">
      <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
      <div className="hero-sticker sticker-left">100%<br/>ICONIC</div><div className="hero-sticker sticker-right">GOOD<br/>VIBES ONLY ✦</div>
      <div className="hero-content">
        <p className="eyebrow"><Sparkles size={15} /> A VERY IMPORTANT ANNOUNCEMENT <Sparkles size={15} /></p>
        <h1>Hey, <em>you!</em><br/>There’s a little<br/><span className="highlight">surprise</span> for you.</h1>
        <p className="hero-copy">A tiny corner of the internet, made just to remind you how loved, appreciated, and delightfully weird you are.</p>
        <button className="primary-btn" onClick={openSurprise}>Open your surprise <span>↗</span></button>
        <div className="scroll-cue"><span className="scroll-line" /> KEEP SCROLLING <ArrowDown size={14} /></div>
      </div>
      <div className="hero-doodle doodle-star">✳</div><div className="hero-doodle doodle-heart">♡</div><div className="hero-doodle doodle-sparkle">✧</div>
      <div className="hero-bottom-note">A SMALL TOKEN OF LOVE. BUT A BIG AMOUNT OF LOVE.</div>
    </section>

    <section className={`birthday section-pad ${started ? 'birthday-started' : ''}`} id="birthday">
      <div className="birthday-shape shape-a" /><div className="birthday-shape shape-b" />
      <div className="section-inner birthday-inner">
        <p className="eyebrow reveal">THE DAY THE WORLD GOT A LITTLE BRIGHTER</p>
        <div className="birthday-number reveal">✦ &nbsp; IT’S YOUR DAY &nbsp; ✦</div>
        <h2 className="birthday-title reveal">Happy Birthday,<br/><em>{CONFIG.friendName}!</em></h2>
        <p className="birthday-copy reveal">{CONFIG.birthdayLine}</p>
        <div className="balloon-row" aria-hidden="true"><span>🎈</span><span>🎈</span><span>🎈</span><span>🎈</span><span>🎈</span></div>
        <button className="text-btn reveal" onClick={party}><PartyPopper size={17}/> MAKE SOME NOISE <span>↗</span></button>
      </div>
      <span className="side-note">ANOTHER TRIP AROUND THE SUN🌞 </span>
    </section>

    <section className="memories section-pad" id="memories">
      <div className="section-inner">
        <div className="section-heading reveal"><p className="eyebrow">A COLLECTION OF LITTLE BIG THINGS</p><h2>Our kind of <em>memories.</em></h2><p>Some moments deserve more than a camera roll. Tap any picture to take a closer look.</p></div>
        <div className="memory-line" aria-hidden="true" />
        <div className="photo-grid">{CONFIG.photos.map((photo, i) => <PhotoCard key={photo.src} photo={photo} index={i} fx={NO_FX} />)}</div>
        <p className="gallery-foot reveal"><span>✳</span> SIX LITTLE WINDOWS INTO THE GOOD TIMES <span>✳</span></p>
      </div>
    </section>

    <section className="letter-section section-pad" id="letter">
      <div className="letter-decoration">“</div>
      <div className="letter-card reveal">
        <div className="letter-top"><span>✉ A NOTE FOR YOU</span><span>OPEN WHENEVER</span></div>
        <h2>A little reminder<br/>of how <em>special</em> you are.</h2>
        <div className="letter-body">{CONFIG.letter.split('\\n\\n').map((p, i) => <p key={i}>{p}</p>)}</div>
        <div className="letter-signoff">Big hugs & birthday cake, <span>your friend Zeeeeee !!!♡</span></div>
        <div className="letter-stamp">JUST<br/>FOR YOU<br/><Heart size={20} fill="currentColor"/></div>
      </div>
      <div className="letter-flower">✿</div>
    </section>

    <section className="play-section section-pad" id="surprises">
      <div className="section-inner">
        <div className="section-heading reveal"><p className="eyebrow">BECAUSE ONE SURPRISE IS NEVER ENOUGH</p><h2>Choose your <em>happy.</em></h2><p>Go on. Press things. It’s your birthday. You’re allowed.</p></div>
        <div className="surprise-grid">
          <article className="surprise-card reveal gift-card"><div className="gift-art"><Gift open={giftOpen} /></div><h3>{giftOpen ? 'Surprise! 🎉' : 'A tiny mystery'}</h3><p>{giftOpen ? 'You are officially un-boxed and very much appreciated.' : 'There is definitely something in this box. Probably.'}</p><button className="outline-btn" onClick={() => { setGiftOpen(v => !v); if (!giftOpen) { playBoing(); later(playTada, 350); fire('gift'); } else playBonk(); }}>{giftOpen ? 'Close the gift' : 'Open your gift'} ↗</button></article>
          <article className="surprise-card reveal message-card"><div key={noteN} className={`note-inner ${noteN ? 'flipping' : ''}`}><div className="message-icon"><Star size={36} fill="currentColor"/>{noteN > 0 && <span className="hearts">{[0,1,2,3,4,5,6,7].map(i => <b key={i} style={{ '--a': `${i * 45}deg` }}>{i % 2 ? '💜' : '💖'}</b>)}</span>}</div><span className="mini-label">YOUR DAILY DOSE OF NICE</span><h3>A note from the universe</h3><p className="surprise-message note-pop">{CONFIG.surprises[surpriseIndex]}</p><button className="outline-btn" onClick={nextNote}>Another one, please ↗</button></div></article>
          <BabyDance onParty={shoot} />
          <article className="surprise-card reveal cake-card" data-lit={candle === 1}><div className="cake-art" onClick={candleStep} style={{ cursor: 'pointer' }}><Cake state={candle} /></div><h3>{candleText[0]}</h3><p>{candleText[1]}</p><button className="outline-btn" onClick={candleStep} disabled={candle === 2}>{candleText[2]} ↗</button></article>
        </div>
        <div className="confetti-cta reveal"><div><span className="mini-label">NEED A LITTLE EXTRA JOY?</span><h3>Let’s make a mess. <em>A festive one.</em></h3></div><button className="primary-btn" onClick={party}><PartyPopper size={17}/> Confetti, please!</button></div>
      </div>
    </section>

    <footer className="finale section-pad" id="finale">
      <div className="finale-stars" aria-hidden="true">✦　✧　✳　✧　✦</div>
      <p className="eyebrow reveal">AND BEFORE YOU GO…</p>
      <h2 className="reveal">Here’s to more<br/><em>life, laughter & you.</em></h2>
      <p className="finale-copy reveal">May this next trip around the sun be your favourite one yet. Never forget how much good you bring into the world just by being in it.</p>
      <button className="primary-btn finale-btn reveal" onClick={toggleAll}>{showAll ? 'Hide all pictures' : 'Show all our pictures'} <Sparkles size={16}/></button>
      <button className="primary-btn finale-btn reveal" onClick={() => { party(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>One more celebration <Heart size={16} fill="currentColor"/></button>
      <div className="final-signature">MADE WITH ♡, JUST FOR YOU <span>·</span> HAPPY BIRTHDAY!</div>
      <div className="footer-doodle">✿</div>
    </footer>
    <button className={`sound-toggle ${musicOn ? 'active' : ''}`} onClick={() => setMusicOn(v => !v)} title="Sound on/off" aria-label="Toggle sound"><Music2 size={16}/><span>{musicOn ? 'SOUND ON' : 'MUTED'}</span></button>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
