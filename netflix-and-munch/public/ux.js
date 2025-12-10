document.addEventListener('DOMContentLoaded', ()=> {
    const homepage = document.getElementById('homepage-main');
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('movie-search');
    const resultsContainer = document.getElementById('recipe-results');
    const searchView = document.getElementById('search');
    const resultsView = document.getElementById('results');
    const findRecipeButton = document.getElementById('find-recipe-button');
    const navFindRecipe = document.getElementById('nav-find-recipe');
    const allRecipesView = document.getElementById("all-recipes");
    const aboutUsView = document.getElementById("about-us");
    const titleHome = document.getElementById("title");
    const navAllRecipes = document.getElementById("nav-all-recipes");
    const navAboutUs = document.getElementById("nav-about-us");
    const allRecipesButton = document.getElementById("all-recipes-button");
    const aboutUsButton = document.getElementById("about-us-button");
    const mainHeader = document.getElementById('main-header');


    function showView(viewElement) {
        homepage.classList.add('hidden');
        searchView.classList.add('hidden');
        resultsView.classList.add('hidden');
        allRecipesView.classList.add('hidden');
        aboutUsView.classList.add('hidden');

        if (viewElement === homepage) {
            mainHeader.classList.add('hidden');
        } else {
            mainHeader.classList.remove('hidden');
        }
        
        viewElement.classList.remove('hidden');
    }

    findRecipeButton.addEventListener('click', () => {
        showView(searchView);
    });

    navFindRecipe.addEventListener('click', (e) => {
        e.preventDefault();
        showView(searchView);
    });

    async function fetchRecipe(title) {
        try {
            // Your API endpoint is /api/recipe?movie=...
            const response = await fetch(`/api/recipe?movie=${encodeURIComponent(title)}`);

            if (!response.ok) {
                // Handle 404/400 errors from your server
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch recipe.');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching recipe:", error);
            // Return an object with an error message so the handler can display it
            return { error: error.message }; 
        }
    }

// backend search handler WIP
    async function handleSearch() {
        const movieTitle = searchInput.value.trim();
        if (!movieTitle) {
            alert("Please enter a movie title.");
            return;
        }

        // show loading state?

        const recipeData = await fetchRecipe(movieTitle);

        if (recipeData.error) {
            resultsContainer.innerHTML = `<p class="error-message">Error: ${recipeData.error}</p>`;
        } else {
            renderRecipe(recipeData);
        }
        showView(resultsView); 
    }
    
    function renderRecipe(recipe) {
        const ingredientsList = recipe.ingredients.map(ing => `<li>${ing}</li>`).join('');
        
        resultsContainer.innerHTML = `
            <div class="recipe-detail">
                <h2>${recipe.foodName} (from ${recipe.movie})</h2>
                <img src="${recipe.image}" alt="${recipe.foodName}" class="recipe-image">
                <p class="recipe-cuisine">Cuisine: ${recipe.cuisine} (${recipe.cuisineTag})</p>
                
                <h3>Ingredients:</h3>
                <ul>${ingredientsList}</ul>

                <h3>Instructions:</h3>
                <p>${recipe.instructions}</p>
            </div>
        `;
    }
    searchButton.addEventListener('click', handleSearch);
/*event listeners for navigation bar */
    titleHome.addEventListener('click', () => {
        showView(homepage);
    });
    navFindRecipe.addEventListener('click', (event) => {
        event.preventDefault();
        showView(searchView);
    });
    navAllRecipes.addEventListener('click', (event) => {
        event.preventDefault();
        showView(allRecipesView);
        loadAllRecipesView();
    });
    navAboutUs.addEventListener('click', (event) => {
        showView(aboutUsView);
    });

/*event listeners for homepage black buttons */
    allRecipesButton.addEventListener("click", () => {
        showView(allRecipesView);
        loadAllRecipesView();
    });
    findRecipeButton.addEventListener("click", () => {
        showView(searchView);
    });
    aboutUsButton.addEventListener("click", () => {
        showView(aboutUsView);
    });

/*fetch the api */
fetch("/api/all-recipes")
fetch(`/api/recipe?movie=${encodeURIComponent(title)}`)

async function loadAllRecipesView() {
    const allRecipesContainer = document.getElementById('all-recipes-container');
    allRecipesContainer.innerHTML = '<h2>Loading recipes...</h2>';

    try {
        //Calls the server.js route for all recipes
        const response = await fetch('/api/all-recipes');
        if (!response.ok) throw new Error('Failed to load all recipes.');

        const recipes = await response.json(); 
        if (recipes.length === 0) {
            allRecipesContainer.innerHTML = '<p>No recipes has been added to the database yet :( </p>';
            return;
        }

        allRecipesContainer.innerHTML = '<h3>Available Movie Food Pairings:</h3>';
        const grid = document.createElement('div');
        grid.className = 'recipe-grid';
        
        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-all-card';
            card.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.foodName}" style="width:100%; height:150px; object-fit:cover; border-radius: 8px;">
                <h4>${recipe.movie}</h4>
                <p>(${recipe.foodName})</p>
                <button class="view-recipe-btn" data-movie="${recipe.movie}">View Recipe</button>
            `;
            grid.appendChild(card);
        });
        allRecipesContainer.appendChild(grid);

        //Attach event listener to grid for clicks
        grid.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-recipe-btn')) {
                const movie = e.target.getAttribute('data-movie');
                document.getElementById('movie-search').value = movie; 
                handleSearch(); 
            }
        });

    } catch (error) {
        allRecipesContainer.innerHTML = `<p class="error-message">Could not load recipes: ${error.message}</p>`;
    }
}

showView(homepage);

});
