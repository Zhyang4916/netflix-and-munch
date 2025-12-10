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
        title: {$regex: new RegExp(`^${movieTitle}$`, 'i')}
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

    let formattedInstructions = meal.strInstructions;
    if (formattedInstructions) {
        formattedInstructions = formattedInstructions.replace(/\r\n/g, '\n');
        const instructionSteps = formattedInstructions.split('\n').filter(step => step.trim() !== '');
        formattedInstructions = instructionSteps.map((step, index) => 
            `${index + 1}. ${step.trim()}`
        ).join('\n\n');
    }

    res.json({
        movie: movieMapping.title,
        foodName: meal.strMeal,
        image: meal.strMealThumb,
        cuisine: meal.strArea,
        cuisineTag: meal.strCategory,
        instructions: formattedInstructions,
        ingredients
    });
}));

app.get("/api/all-recipes", asyncHandler(async (req, res) => {
    const movies = await MovieMapping.find();

    // Create a list of promises for concurrent API calls
    const fetchPromises = movies.map(movie => {
        const apiURL = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(movie.food)}`;
        return axios.get(apiURL);
    });

    // Wait for all promises to resolve in parallel
    const apiResponses = await Promise.all(fetchPromises);

    const results = apiResponses.map((response, index) => {
        const data = response.data;
        const movie = movies[index];
        
        if (!data.meals) return null; 

        const meal = data.meals[0];

        return {
            movie: movie.title,
            foodName: meal.strMeal,
            image: meal.strMealThumb,
            cuisine: meal.strArea,
            cuisineTag: meal.strCategory
        };
    }).filter(result => result !== null);

    res.json(results);
}));


async function start() {
    await connectToDB();
    const port = process.env.PORT || 3000;

    return app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}
start();