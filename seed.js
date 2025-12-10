//populate mongodb with the movie food and recipe pairs
const mongoose = require("mongoose");
const { connectToDB, MovieMapping } = require("./database");

//enter recipes into here
const initialData = [
    { title: "Ratatouille", food: "Ratatouille", cuisineTag: "French" },
    { title: "Pulp Fiction", food: "Chocolate Caramel Crispy", cuisineTag: "Dessert" },
    { title: "Harry Potter", food: "Toad In The Hole", cuisineTag: "British" },
    { title: "The Matrix", food: "Lamb Biryani", cuisineTag: "Indian" },
    { title: "Chocolat", food: "Chocolate Gateau", cuisineTag: "Dessert" },
    { title: "Spirited Away", food: "Beef pho", cuisineTag: "Vietnamese" },
    { title: "Howl's Moving Castle", food: "Boxty Breakfast", cuisineTag: "Irish"},
    { title: "The Godfather", food: "Lasagne", cuisineTag: "Italian"},
    { title: "Forrest Gump", food: "Shrimp Chow Fun", cuisineTag: "Chinese"},
    { title: "Home Alone", food: "Cheese Borek", cuisineTag: "Turkish"},
    { title: "The Eat Pray Love", food: "Pizza Express Margherita", cuisineTag: "Italian"},
];

async function seedData() {
    try {
        await connectToDB();
        
        console.log("Starting data population...");
        
        //Use deleteMany to clear existing data before populating
        await MovieMapping.deleteMany({});
        console.log("Cleared existing movie mappings.");

        //Insert new data
        await MovieMapping.insertMany(initialData);
        console.log(`Successfully inserted ${initialData.length} new movie mappings.`);

    } catch (error) {
        console.error("Error during population:", error);
    } finally {
        //close connection
        if (mongoose.connection.readyState !== 0) {
            mongoose.connection.close(); 
        }
    }
}

seedData();