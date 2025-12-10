const express = require("express");
const asyncHandler = require("express-async-handler");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require('axios');
const path = require('path');
const { connectToDB, MovieMapping } = require("./database");
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'netflix-and-munch', 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'netflix-and-munch', 'public', 'ui.html'));
});

app.get("/api/recipe", asyncHandler(async (req, res) => {

    const movieTitle = req.query.movie;
    if (!movieTitle) {
        return res.status(400).json({ message: 'Please enter a movie title'});
    }
    
    const movieMapping = await MovieMapping.findOne({
        title: {$regex: new RegExp(`^${movieTitle}$`, 'i'
        )}
    });

    if (!movieMapping) {
        return res.status(404).json({
            message: `No recipe for "${movieTitle}" yet, try something else?` 
        });
    }

    const foodName = movieMapping.food;
    const recipeDbUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(foodName)}`;
    const apiResponse = await axios.get(recipeDbUrl);
    const data = apiResponse.data;
    if (!data.meals || data.meals.length === 0) {
        return res.status(404).json({
            message: `MealDB has no recipe for "${foodName}".`
        });
    }

    const meal = data.meals[0];

    //get ingredients
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
            ingredients.push(`${ingredient} — ${measure}`);
        }
    }
    res.json({
        movie: movieMapping.title,
        foodName: meal.strMeal,
        image: meal.strMealThumb,
        cuisine: meal.strArea,
        cuisineTag: meal.strCategory,
        instructions: meal.strInstructions,
        ingredients
    });
}));

app.get("/api/all-recipes", asyncHandler(async (req, res) => {
    const movies = await MovieMapping.find();
    const results = [];

    for (const movie of movies) {
        const apiURL = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(movie.food)}`;
        const apiResponse = await axios.get(apiURL);
        const data = apiResponse.data;

        if (!data.meals) continue;

        const meal = data.meals[0];

        results.push({
            movie: movie.title,
            foodName: meal.strMeal,
            image: meal.strMealThumb,
            cuisine: meal.strArea,
            cuisineTag: meal.strCategory
        });
    }

    res.json(results);
}));


async function start() {
    await connectToDB();
    return app.listen(3000, () => {
        console.log("Listening on port 3000");
    });
}

if (require.main === module) {
    start();
}

