// kitchen.js — stasiun dapur dan semua interaksi di dalamnya.
// Pantry bahan, talenan, dua kompor, meja plating, tempat sampah,
// dan jendela sajian. Koki membawa bahan di tangan, mengolahnya di
// stasiun yang tepat, lalu merakit hidangan di piring.

var KITCHEN = {
  floorTop: 128,
  floorBottom: 700,
  floorLeft: 20,
  floorRight: 1260
};

function stationRects() {
  return {
    pantry: { x: 30, y: 150, w: 300, h: 92, label: 'PANTRY BAHAN' },
    board: { x: 380, y: 150, w: 190, h: 92, label: 'TALENAN' },
    stove: { x: 620, y: 150, w: 260, h: 92, label: 'KOMPOR' },
    window: { x: 930, y: 150, w: 320, h: 92, label: 'JENDELA SAJIAN' },
    plating: { x: 880, y: 540, w: 370, h: 110, label: 'MEJA PLATING' },
    trash: { x: 30, y: 540, w: 150, h: 110, label: 'SAMPAH' }
  };
}

var Kitchen = {
  boardItem: null,
  boardProgress: 0,
  boardChopping: false,
  burners: [
    { item: null, progress: 0, burn: 0, done: false },
    { item: null, progress: 0, burn: 0, done: false }
  ],
  plate: null,
  plateRecipe: null
};

function resetKitchen() {
  Kitchen.boardItem = null;
  Kitchen.boardProgress = 0;
  Kitchen.boardChopping = false;
  Kitchen.burners = [
    { item: null, progress: 0, burn: 0, done: false },
    { item: null, progress: 0, burn: 0, done: false }
  ];
  Kitchen.plate = null;
  Kitchen.plateRecipe = null;
}

function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function stationAt(x, y) {
  var rects = stationRects();
  var names = ['pantry', 'board', 'stove', 'window', 'plating', 'trash'];
  for (var i = 0; i < names.length; i++) {
    if (pointInRect(x, y, rects[names[i]])) return names[i];
  }
  return null;
}

function nearestStationName(x, y) {
  var rects = stationRects();
  var best = null;
  var bestDist = 130;
  var names = ['pantry', 'board', 'stove', 'window', 'plating', 'trash'];
  for (var i = 0; i < names.length; i++) {
    var r = rects[names[i]];
    var cx = Math.max(r.x, Math.min(x, r.x + r.w));
    var cy = Math.max(r.y, Math.min(y, r.y + r.h));
    var d = Math.hypot(x - cx, y - cy);
    if (d < bestDist) { bestDist = d; best = names[i]; }
  }
  return best;
}

function pantrySlotAt(x, y) {
  var r = stationRects().pantry;
  if (!pointInRect(x, y, r)) return null;
  var slotW = r.w / INGREDIENT_ORDER.length;
  var idx = Math.floor((x - r.x) / slotW);
  if (idx < 0) idx = 0;
  if (idx >= INGREDIENT_ORDER.length) idx = INGREDIENT_ORDER.length - 1;
  return INGREDIENT_ORDER[idx];
}

// Ambil bahan mentah dari pantry ke tangan koki.
function takeIngredient(ingredientId) {
  if (Player.hands.length >= 3) { showMessage('Tangan penuh! Olah dulu bahanmu.', 1.8); return false; }
  Player.hands.push({ ingredient: ingredientId, state: 'mentah' });
  playPickupSound();
  return true;
}

// Taruh bahan di talenan, atau ambil kembali hasil potongan.
function interactBoard() {
  if (Kitchen.boardItem) {
    if (Kitchen.boardItem.state === 'potong' || Kitchen.boardItem.state === 'siap') {
      if (Player.hands.length >= 3) { showMessage('Tangan penuh!', 1.5); return; }
      Player.hands.push(Kitchen.boardItem);
      Kitchen.boardItem = null;
      Kitchen.boardProgress = 0;
      playPickupSound();
    }
    return;
  }
  for (var i = 0; i < Player.hands.length; i++) {
    var item = Player.hands[i];
    if (INGREDIENTS[item.ingredient].chop && item.state === 'mentah') {
      Kitchen.boardItem = item;
      Player.hands.splice(i, 1);
      Kitchen.boardProgress = 0;
      playPickupSound();
      showMessage('Tahan E untuk memotong ' + INGREDIENTS[item.ingredient].name + '!', 2.0);
      return;
    }
  }
  showMessage('Talenan: butuh bahan mentah yang bisa dipotong (ayam / sayur).', 2.0);
}

// Taruh bahan ke kompor kosong, atau ambil hasil masakan.
function interactStove() {
  for (var b = 0; b < Kitchen.burners.length; b++) {
    var burner = Kitchen.burners[b];
    if (burner.item && (burner.done || burner.item.state === 'gosong')) {
      if (Player.hands.length >= 3) { showMessage('Tangan penuh!', 1.5); return; }
      Player.hands.push(burner.item);
      burner.item = null;
      burner.progress = 0;
      burner.burn = 0;
      burner.done = false;
      playPickupSound();
      return;
    }
  }
  for (var i = 0; i < Player.hands.length; i++) {
    var item = Player.hands[i];
    var ing = INGREDIENTS[item.ingredient];
    var target = nextPrepStep(item.ingredient, item.state);
    if (ing.cook && target === 'masak') {
      for (var j = 0; j < Kitchen.burners.length; j++) {
        if (!Kitchen.burners[j].item) {
          Kitchen.burners[j].item = item;
          Kitchen.burners[j].progress = 0;
          Kitchen.burners[j].burn = 0;
          Kitchen.burners[j].done = false;
          Player.hands.splice(i, 1);
          playPickupSound();
          return;
        }
      }
      showMessage('Kedua kompor sedang dipakai!', 1.8);
      return;
    }
  }
  showMessage('Kompor: butuh bahan yang harus dimasak.', 2.0);
}

function updateCooking(dt) {
  if (WarungState.screen !== 'playing' || WarungState.paused) return;
  if (Kitchen.boardItem && Kitchen.boardItem.state === 'mentah' && Kitchen.boardChopping) {
    Kitchen.boardProgress += dt / 2.2;
    if (Math.random() < dt * 6) playChopSound();
    if (Kitchen.boardProgress >= 1) {
      Kitchen.boardItem.state = nextPrepStep(Kitchen.boardItem.ingredient, 'mentah');
      Kitchen.boardProgress = 0;
      Kitchen.boardChopping = false;
      playChopDoneSound();
      showMessage(INGREDIENTS[Kitchen.boardItem.ingredient].name + ' selesai dipotong!', 1.6);
    }
  }
  for (var b = 0; b < Kitchen.burners.length; b++) {
    var burner = Kitchen.burners[b];
    if (!burner.item) continue;
    if (burner.item.state === 'gosong') continue;
    if (!burner.done) {
      burner.progress += dt / INGREDIENTS[burner.item.ingredient].cookTime;
      if (burner.progress >= 1) {
        burner.progress = 1;
        burner.done = true;
        burner.item.state = 'masak';
        playCookDoneSound();
        showMessage(INGREDIENTS[burner.item.ingredient].name + ' matang! Cepat angkat.', 2.0);
      }
    } else {
      burner.burn += dt;
      if (burner.burn > 9) {
        burner.item.state = 'gosong';
        burner.done = false;
        playBurntSound();
        showMessage(INGREDIENTS[burner.item.ingredient].name + ' GOSONG! Buang ke sampah.', 2.4);
      }
    }
  }
}

// Rakit hidangan di piring: letakkan komponen yang cocok dengan resep
// yang sedang dirakit; piring kosong memulai resep dari komponen itu.
function interactPlating() {
  if (plateIsComplete()) {
    if (Player.hands.length >= 3) { showMessage('Tangan penuh! Kosongkan dulu.', 1.5); return; }
    Player.hands.push({ ingredient: '__plate', state: 'siap', recipe: Kitchen.plateRecipe });
    Kitchen.plate = null;
    Kitchen.plateRecipe = null;
    playPickupSound();
    showMessage('Piring diangkat! Antar ke Jendela Sajian.', 2.0);
    return;
  }
  if (!Kitchen.plate) {
    if (Player.hands.length === 0) {
      showMessage('Meja plating: bawa bahan olahan ke sini untuk mulai merakit.', 2.0);
      return;
    }
    var first = Player.hands[0];
    var match = bestRecipeForHands();
    if (!match) { showMessage('Bahan ini bukan awal hidangan apa pun.', 1.8); return; }
    var startIdx = handIndexForRecipe(match.recipe);
    var startItem = Player.hands[startIdx];
    Kitchen.plate = [startItem];
    Kitchen.plateRecipe = match.recipe;
    Player.hands.splice(startIdx, 1);
    playPickupSound();
    showMessage('Merakit: ' + match.recipe.name + ' — ' + describeNeeds(match.recipe), 2.4);
    return;
  }
  var recipe = Kitchen.plateRecipe;
  for (var i = 0; i < Player.hands.length; i++) {
    var item = Player.hands[i];
    if (plateNeeds(recipe, Kitchen.plate, item)) {
      Kitchen.plate.push(item);
      Player.hands.splice(i, 1);
      playPickupSound();
      if (Kitchen.plate.length === recipe.needs.length) {
        showMessage(recipe.name + ' SIAP! Antar ke Jendela Sajian.', 2.4);
        playCookDoneSound();
      }
      return;
    }
  }
  showMessage('Piring ini tidak butuh bahan itu. Resep: ' + describeNeeds(recipe), 2.2);
}

// Pilih resep yang paling cocok dengan isi tangan koki: resep yang
// kebutuhan bahannya paling banyak terpenuhi menang; seri dimenangkan
// resep yang lebih dulu di daftar. Jadi piring tidak salah mulai saat
// satu bahan cocok untuk dua resep berbeda.
function bestRecipeForHands() {
  var best = null;
  var bestScore = 0;
  for (var r = 0; r < RECIPES.length; r++) {
    var recipe = RECIPES[r];
    var score = 0;
    for (var n = 0; n < recipe.needs.length; n++) {
      for (var h = 0; h < Player.hands.length; h++) {
        var item = Player.hands[h];
        if (item.ingredient === recipe.needs[n].ingredient && item.state === recipe.needs[n].state) { score++; break; }
      }
    }
    if (score > bestScore) { bestScore = score; best = recipe; }
  }
  if (!best || bestScore === 0) return null;
  return { recipe: best, score: bestScore };
}

function handIndexForRecipe(recipe) {
  for (var h = 0; h < Player.hands.length; h++) {
    var item = Player.hands[h];
    for (var n = 0; n < recipe.needs.length; n++) {
      if (item.ingredient === recipe.needs[n].ingredient && item.state === recipe.needs[n].state) return h;
    }
  }
  return 0;
}

function recipeStartingWith(item) {
  for (var r = 0; r < RECIPES.length; r++) {
    var recipe = RECIPES[r];
    for (var n = 0; n < recipe.needs.length; n++) {
      if (recipe.needs[n].ingredient === item.ingredient && recipe.needs[n].state === item.state) return recipe;
    }
  }
  return null;
}

function plateNeeds(recipe, plate, item) {
  for (var n = 0; n < recipe.needs.length; n++) {
    var need = recipe.needs[n];
    if (need.ingredient === item.ingredient && need.state === item.state) {
      var already = false;
      for (var p = 0; p < plate.length; p++) {
        if (plate[p].ingredient === need.ingredient && plate[p].state === need.state) already = true;
      }
      if (!already) return true;
    }
  }
  return false;
}

function plateIsComplete() {
  return Kitchen.plate && Kitchen.plateRecipe && Kitchen.plate.length === Kitchen.plateRecipe.needs.length;
}

function interactWindow() {
  var handIdx = -1;
  for (var h = 0; h < Player.hands.length; h++) {
    if (Player.hands[h].ingredient === '__plate') { handIdx = h; break; }
  }
  if (handIdx < 0) {
    if (Kitchen.plate) showMessage('Piring di meja plating sudah lengkap — angkat dulu (E di meja plating).', 2.2);
    else showMessage('Jendela sajian: antar piring hidangan yang sudah lengkap.', 2.0);
    return;
  }
  var carried = Player.hands[handIdx];
  var idx = findOrderMatchingRecipe(carried.recipe.id);
  if (idx < 0) {
    showMessage('Tidak ada pesanan ' + carried.recipe.name + ' saat ini!', 2.0);
    return;
  }
  Player.hands.splice(handIdx, 1);
  var rect = stationRects().window;
  serveOrderAt(idx, rect.x + rect.w / 2, rect.y + 30);
}

function interactTrash() {
  if (Player.hands.length === 0 && !Kitchen.plate) {
    showMessage('Sampah: buang bahan gosong atau piring yang salah di sini.', 2.0);
    return;
  }
  if (Kitchen.plate) {
    Kitchen.plate = null;
    Kitchen.plateRecipe = null;
    showMessage('Piring dibuang. Rakit lagi dari awal.', 1.8);
    return;
  }
  Player.hands.pop();
  playClickSound();
  showMessage('Bahan dibuang.', 1.4);
}
