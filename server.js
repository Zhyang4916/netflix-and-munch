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
    const recipeDbUrl = 'N/A';
    // WIP

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

