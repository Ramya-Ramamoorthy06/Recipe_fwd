const apiKey = "e5d250f68d9c4587b8dd23d0e6cb96b2"; 

const searchBtn = document.getElementById("searchBtn");
const ingredientInput = document.getElementById("ingredientInput");
const mealType = document.getElementById("mealType");
const viewFavsBtn = document.getElementById("viewFavsBtn");
const resultsContainer = document.getElementById("results");
const modal = document.getElementById("recipeModal");
const modalContent = document.getElementById("modalContent");
const darkModeToggle = document.getElementById("darkModeToggle");

const offlineRecipes = [
  { title: "Tomato Omelette", image: "https://spoonacular.com/recipeImages/631160-312x231.jpg", usedIngredientCount: 2, missedIngredientCount: 0, id: 631160 },
  { title: "Vegetable Fried Rice", image: "https://spoonacular.com/recipeImages/716429-312x231.jpg", usedIngredientCount: 3, missedIngredientCount: 1, id: 716429 },
  { title: "Cheese Sandwich", image: "https://spoonacular.com/recipeImages/660006-312x231.jpg", usedIngredientCount: 2, missedIngredientCount: 0, id: 660006 }
];

searchBtn.addEventListener("click", searchRecipes);
ingredientInput.addEventListener("keydown", e => { if(e.key === "Enter") searchRecipes(); });
viewFavsBtn.addEventListener("click", showFavorites);
darkModeToggle.addEventListener("change", toggleDarkMode);

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

async function searchRecipes() {
  const ingredients = ingredientInput.value.trim();
  if (!ingredients) {
    alert("Please enter ingredients!");
    resultsContainer.innerHTML = "";
    return;
  }

  resultsContainer.innerHTML = '<div class="spinner"></div>';

  try {
    let url = https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=8&apiKey=${apiKey};
    if(mealType.value) url += &type=${mealType.value};

    const res = await fetch(url);
    const data = await res.json();

    if (!data.length) {
      displayOfflineRecipes();
      return;
    }

    displayRecipes(data);
  } catch {
    displayOfflineRecipes();
  }
}

function displayRecipes(recipes) {
  resultsContainer.innerHTML = "";

  recipes.forEach(r => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    card.innerHTML = `
      <img src="${r.image}" alt="${r.title}">
      <h3>${r.title}</h3>
      <p>Used: ${r.usedIngredientCount} | Missed: ${r.missedIngredientCount}</p>
      <div class="btn-container">
        <button class="view-btn">👀 View</button>
        <button class="fav-btn">❤</button>
      </div>
    `;

    card.querySelector(".view-btn").addEventListener("click", () => openRecipeModal(r.id));
    card.querySelector(".fav-btn").addEventListener("click", () => addToFavorites(r));

    resultsContainer.appendChild(card);
  });
}

function displayOfflineRecipes() {
  resultsContainer.innerHTML = <p>No online recipes found. Showing offline recipes:</p>;
  displayRecipes(offlineRecipes);
}

function addToFavorites(recipe) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.find(f => f.id === recipe.id)) {
    favorites.push(recipe);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert(${recipe.title} added to favorites!);
  } else {
    alert(${recipe.title} is already in favorites!);
  }
}

function showFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.length) {
    resultsContainer.innerHTML = <p>No favorites saved yet.</p>;
    return;
  }

  resultsContainer.innerHTML = <p>Your Favorite Recipes:</p>;
  favorites.forEach(r => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    card.innerHTML = `
      <img src="${r.image}" alt="${r.title}">
      <h3>${r.title}</h3>
      <button class="view-btn">👀 View</button>
      <button class="remove-btn">🗑 Remove</button>
    `;

    card.querySelector(".view-btn").addEventListener("click", () => openRecipeModal(r.id));
    card.querySelector(".remove-btn").addEventListener("click", () => removeFavorite(r.id));

    resultsContainer.appendChild(card);
  });
}

function removeFavorite(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(f => f.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  showFavorites();
}

async function openRecipeModal(recipeId) {
  modal.style.display = "flex";
  modalContent.innerHTML = <div class="spinner"></div>;

  try {
    const res = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
    const data = await res.json();

    modalContent.innerHTML = `
      <span class="close-btn">&times;</span>
      <h2>${data.title}</h2>
      <img src="${data.image}" style="width:100%;border-radius:10px;">
      <h3>Ingredients:</h3>
      <ul>${data.extendedIngredients.map(i => `<li>${i.original}</li>`).join("")}</ul>
      <h3>Instructions:</h3>
      <p>${data.instructions || "No instructions available."}</p>
      <a href="${data.sourceUrl}" target="_blank" class="view-btn">View Full Recipe</a>
    `;
    document.querySelector(".close-btn").addEventListener("click", closeModal);
  } catch {
    modalContent.innerHTML = <p>Failed to load recipe details.</p>;
  }
}

function closeModal() {
  modal.style.display = "none";
}
window.addEventListener("click", e => { if (e.target === modal) closeModal(); });
