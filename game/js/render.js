// render.js — semua gambar dapur digambar di canvas 2D.
// Palet hangat warung: kayu, krem, merah bata, dan hijau daun.
// Tidak ada gambar luar: semua ikon makanan digambar dari bentuk.

var CANVAS_W = 1280;
var CANVAS_H = 720;

function drawIngredientIcon(ctx, icon, x, y, size, state) {
  var s = size;
  ctx.save();
  ctx.translate(x, y);
  if (state === 'gosong') {
    ctx.fillStyle = '#2b2b2b';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#555';
    ctx.font = 'bold ' + Math.round(s * 0.5) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('X', 0, 1);
    ctx.restore();
    return;
  }
  if (icon === 'bowl') {
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.arc(0, s * 0.08, s * 0.42, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-s * 0.42, -s * 0.12, s * 0.84, s * 0.12);
  } else if (icon === 'drumstick') {
    ctx.strokeStyle = '#f2b25c';
    ctx.lineWidth = s * 0.22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.25, s * 0.25);
    ctx.lineTo(s * 0.2, -s * 0.2);
    ctx.stroke();
    ctx.fillStyle = '#e8893a';
    ctx.beginPath();
    ctx.arc(s * 0.22, -s * 0.22, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.arc(-s * 0.3, s * 0.3, s * 0.14, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === 'egg') {
    ctx.fillStyle = '#fff8e0';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.34, s * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.arc(0, s * 0.06, s * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === 'noodle') {
    ctx.strokeStyle = '#ffd66e';
    ctx.lineWidth = s * 0.12;
    ctx.lineCap = 'round';
    for (var i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(0, i * s * 0.16, s * 0.3, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
  } else if (icon === 'leaf') {
    ctx.fillStyle = '#7ec850';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.4, s * 0.24, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3e7d26';
    ctx.fillRect(-s * 0.05, -s * 0.05, s * 0.5, s * 0.06);
  } else if (icon === 'chili') {
    ctx.strokeStyle = '#e8442e';
    ctx.lineWidth = s * 0.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.32, Math.PI * 0.1, Math.PI * 1.1);
    ctx.stroke();
    ctx.fillStyle = '#3e7d26';
    ctx.fillRect(s * 0.22, -s * 0.42, s * 0.08, s * 0.22);
  }
  if (state === 'mentah') {
    ctx.strokeStyle = 'rgba(90,60,20,0.55)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.48, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function drawPlateIcon(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#fdfdfd';
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.5, size * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.38, size * 0.24, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawStationBase(ctx, r, fill, label, sub, dark) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = '#5d3a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = dark ? '#3d2b1f' : '#fff8ec';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, r.x + r.w / 2, r.y + 22);
  if (sub) {
    ctx.font = '12px sans-serif';
    ctx.fillStyle = dark ? '#6b4a2a' : '#ffe9c4';
    ctx.fillText(sub, r.x + r.w / 2, r.y + r.h - 10);
  }
}

function drawOrderBoard(ctx) {
  ctx.fillStyle = '#3d2b1f';
  ctx.fillRect(0, 0, CANVAS_W, 116);
  ctx.fillStyle = '#f7e8c9';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('WARUNG RUSH — Dapur Kilat', 24, 32);
  ctx.font = '15px sans-serif';
  ctx.fillStyle = '#ffd66e';
  ctx.fillText('Koin: ' + WarungState.coins + '   |   Tersaji: ' + WarungState.served + '   |   Kombo: x' + WarungState.combo + ' (terbaik x' + WarungState.bestCombo + ')', 24, 58);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Shift ' + shiftClockText(), CANVAS_W - 24, 34);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#ffd66e';
  ctx.fillText('P jeda  •  R restart  •  M suara', CANVAS_W - 24, 58);
  ctx.textAlign = 'left';
  var x = 24;
  for (var i = 0; i < Orders.list.length; i++) {
    var o = Orders.list[i];
    var w = 196;
    var frac = Math.max(0, o.timeLeft / o.timeMax);
    var urg = orderUrgency(o);
    ctx.fillStyle = urg === 'critical' ? '#7a1f12' : urg === 'hurry' ? '#8a5a12' : '#fff8ec';
    ctx.strokeStyle = urg === 'critical' ? '#ff6b4a' : '#5d3a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, 70, w, 40, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = urg === 'critical' ? '#fff' : '#3d2b1f';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(o.recipe.name, x + 10, 86);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = urg === 'critical' ? '#ffe1d6' : '#6b4a2a';
    ctx.fillText(shortNeeds(o.recipe), x + 10, 101);
    ctx.fillStyle = '#d8c49a';
    ctx.fillRect(x + 8, 104, w - 16, 4);
    ctx.fillStyle = urg === 'critical' ? '#ff3b1f' : urg === 'hurry' ? '#ff9d2e' : '#3fae5a';
    ctx.fillRect(x + 8, 104, (w - 16) * frac, 4);
    x += w + 10;
  }
  if (Orders.list.length === 0) {
    ctx.fillStyle = '#ffe9c4';
    ctx.font = 'italic 14px sans-serif';
    ctx.fillText('Belum ada pesanan — pelanggan segera datang…', 24, 96);
  }
}

function drawKitchenFloor(ctx) {
  ctx.fillStyle = '#e8c98f';
  ctx.fillRect(0, 116, CANVAS_W, CANVAS_H - 116);
  ctx.strokeStyle = 'rgba(120,80,30,0.25)';
  ctx.lineWidth = 1;
  for (var tx = 0; tx < CANVAS_W; tx += 64) {
    ctx.beginPath();
    ctx.moveTo(tx, 116);
    ctx.lineTo(tx, CANVAS_H);
    ctx.stroke();
  }
  for (var ty = 116; ty < CANVAS_H; ty += 64) {
    ctx.beginPath();
    ctx.moveTo(0, ty);
    ctx.lineTo(CANVAS_W, ty);
    ctx.stroke();
  }
}

function drawPantry(ctx) {
  var r = stationRects().pantry;
  drawStationBase(ctx, r, '#8a5a2b', 'PANTRY BAHAN');
  var slotW = r.w / INGREDIENT_ORDER.length;
  for (var i = 0; i < INGREDIENT_ORDER.length; i++) {
    var id = INGREDIENT_ORDER[i];
    var ing = INGREDIENTS[id];
    var cx = r.x + slotW * i + slotW / 2;
    ctx.fillStyle = 'rgba(255,248,236,0.9)';
    ctx.beginPath();
    ctx.roundRect(cx - 20, r.y + 30, 40, 40, 8);
    ctx.fill();
    drawIngredientIcon(ctx, ing.icon, cx, r.y + 50, 30, 'siap');
    ctx.fillStyle = '#fff8ec';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ing.name, cx, r.y + 84);
  }
}

function drawBoard(ctx) {
  var r = stationRects().board;
  drawStationBase(ctx, r, '#a9713f', 'TALENAN');
  if (Kitchen.boardItem) {
    drawIngredientIcon(ctx, INGREDIENTS[Kitchen.boardItem.ingredient].icon, r.x + r.w / 2, r.y + 52, 40, Kitchen.boardItem.state);
    if (Kitchen.boardProgress > 0) {
      ctx.fillStyle = '#3d2b1f';
      ctx.fillRect(r.x + 20, r.y + 74, r.w - 40, 8);
      ctx.fillStyle = '#ffd66e';
      ctx.fillRect(r.x + 20, r.y + 74, (r.w - 40) * Kitchen.boardProgress, 8);
    }
  } else {
    ctx.strokeStyle = 'rgba(255,248,236,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(r.x + r.w / 2, r.y + 55, 24, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawStove(ctx) {
  var r = stationRects().stove;
  drawStationBase(ctx, r, '#5b5b66', 'KOMPOR');
  for (var b = 0; b < 2; b++) {
    var bx = r.x + 40 + b * 130;
    var by = r.y + 56;
    ctx.fillStyle = '#2b2b30';
    ctx.beginPath();
    ctx.arc(bx, by, 30, 0, Math.PI * 2);
    ctx.fill();
    var burner = Kitchen.burners[b];
    if (burner.item) {
      drawIngredientIcon(ctx, INGREDIENTS[burner.item.ingredient].icon, bx, by - 6, 36, burner.item.state);
      if (!burner.done && burner.item.state !== 'gosong') {
        ctx.fillStyle = '#3d2b1f';
        ctx.fillRect(bx - 26, by + 22, 52, 7);
        ctx.fillStyle = '#ff9d2e';
        ctx.fillRect(bx - 26, by + 22, 52 * burner.progress, 7);
      } else if (burner.done) {
        ctx.fillStyle = '#3fae5a';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MATANG!', bx, by + 27);
      } else if (burner.item.state === 'gosong') {
        ctx.fillStyle = '#ff3b1f';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GOSONG!', bx, by + 27);
      }
    } else {
      ctx.fillStyle = '#9a9aa5';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('kosong', bx, by + 4);
    }
  }
}

function drawServingWindow(ctx) {
  var r = stationRects().window;
  drawStationBase(ctx, r, '#c0392b', 'JENDELA SAJIAN', 'antar piring lengkap ke sini');
  ctx.fillStyle = '#fff8ec';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SAJIKAN!', r.x + r.w / 2, r.y + 62);
  drawPlateIcon(ctx, r.x + 34, r.y + 56, 44);
  drawPlateIcon(ctx, r.x + r.w - 34, r.y + 56, 44);
}

function drawPlating(ctx) {
  var r = stationRects().plating;
  drawStationBase(ctx, r, '#fdf6e3', 'MEJA PLATING', undefined, true);
  ctx.fillStyle = '#3d2b1f';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  if (Kitchen.plate) {
    drawPlateIcon(ctx, r.x + 60, r.y + 58, 64);
    for (var i = 0; i < Kitchen.plate.length; i++) {
      var item = Kitchen.plate[i];
      if (item.ingredient === '__plate') continue;
      drawIngredientIcon(ctx, INGREDIENTS[item.ingredient].icon, r.x + 60 + (i - 1) * 4, r.y + 52, 26, item.state);
    }
    var recipe = Kitchen.plateRecipe;
    ctx.fillStyle = '#3d2b1f';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(recipe.name + '  ' + Kitchen.plate.length + '/' + recipe.needs.length, r.x + 120, r.y + 46);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#6b4a2a';
    var missing = [];
    for (var n = 0; n < recipe.needs.length; n++) {
      var need = recipe.needs[n];
      var have = false;
      for (var p = 0; p < Kitchen.plate.length; p++) {
        if (Kitchen.plate[p].ingredient === need.ingredient && Kitchen.plate[p].state === need.state) have = true;
      }
      if (!have) missing.push(INGREDIENTS[need.ingredient].name + ' ' + stateLabel(need.state));
    }
    ctx.fillText(missing.length ? 'Kurang: ' + missing.join(', ') : 'LENGKAP — angkat piring (E)!', r.x + 120, r.y + 68);
  } else {
    drawPlateIcon(ctx, r.x + 60, r.y + 58, 64);
    ctx.fillStyle = '#6b4a2a';
    ctx.font = '13px sans-serif';
    ctx.fillText('Piring kosong — bawa bahan ke sini.', r.x + 120, r.y + 58);
  }
}

function drawTrash(ctx) {
  var r = stationRects().trash;
  drawStationBase(ctx, r, '#6b7a6b', 'SAMPAH', 'buang bahan gosong');
  ctx.fillStyle = '#3d4a3d';
  ctx.beginPath();
  ctx.roundRect(r.x + 45, r.y + 34, 60, 52, 8);
  ctx.fill();
  ctx.fillStyle = '#fff8ec';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('X', r.x + 75, r.y + 66);
}

function drawPlayer(ctx) {
  var bob = Player.moving ? Math.sin(Player.walkPhase) * 3 : 0;
  ctx.save();
  ctx.translate(Player.x, Player.y + bob);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2e86c1';
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5cfa0';
  ctx.beginPath();
  ctx.arc(0, -6, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(0, -18, 15, 9, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(-15, -20, 30, 6);
  ctx.fillStyle = '#3d2b1f';
  ctx.beginPath();
  ctx.arc(-5, -7, 1.8, 0, Math.PI * 2);
  ctx.arc(5, -7, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('KOKI', 0, 34);
  ctx.restore();
  for (var i = 0; i < Player.hands.length; i++) {
    var item = Player.hands[i];
    var hx = Player.x - 26 + i * 26;
    var hy = Player.y - 34;
    ctx.fillStyle = 'rgba(255,248,236,0.95)';
    ctx.beginPath();
    ctx.arc(hx, hy, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5d3a1a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (item.ingredient === '__plate') {
      drawPlateIcon(ctx, hx, hy, 22);
      ctx.fillStyle = '#c0392b';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.recipe.name, hx, hy - 20);
    } else {
      drawIngredientIcon(ctx, INGREDIENTS[item.ingredient].icon, hx, hy, 22, item.state);
      ctx.fillStyle = '#3d2b1f';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(INGREDIENTS[item.ingredient].name + ' ' + stateLabel(item.state), hx, hy - 19);
    }
  }
}

function drawFloaters(ctx) {
  ctx.textAlign = 'center';
  for (var i = 0; i < WarungState.floaters.length; i++) {
    var f = WarungState.floaters[i];
    ctx.globalAlpha = Math.max(0, f.life / f.max);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(f.text, f.x, f.y);
    if (f.label) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(f.label, f.x, f.y - 24);
    }
  }
  ctx.globalAlpha = 1;
}

function drawHintBar(ctx) {
  if (WarungState.messageTimer <= 0) return;
  ctx.fillStyle = 'rgba(61,43,31,0.92)';
  ctx.beginPath();
  ctx.roundRect(CANVAS_W / 2 - 320, CANVAS_H - 52, 640, 34, 10);
  ctx.fill();
  ctx.fillStyle = '#ffe9c4';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(WarungState.message, CANVAS_W / 2, CANVAS_H - 30);
}

function drawRecipeMenu(ctx) {
  ctx.fillStyle = 'rgba(255,248,236,0.95)';
  ctx.strokeStyle = '#5d3a1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(380, 560, 470, 110, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#3d2b1f';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('MENU WARUNG (5 resep)', 396, 580);
  ctx.font = '12px sans-serif';
  for (var i = 0; i < RECIPES.length; i++) {
    var rcp = RECIPES[i];
    ctx.fillStyle = rcp.color;
    ctx.fillRect(396, 592 + i * 14 - 9, 10, 10);
    ctx.fillStyle = '#3d2b1f';
    ctx.fillText(rcp.name + ' — ' + describeNeeds(rcp) + '  (' + rcp.price + ' koin)', 412, 592 + i * 14);
  }
}

function drawTitleScreen(ctx) {
  ctx.fillStyle = '#3d2b1f';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.roundRect(240, 90, 800, 170, 20);
  ctx.fill();
  ctx.fillStyle = '#ffd66e';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WARUNG RUSH', CANVAS_W / 2, 165);
  ctx.fillStyle = '#fff8ec';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('Dapur Kilat — masak cepat, sajikan tepat waktu!', CANVAS_W / 2, 212);
  ctx.fillStyle = '#f7e8c9';
  ctx.font = '18px sans-serif';
  var lines = [
    'Ambil bahan di PANTRY, potong di TALENAN (tahan E), masak di KOMPOR,',
    'rakit di MEJA PLATING, lalu antar piring lengkap ke JENDELA SAJIAN.',
    'Sajikan sebelum timer pesanan habis. Kombo naik kalau beruntun tanpa gagal!',
    '',
    'Gerak: WASD / panah, atau klik di lantai.  Aksi: E / Spasi.  Jeda: P.  Restart: R.'
  ];
  for (var i = 0; i < lines.length; i++) ctx.fillText(lines[i], CANVAS_W / 2, 300 + i * 30);
  ctx.fillStyle = '#ffd66e';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('Tekan ENTER atau klik untuk mulai shift 3 menit', CANVAS_W / 2, 540);
  ctx.fillStyle = '#ffe9c4';
  ctx.font = '15px sans-serif';
  ctx.fillText('5 resep warung: Nasi Ayam Goreng, Mie Telur Sayur, Nasi Telur Sambal, Ayam Sayur Tumis, Mie Ayam Pedas', CANVAS_W / 2, 590);
}

function drawPauseScreen(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fff8ec';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('JEDA', CANVAS_W / 2, 330);
  ctx.font = '20px sans-serif';
  ctx.fillText('Tekan P untuk lanjut  •  R untuk mulai ulang shift', CANVAS_W / 2, 380);
}

function drawSummaryScreen(ctx) {
  ctx.fillStyle = '#3d2b1f';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#ffd66e';
  ctx.font = 'bold 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SHIFT SELESAI!', CANVAS_W / 2, 150);
  var stars = starRating();
  ctx.font = '64px sans-serif';
  var starText = '';
  for (var s = 0; s < 3; s++) starText += s < stars ? '★' : '☆';
  ctx.fillText(starText, CANVAS_W / 2, 240);
  ctx.fillStyle = '#fff8ec';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('Hidangan tersaji: ' + WarungState.served, CANVAS_W / 2, 320);
  ctx.fillText('Koin didapat: ' + WarungState.coins, CANVAS_W / 2, 362);
  ctx.fillText('Kombo terbaik: x' + WarungState.bestCombo, CANVAS_W / 2, 404);
  ctx.fillText('Pesanan gagal: ' + WarungState.failed, CANVAS_W / 2, 446);
  ctx.fillStyle = '#ffd66e';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('Tekan R untuk main lagi', CANVAS_W / 2, 530);
}

function renderGame(ctx) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  if (WarungState.screen === 'title') { drawTitleScreen(ctx); return; }
  if (WarungState.screen === 'summary') { drawSummaryScreen(ctx); return; }
  drawOrderBoard(ctx);
  drawKitchenFloor(ctx);
  drawPantry(ctx);
  drawBoard(ctx);
  drawStove(ctx);
  drawServingWindow(ctx);
  drawPlating(ctx);
  drawTrash(ctx);
  drawRecipeMenu(ctx);
  drawPlayer(ctx);
  drawFloaters(ctx);
  drawHintBar(ctx);
  if (WarungState.paused) drawPauseScreen(ctx);
}
