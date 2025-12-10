//populate mongodb with the movie food and recipe pairs
const mongoose = require("mongoose");
const { connectToDB, MovieMapping } = require("./database");

const initialData = [
    { title: "Ratatouille", food: "Ratatouille", cuisineTag: "French" },
    { title: "Pulp Fiction", food: "Milkshake", cuisineTag: "American" },
    { title: "Harry Potter", food: "Butterbeer", cuisineTag: "Drink" },
    { title: "The Matrix", food: "Beef Stew", cuisineTag: "American" },
    { title: "Chocolat", food: "Chocolate Cake", cuisineTag: "Dessert" },
    { title: "Spirited Away", food: "Ramen", cuisineTag: "Japanese" }
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