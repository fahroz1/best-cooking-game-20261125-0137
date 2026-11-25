// state.js — skor, kombo, dan jam shift Warung Rush.
// Satu-satunya tempat yang menyimpan angka permainan: koin, hidangan
// tersaji, kombo berjalan, kombo terbaik, dan sisa waktu shift.

var WarungState = {
  coins: 0,
  served: 0,
  failed: 0,
  combo: 0,
  bestCombo: 0,
  shiftLength: 180,
  shiftLeft: 180,
  difficulty: 1,
  screen: 'title',
  paused: false,
  muted: false,
  floaters: [],
  message: '',
  messageTimer: 0
};

function resetShiftState() {
  WarungState.coins = 0;
  WarungState.served = 0;
  WarungState.failed = 0;
  WarungState.combo = 0;
  WarungState.bestCombo = 0;
  WarungState.shiftLeft = WarungState.shiftLength;
  WarungState.difficulty = 1;
  WarungState.floaters = [];
  WarungState.message = '';
  WarungState.messageTimer = 0;
  WarungState.paused = false;
}

function addCoins(amount, x, y, label) {
  WarungState.coins += amount;
  WarungState.floaters.push({ x: x, y: y, text: '+' + amount + ' koin', life: 1.4, max: 1.4, label: label || '' });
}

function registerServed(recipe, x, y) {
  WarungState.served += 1;
  WarungState.combo += 1;
  if (WarungState.combo > WarungState.bestCombo) WarungState.bestCombo = WarungState.combo;
  var bonus = WarungState.combo >= 3 ? 5 * (WarungState.combo - 2) : 0;
  var earned = recipe.price + bonus;
  addCoins(earned, x, y, recipe.name);
  return earned;
}

function registerFailedOrder() {
  WarungState.failed += 1;
  WarungState.combo = 0;
}

function updateShiftClock(dt) {
  if (WarungState.screen !== 'playing' || WarungState.paused) return;
  WarungState.shiftLeft -= dt;
  WarungState.difficulty = 1 + (1 - Math.max(0, WarungState.shiftLeft) / WarungState.shiftLength) * 1.6;
  if (WarungState.shiftLeft <= 0) {
    WarungState.shiftLeft = 0;
    WarungState.screen = 'summary';
  }
}

function updateFloaters(dt) {
  for (var i = WarungState.floaters.length - 1; i >= 0; i--) {
    var f = WarungState.floaters[i];
    f.life -= dt;
    f.y -= 34 * dt;
    if (f.life <= 0) WarungState.floaters.splice(i, 1);
  }
  if (WarungState.messageTimer > 0) WarungState.messageTimer -= dt;
}

function showMessage(text, seconds) {
  WarungState.message = text;
  WarungState.messageTimer = seconds || 2.2;
}

function starRating() {
  if (WarungState.served >= 14) return 3;
  if (WarungState.served >= 9) return 2;
  if (WarungState.served >= 5) return 1;
  return 0;
}

function shiftClockText() {
  var s = Math.max(0, Math.ceil(WarungState.shiftLeft));
  var m = Math.floor(s / 60);
  var r = s % 60;
  return m + ':' + (r < 10 ? '0' + r : '' + r);
}
