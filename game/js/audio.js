// audio.js — semua suara disintesis WebAudio di kode, tanpa file audio.
// Bip pendek untuk ambil, potong, matang, sajian, dan bel pesanan baru.

var WarungAudio = {
  ctx: null,
  enabled: true
};

function audioContext() {
  if (WarungAudio.ctx) return WarungAudio.ctx;
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    WarungAudio.ctx = new AC();
  } catch (e) {
    WarungAudio.ctx = null;
  }
  return WarungAudio.ctx;
}

function unlockAudio() {
  var ctx = audioContext();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

function playTone(freq, duration, type, volume, slideTo) {
  if (!WarungAudio.enabled || WarungState.muted) return;
  var ctx = audioContext();
  if (!ctx) return;
  try {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + duration);
    gain.gain.setValueAtTime(volume || 0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Suara gagal di headless: permainan tetap jalan tanpa suara.
  }
}

function playPickupSound() { playTone(520, 0.09, 'triangle', 0.10); }
function playChopSound() { playTone(180, 0.07, 'square', 0.08, 120); }
function playChopDoneSound() { playTone(440, 0.12, 'triangle', 0.12, 660); }
function playCookDoneSound() { playTone(880, 0.16, 'sine', 0.12, 1174); }
function playBurntSound() { playTone(220, 0.3, 'sawtooth', 0.09, 90); }
function playServeSound() {
  playTone(523, 0.12, 'triangle', 0.12);
  setTimeout(function () { playTone(659, 0.12, 'triangle', 0.12); }, 90);
  setTimeout(function () { playTone(784, 0.2, 'triangle', 0.14); }, 180);
}
function playFailSound() { playTone(320, 0.25, 'sawtooth', 0.08, 160); }
function playOrderBell() {
  playTone(1046, 0.14, 'sine', 0.10);
  setTimeout(function () { playTone(1318, 0.18, 'sine', 0.09); }, 120);
}
function playClickSound() { playTone(700, 0.05, 'square', 0.06); }
