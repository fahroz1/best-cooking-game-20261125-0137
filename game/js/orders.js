// orders.js — papan order: pesanan masuk, timer berjalan, gagal, selesai.
// Pesanan muncul berkala, makin cepat dan makin pendek waktunya saat
// shift berjalan. Satu pesanan = satu resep + sisa waktu.

var Orders = {
  list: [],
  spawnTimer: 2.5,
  maxConcurrent: 3
};

function resetOrders() {
  Orders.list = [];
  Orders.spawnTimer = 2.5;
  Orders.maxConcurrent = 3;
}

function orderTimeLimit(difficulty) {
  return Math.max(38, 78 - (difficulty - 1) * 22);
}

function spawnOrder() {
  var recipe = pickRecipeForDifficulty(WarungState.difficulty);
  var limit = orderTimeLimit(WarungState.difficulty);
  Orders.list.push({ recipe: recipe, timeLeft: limit, timeMax: limit, id: Date.now() + Math.random() });
  playOrderBell();
}

function updateOrders(dt) {
  if (WarungState.screen !== 'playing' || WarungState.paused) return;
  Orders.maxConcurrent = WarungState.difficulty < 1.4 ? 3 : WarungState.difficulty < 2 ? 4 : 5;
  Orders.spawnTimer -= dt;
  if (Orders.spawnTimer <= 0 && Orders.list.length < Orders.maxConcurrent) {
    spawnOrder();
    var gap = Math.max(7, 15 - WarungState.difficulty * 3);
    Orders.spawnTimer = gap + Math.random() * 4;
  }
  for (var i = Orders.list.length - 1; i >= 0; i--) {
    var o = Orders.list[i];
    o.timeLeft -= dt;
    if (o.timeLeft <= 0) {
      Orders.list.splice(i, 1);
      registerFailedOrder();
      showMessage('Pesanan ' + o.recipe.name + ' hangus! Kombo putus.', 2.4);
      playFailSound();
    }
  }
}

function findOrderMatchingRecipe(recipeId) {
  for (var i = 0; i < Orders.list.length; i++) {
    if (Orders.list[i].recipe.id === recipeId) return i;
  }
  return -1;
}

function serveOrderAt(index, x, y) {
  var order = Orders.list[index];
  Orders.list.splice(index, 1);
  var earned = registerServed(order.recipe, x, y);
  showMessage(order.recipe.name + ' tersaji! +' + earned + ' koin', 2.0);
  playServeSound();
  return earned;
}

function orderUrgency(order) {
  var frac = order.timeLeft / order.timeMax;
  if (frac < 0.25) return 'critical';
  if (frac < 0.5) return 'hurry';
  return 'calm';
}
