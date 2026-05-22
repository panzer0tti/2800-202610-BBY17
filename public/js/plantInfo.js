const mongoose = require("mongoose");

// Define the schema for static plant knowledge and identification clues
const plantInfoSchema = new mongoose.Schema({
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  scientificName: String,

  family: String,

  clues: [String],

  imageUrl: String,

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy",
  },
});

// Export the PlantInfo model bound to the plant_info collection
module.exports = mongoose.model("PlantInfo", plantInfoSchema, "plant_info");
