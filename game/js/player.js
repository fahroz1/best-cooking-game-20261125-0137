// player.js — koki: gerak keyboard, klik-untuk-bergerak, dan tombol aksi.
// Koki berjalan di lantai dapur, tidak menembus meja stasiun, dan
// membawa sampai tiga bahan di tangan.

var Player = {
  x: 640,
  y: 420,
  speed: 260,
  radius: 24,
  hands: [],
  target: null,
  facing: 1,
  walkPhase: 0,
  moving: false
};

var Keys = {};

function resetPlayer() {
  Player.x = 640;
  Player.y = 420;
  Player.hands = [];
  Player.target = null;
  Player.facing = 1;
  Player.walkPhase = 0;
  Player.moving = false;
}

function clampPlayerToFloor() {
  if (Player.x < KITCHEN.floorLeft + Player.radius) Player.x = KITCHEN.floorLeft + Player.radius;
  if (Player.x > KITCHEN.floorRight - Player.radius) Player.x = KITCHEN.floorRight - Player.radius;
  if (Player.y < KITCHEN.floorTop + Player.radius) Player.y = KITCHEN.floorTop + Player.radius;
  if (Player.y > KITCHEN.floorBottom - Player.radius) Player.y = KITCHEN.floorBottom - Player.radius;
}

function playerBlockedByStations(nx, ny) {
  var rects = stationRects();
  var names = ['pantry', 'board', 'stove', 'window', 'plating', 'trash'];
  for (var i = 0; i < names.length; i++) {
    var r = rects[names[i]];
    var cx = Math.max(r.x, Math.min(nx, r.x + r.w));
    var cy = Math.max(r.y, Math.min(ny, r.y + r.h));
    if (Math.hypot(nx - cx, ny - cy) < Player.radius - 2) return true;
  }
  return false;
}

function updatePlayer(dt) {
  if (WarungState.screen !== 'playing' || WarungState.paused) return;
  var dx = 0;
  var dy = 0;
  if (Keys['arrowup'] || Keys['w']) dy -= 1;
  if (Keys['arrowdown'] || Keys['s']) dy += 1;
  if (Keys['arrowleft'] || Keys['a']) dx -= 1;
  if (Keys['arrowright'] || Keys['d']) dx += 1;
  if (dx !== 0 || dy !== 0) {
    Player.target = null;
    var len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
  } else if (Player.target) {
    var tx = Player.target.x - Player.x;
    var ty = Player.target.y - Player.y;
    var dist = Math.hypot(tx, ty);
    if (dist < 8) {
      Player.target = null;
    } else {
      dx = tx / dist;
      dy = ty / dist;
    }
  }
  Player.moving = dx !== 0 || dy !== 0;
  if (Player.moving) {
    if (dx !== 0) Player.facing = dx > 0 ? 1 : -1;
    Player.walkPhase += dt * 10;
    var nx = Player.x + dx * Player.speed * dt;
    var ny = Player.y + dy * Player.speed * dt;
    if (!playerBlockedByStations(nx, Player.y)) Player.x = nx;
    if (!playerBlockedByStations(Player.x, ny)) Player.y = ny;
    clampPlayerToFloor();
  }
  Kitchen.boardChopping = !!Keys['e'] && !!Kitchen.boardItem && nearestStationName(Player.x, Player.y) === 'board';
}

// Satu tombol aksi (E / Spasi) dipakai di stasiun terdekat.
function doInteract() {
  if (WarungState.screen !== 'playing' || WarungState.paused) return;
  var name = nearestStationName(Player.x, Player.y);
  if (!name) { showMessage('Mendekatlah ke sebuah stasiun dapur dulu.', 1.6); return; }
  if (name === 'board') interactBoard();
  else if (name === 'stove') interactStove();
  else if (name === 'plating') interactPlating();
  else if (name === 'window') interactWindow();
  else if (name === 'trash') interactTrash();
  else if (name === 'pantry') showMessage('Klik bahan di pantry untuk mengambilnya.', 1.8);
}

function handleCanvasClick(mx, my) {
  if (WarungState.screen !== 'playing' || WarungState.paused) return;
  var pantryId = pantrySlotAt(mx, my);
  if (pantryId) {
    var rects = stationRects();
    var pr = rects.pantry;
    var near = Math.hypot(Player.x - (pr.x + pr.w / 2), Player.y - (pr.y + pr.h + 40)) < 260;
    if (near) takeIngredient(pantryId);
    else {
      Player.target = { x: pr.x + pr.w / 2, y: pr.y + pr.h + 46 };
      Player.pendingPickup = pantryId;
    }
    return;
  }
  var station = stationAt(mx, my);
  if (station) {
    var r = stationRects()[station];
    Player.target = { x: r.x + r.w / 2, y: Math.min(r.y + r.h + 44, KITCHEN.floorBottom - 30) };
    Player.pendingStation = station;
    return;
  }
  Player.target = { x: mx, y: my };
  Player.pendingPickup = null;
  Player.pendingStation = null;
}

// Saat koki tiba di tujuan klik, jalankan aksi yang tertunda.
function updateClickArrival() {
  if (!Player.target) {
    if (Player.pendingPickup) {
      takeIngredient(Player.pendingPickup);
      Player.pendingPickup = null;
    } else if (Player.pendingStation) {
      var st = Player.pendingStation;
      Player.pendingStation = null;
      if (st === 'board') interactBoard();
      else if (st === 'stove') interactStove();
      else if (st === 'plating') interactPlating();
      else if (st === 'window') interactWindow();
      else if (st === 'trash') interactTrash();
    }
  }
}
