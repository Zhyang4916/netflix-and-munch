const mongoose = require("mongoose");
const dbConnectionUrl = "mongodb+srv://zhyang29_db_user:cm1THdB8xaxdonmi@cluster0.wn70eyo.mongodb.net/";
const dbName = "netflix-munch-db";
const movieMappingSchema = new mongoose.Schema({
    title: { type: String, required: true},
    iconicFood: { type: String, required: true },
    cuisineTag: String,
});

const MovieMapping = mongoose.model("MovieMapping", movieMappingSchema);
async function connectToDB() {
    await mongoose.connect(dbConnectionUrl, { dbName });
    console.log("Successfully connected to MongoDB");
}
module.exports = {
    connectToDB, MovieMapping
};