// main.js — boot game, loop utama, input, dan mode screenshot.
// Mode ?shot=cover|chop|cook|serve|end menyiapkan satu momen permainan
// yang deterministik supaya tiap screenshot selalu sama isinya.

var GameCanvas = null;
var GameCtx = null;
var LastTick = 0;

function startNewShift() {
  resetShiftState();
  resetOrders();
  resetKitchen();
  resetPlayer();
  WarungState.screen = 'playing';
  Orders.list.push({ recipe: recipeById('nasi-ayam'), timeLeft: 70, timeMax: 78, id: 1 });
  Orders.list.push({ recipe: recipeById('mie-telur'), timeLeft: 52, timeMax: 78, id: 2 });
}

function applyShotMode(mode) {
  startNewShift();
  if (mode === 'cover') {
    Orders.list.push({ recipe: recipeById('mie-ayam'), timeLeft: 30, timeMax: 78, id: 3 });
    Player.x = 700;
    Player.y = 430;
    Player.hands = [{ ingredient: '__plate', state: 'siap', recipe: recipeById('nasi-ayam') }];
    Kitchen.plate = [
      { ingredient: 'mie', state: 'masak' },
      { ingredient: 'ayam', state: 'masak' }
    ];
    Kitchen.plateRecipe = recipeById('mie-ayam');
    Kitchen.boardItem = { ingredient: 'sayur', state: 'mentah' };
    Kitchen.boardProgress = 0.55;
    Kitchen.burners[0].item = { ingredient: 'telur', state: 'mentah' };
    Kitchen.burners[0].progress = 0.8;
    Kitchen.burners[1].item = { ingredient: 'nasi', state: 'masak' };
    Kitchen.burners[1].done = true;
    WarungState.coins = 85;
    WarungState.served = 3;
    WarungState.combo = 3;
    WarungState.bestCombo = 3;
    WarungState.shiftLeft = 132;
    showMessage('Mie Ayam Pedas hampir lengkap — tambah sambal!', 99);
  } else if (mode === 'chop') {
    Player.x = 470;
    Player.y = 300;
    Player.hands = [{ ingredient: 'ayam', state: 'mentah' }];
    Kitchen.boardItem = { ingredient: 'sayur', state: 'mentah' };
    Kitchen.boardProgress = 0.62;
    Kitchen.boardChopping = false;
    WarungState.shiftLeft = 150;
    showMessage('Tahan E untuk memotong sayur!', 99);
  } else if (mode === 'cook') {
    Player.x = 750;
    Player.y = 300;
    Kitchen.burners[0].item = { ingredient: 'ayam', state: 'mentah' };
    Kitchen.burners[0].progress = 0.72;
    Kitchen.burners[1].item = { ingredient: 'mie', state: 'masak' };
    Kitchen.burners[1].done = true;
    WarungState.shiftLeft = 118;
    showMessage('Ayam hampir matang — jangan sampai gosong!', 99);
  } else if (mode === 'serve') {
    Player.x = 1090;
    Player.y = 300;
    Player.hands = [{ ingredient: '__plate', state: 'siap', recipe: recipeById('nasi-ayam') }];
    WarungState.coins = 110;
    WarungState.served = 4;
    WarungState.combo = 4;
    WarungState.bestCombo = 4;
    WarungState.shiftLeft = 96;
    WarungState.floaters.push({ x: 1000, y: 340, text: '+25 koin', life: 1.4, max: 1.4, label: 'Nasi Ayam Goreng' });
    showMessage('Nasi Ayam Goreng tersaji! +25 koin', 99);
  } else if (mode === 'end') {
    WarungState.served = 11;
    WarungState.coins = 285;
    WarungState.bestCombo = 6;
    WarungState.failed = 2;
    WarungState.shiftLeft = 0;
    WarungState.screen = 'summary';
  }
}

function gameTick(timestamp) {
  var dt = 0;
  if (LastTick) dt = Math.min(0.05, (timestamp - LastTick) / 1000);
  LastTick = timestamp;
  var shot = window.__warungShot;
  if (!shot) {
    updateShiftClock(dt);
    updateOrders(dt);
    updatePlayer(dt);
    updateClickArrival();
    updateCooking(dt);
    updateFloaters(dt);
  }
  renderGame(GameCtx);
  requestAnimationFrame(gameTick);
}

function onKeyDown(event) {
  unlockAudio();
  var key = (event.key || '').toLowerCase();
  if (key === ' ') event.preventDefault();
  Keys[key] = true;
  if (WarungState.screen === 'title' && (key === 'enter' || key === ' ')) {
    startNewShift();
    playClickSound();
    return;
  }
  if (WarungState.screen === 'summary' && key === 'r') {
    startNewShift();
    return;
  }
  if (key === 'p' || key === 'escape') {
    if (WarungState.screen === 'playing') {
      WarungState.paused = !WarungState.paused;
      playClickSound();
    }
    return;
  }
  if (key === 'r' && WarungState.screen === 'playing') { startNewShift(); return; }
  if (key === 'm') {
    WarungState.muted = !WarungState.muted;
    showMessage(WarungState.muted ? 'Suara dimatikan.' : 'Suara dinyalakan.', 1.5);
    return;
  }
  if ((key === 'e' || key === ' ') && WarungState.screen === 'playing' && !event.repeat) doInteract();
}

function onKeyUp(event) {
  Keys[(event.key || '').toLowerCase()] = false;
}

function onCanvasMouseDown(event) {
  unlockAudio();
  if (WarungState.screen === 'title') { startNewShift(); playClickSound(); return; }
  if (WarungState.screen === 'summary') return;
  var rect = GameCanvas.getBoundingClientRect();
  var scaleX = CANVAS_W / rect.width;
  var scaleY = CANVAS_H / rect.height;
  var mx = (event.clientX - rect.left) * scaleX;
  var my = (event.clientY - rect.top) * scaleY;
  handleCanvasClick(mx, my);
}

function bootWarungRush() {
  GameCanvas = document.getElementById('game-canvas');
  GameCtx = GameCanvas.getContext('2d');
  var params = new URLSearchParams(window.location.search);
  var shot = params.get('shot');
  if (shot) window.__warungShot = shot;
  if (shot) {
    applyShotMode(shot);
  }
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  GameCanvas.addEventListener('mousedown', onCanvasMouseDown);
  requestAnimationFrame(gameTick);
}

document.addEventListener('DOMContentLoaded', bootWarungRush);
