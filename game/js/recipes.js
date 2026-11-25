// recipes.js — data bahan dan resep Warung Rush.
// Setiap bahan tahu langkah olahnya (potong / masak / langsung pakai),
// setiap resep tahu komponen jadi apa saja yang harus dirakit di piring.

var INGREDIENTS = {
  nasi:   { id: 'nasi',   name: 'Nasi',   color: '#fff3d6', dark: '#c9a86a', chop: false, cook: true,  cookTime: 4, icon: 'bowl' },
  ayam:   { id: 'ayam',   name: 'Ayam',   color: '#f2b25c', dark: '#a35d1d', chop: true,  cook: true,  cookTime: 7, icon: 'drumstick' },
  telur:  { id: 'telur',  name: 'Telur',  color: '#ffe9a8', dark: '#c98f2e', chop: false, cook: true,  cookTime: 5, icon: 'egg' },
  mie:    { id: 'mie',    name: 'Mie',    color: '#ffd66e', dark: '#b97f1e', chop: false, cook: true,  cookTime: 6, icon: 'noodle' },
  sayur:  { id: 'sayur',  name: 'Sayur',  color: '#7ec850', dark: '#3e7d26', chop: true,  cook: false, cookTime: 0, icon: 'leaf' },
  sambal: { id: 'sambal', name: 'Sambal', color: '#e8442e', dark: '#8f1d10', chop: false, cook: false, cookTime: 0, icon: 'chili' }
};

var INGREDIENT_ORDER = ['nasi', 'ayam', 'telur', 'mie', 'sayur', 'sambal'];

// Keadaan olah sebuah bahan: 'mentah' -> 'potong' -> 'masak'.
// Bahan yang tidak butuh langkah tertentu melewatinya langsung.
function readyStateOf(ingredientId) {
  var ing = INGREDIENTS[ingredientId];
  if (ing.cook) return 'masak';
  if (ing.chop) return 'potong';
  return 'siap';
}

function nextPrepStep(ingredientId, state) {
  var ing = INGREDIENTS[ingredientId];
  if (state === 'mentah' && ing.chop) return 'potong';
  if (state === 'mentah' && ing.cook) return 'masak';
  if (state === 'potong' && ing.cook) return 'masak';
  return 'siap';
}

function stateLabel(state) {
  if (state === 'mentah') return 'mentah';
  if (state === 'potong') return 'dipotong';
  if (state === 'masak') return 'matang';
  return 'siap';
}

var RECIPES = [
  {
    id: 'nasi-ayam',
    name: 'Nasi Ayam Goreng',
    price: 25,
    color: '#f2b25c',
    needs: [
      { ingredient: 'nasi', state: 'masak' },
      { ingredient: 'ayam', state: 'masak' }
    ]
  },
  {
    id: 'mie-telur',
    name: 'Mie Telur Sayur',
    price: 30,
    color: '#ffd66e',
    needs: [
      { ingredient: 'mie', state: 'masak' },
      { ingredient: 'telur', state: 'masak' },
      { ingredient: 'sayur', state: 'potong' }
    ]
  },
  {
    id: 'nasi-telur-sambal',
    name: 'Nasi Telur Sambal',
    price: 28,
    color: '#e8442e',
    needs: [
      { ingredient: 'nasi', state: 'masak' },
      { ingredient: 'telur', state: 'masak' },
      { ingredient: 'sambal', state: 'siap' }
    ]
  },
  {
    id: 'ayam-sayur',
    name: 'Ayam Sayur Tumis',
    price: 32,
    color: '#7ec850',
    needs: [
      { ingredient: 'ayam', state: 'masak' },
      { ingredient: 'sayur', state: 'potong' }
    ]
  },
  {
    id: 'mie-ayam',
    name: 'Mie Ayam Pedas',
    price: 35,
    color: '#ff9d4d',
    needs: [
      { ingredient: 'mie', state: 'masak' },
      { ingredient: 'ayam', state: 'masak' },
      { ingredient: 'sambal', state: 'siap' }
    ]
  }
];

function recipeById(id) {
  for (var i = 0; i < RECIPES.length; i++) {
    if (RECIPES[i].id === id) return RECIPES[i];
  }
  return RECIPES[0];
}

function pickRecipeForDifficulty(difficulty) {
  var pool = RECIPES;
  if (difficulty < 1.3) pool = RECIPES.slice(0, 3);
  else if (difficulty < 1.9) pool = RECIPES.slice(0, 4);
  return pool[Math.floor(Math.random() * pool.length)];
}

function describeNeeds(recipe) {
  var parts = [];
  for (var i = 0; i < recipe.needs.length; i++) {
    var n = recipe.needs[i];
    parts.push(INGREDIENTS[n.ingredient].name + ' ' + stateLabel(n.state));
  }
  return parts.join(' + ');
}

// Versi pendek untuk tiket pesanan yang sempit: hanya nama bahan.
function shortNeeds(recipe) {
  var parts = [];
  for (var i = 0; i < recipe.needs.length; i++) {
    parts.push(INGREDIENTS[recipe.needs[i].ingredient].name);
  }
  return parts.join(' + ');
}
