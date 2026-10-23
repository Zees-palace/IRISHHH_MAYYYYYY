// Web Audio sounds: no audio files needed.
let ctx, muted = false;
export const setMuted = v => { muted = v; };
const ac = () => { ctx ||= new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); return ctx; };
const rand = a => a[Math.floor(Math.random() * a.length)];

// tone(type, [[time, freq], ...], duration, volume, delay, [filterType, freq, Q])
function tone(type, pts, dur, vol = .25, delay = 0, filt) {
  if (muted) return;
  const a = ac(), t = a.currentTime + delay + .01;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(pts[0][1], t);
  pts.slice(1).forEach(([dt, f]) => o.frequency.exponentialRampToValueAtTime(f, t + dt));
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + .02);
  g.gain.setValueAtTime(vol, t + Math.max(.02, dur - .08));
  g.gain.exponentialRampToValueAtTime(.001, t + dur);
  let n = o;
  if (filt) { const f = a.createBiquadFilter(); f.type = filt[0]; f.frequency.value = filt[1]; f.Q.value = filt[2] || 1; o.connect(f); n = f; }
  n.connect(g).connect(a.destination);
  o.start(t); o.stop(t + dur + .02);
}

// noise(duration, volume, filterType, freqStart, freqEnd, delay)
function noise(dur, vol = .4, ft = 'lowpass', f0 = 2000, f1 = f0, delay = 0, q = 1) {
  if (muted) return;
  const a = ac(), t = a.currentTime + delay + .01, len = Math.max(1, Math.floor(a.sampleRate * dur));
  const buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = buf; f.type = ft; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  s.connect(f).connect(g).connect(a.destination); s.start(t);
}

// ---------- the classics ----------
export function playBirthday() {
  if (muted) return;
  const N = { G4:392, A4:440, B4:493.88, C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99 };
  const song = [
    ['G4',.75],['G4',.25],['A4',1],['G4',1],['C5',1],['B4',2],
    ['G4',.75],['G4',.25],['A4',1],['G4',1],['D5',1],['C5',2],
    ['G4',.75],['G4',.25],['G5',1],['E5',1],['C5',1],['B4',1],['A4',2],
    ['F5',.75],['F5',.25],['E5',1],['C5',1],['D5',1],['C5',2]];
  const beat = .42; let at = 0;
  song.forEach(([n, d]) => { tone('triangle', [[0, N[n]]], d * beat * .95, .25, at); at += d * beat; });
}
export function playPop() { noise(.25, .9, 'lowpass', 6000, 300); tone('sine', [[0, 500], [.08, 90]], .12, .3); }
export function playBlower() { // party blower: pee-pooo
  tone('sawtooth', [[0, 260], [.35, 900], [.9, 700]], 1, .22, 0, ['bandpass', 1400, 3]);
}

// ---------- funny ones ----------
export function playBoing() { tone('sine', [[0, 150], [.08, 520], [.25, 170], [.45, 420], [.7, 190], [.95, 300]], 1, .35); }
export function playSlideUp() { tone('sine', [[0, 350], [.7, 2000]], .75, .25); }
export function playSlideDown() { tone('sine', [[0, 1800], [.7, 300]], .75, .25); }
export function playSqueak() { tone('triangle', [[0, 1700], [.07, 2800]], .1, .25); tone('triangle', [[0, 2000], [.09, 3200]], .12, .25, .13); }
export function playBonk() { tone('sine', [[0, 420], [.18, 70]], .22, .5); noise(.04, .4, 'highpass', 3000); }
export function playRaspberry() { // pbbbt
  tone('sawtooth', [[0, 110], [.45, 70]], .5, .35, 0, ['lowpass', 500, 4]);
  for (let i = 0; i < 9; i++) noise(.03, .3, 'lowpass', 400, 200, i * .05);
}
export function playKazoo() { // da da da-da-daaa
  const s = [[440,.12],[440,.12],[440,.12],[554,.12],[659,.45]]; let at = 0;
  s.forEach(([f, d]) => { tone('sawtooth', [[0, f], [d, f * 1.02]], d, .2, at, ['bandpass', 1300, 2]); at += d + .03; });
}
export function playAirhorn() {
  [440, 554, 659].forEach((f, i) => tone('sawtooth', [[0, f * 1.02], [.9, f]], .9, .12, i * .01, ['lowpass', 2200, 1]));
  tone('sawtooth', [[0, 220], [.9, 218]], .9, .16);
}
export function playSadTrombone() { // wah wah wah waaah
  [[233, .45], [220, .45], [207, .45], [196, 1.1]].reduce((at, [f, d]) => {
    tone('sawtooth', [[0, f * 1.04], [d * .6, f], [d, f * .96]], d, .22, at, ['lowpass', 700, 2]); return at + d + .05;
  }, 0);
}
export function playTada() {
  [[392,.12],[523,.12],[659,.12]].reduce((at, [f, d]) => { tone('triangle', [[0, f]], d, .25, at); return at + d; }, 0);
  tone('triangle', [[0, 784]], .7, .28, .36); tone('square', [[0, 392]], .7, .08, .36);
  noise(.9, .35, 'highpass', 6000, 6000, .36);
}
export function playDrumroll() {
  for (let i = 0; i < 28; i++) { const d = i * .035; noise(.05, .12 + i * .012, 'lowpass', 900, 400, d); }
  noise(.7, .4, 'highpass', 7000, 7000, 1);
}
export function playWhoosh() { noise(.45, .5, 'bandpass', 400, 3500, 0, 1.5); }
export function playChop() { noise(.09, .6, 'highpass', 2500, 2500); tone('sine', [[0, 160], [.12, 55]], .14, .5); }
export function playGiggle() { for (let i = 0; i < 5; i++) tone('triangle', [[0, 700 + (i % 2) * 220], [.07, 1000 + (i % 2) * 150]], .08, .22, i * .11); }

// random funny sound for button presses
const pool = [playBoing, playSqueak, playBonk, playSlideUp, playSlideDown, playKazoo, playRaspberry, playAirhorn, playGiggle];
export function playFunny() { rand(pool)(); }

// ---------- belly dance music (looping) ----------
// darbuka drum + finger cymbals + snake-charmer melody. Returns a stop() function.
export function startBelly() {
  let on = true, bar = 0;
  const dum = at => tone('sine', [[0, 150], [.1, 65]], .2, .7, at);
  const tek = at => { noise(.05, .35, 'highpass', 2500, 2500, at); tone('triangle', [[0, 650], [.05, 420]], .06, .15, at); };
  const zil = at => { noise(.3, .13, 'bandpass', 9000, 9000, at, 6); tone('sine', [[0, 5200]], .25, .04, at); };
  const A = [440, 466.16, 440, 392, 369.99, 392, 311.13, 293.66];
  const B = [293.66, 311.13, 369.99, 392, 440, 392, 369.99, 293.66];
  const play = () => {
    if (!on) return;
    const e = .25; // eighth note
    // rhythm: dum tek-a tek dum tek-a tek (maqsum)
    [[0,dum],[1,tek],[2,tek],[3,dum],[4,dum],[5,tek],[6,tek],[7,dum]].forEach(([i, f]) => f(i * e));
    for (let i = 0; i < 8; i += 2) zil(i * e + .02);
    (bar % 2 ? B : A).forEach((f, i) => tone('sawtooth', [[0, f], [e, f * (i % 3 ? 1 : 1.015)]], e * .9, .11, i * e, ['lowpass', 1500, 2]));
    bar++;
  };
  play();
  const id = setInterval(play, 2000);
  return () => { on = false; clearInterval(id); };
}
