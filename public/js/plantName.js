const mongoose = require('mongoose');

// Define the schema for storing standard common names of plants
const plantNameSchema = new mongoose.Schema({
  commonName: {
    type: String,
    required: true,
  },
});

// Export the PlantName model bound to the plant_names collection
module.exports = mongoose.model('PlantName', plantNameSchema, 'plant_names');
