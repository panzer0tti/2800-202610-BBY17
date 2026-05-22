const express = require("express");
const router = express.Router();

const PlantName = require("./plantName");
const PlantInfo = require("./plantInfo");
const {sendErrorMessage} = require("./authentication")

// Retrieve a random plant from the database that hasn't been used in the current session
async function getRandomPlant(req) {
  if (!req.session.usedPlants) {
    req.session.usedPlants = [];
  }

  const total = await PlantName.estimatedDocumentCount();

  if (req.session.usedPlants.length >= total) {
    req.session.usedPlants = [];
  }

  let plant = null;

  let attempts = 0;
  for (let i = 0; i < 10; i++) {
    const random = Math.floor(Math.random() * total);

    const candidate = await PlantName.findOne().skip(random);

    if (!req.session.usedPlants.includes(candidate._id.toString())) {
      plant = candidate;
      break;
    }

    attempts++;
  }

  if (!plant) {
    plant = await PlantName.findOne().skip(Math.floor(Math.random() * total));
  }

  req.session.usedPlants.push(plant._id.toString());

  return plant;
}

// Initialize the plant quiz session and render the first question
router.get("/", async (req, res) => {
  if (!req.session.usedPlants) {
    req.session.usedPlants = [];
  }

  try {
    const plantName = await getRandomPlant(req);

    const plantInfo = await PlantInfo.findOne({
      plantId: plantName._id,
    });

    const plant = {
      ...(plantName ? plantName.toObject() : {}),
      ...(plantInfo ? plantInfo.toObject() : {}),
    };

    console.log("plant: ", plant);

    req.session.currentPlantById = plantName._id.toString();
    req.session.correctPlant = plantName.commonName;

    res.render("guessPlant", {
      title: "Guess The Plant",
      user: req.session.authenticated,
      cssFiles: ["games.css"],
      plant: plant,
      result: null
    });
  } catch (err) {
    console.error(err);
    sendErrorMessage(req, res, "Error - Failed Quiz Loading", ["Loading Quiz Failed"], "/plant-game", "Games");
  }
});

// Evaluate the user's guess against the correct plant name and render the result
router.post("/guess", async (req, res) => {
  if (!req.session.usedPlants) {
    req.session.usedPlants = [];
  }

  try {
    const userGuess = req.body.userGuess.trim().toLowerCase();
    const correctAnswer = req.session.correctPlant.toLowerCase();

    let result = "";

    if (userGuess == correctAnswer) {
      result = "Correct!";
    } else {
      result = `Wrong! The correct answer was "${req.session.correctPlant}"`;
    }

    const plantName = await PlantName.findById(req.session.currentPlantById);

    const plantInfo = await PlantInfo.findOne({
      plantId: plantName._id,
    });

    const plant = {
      ...(plantName ? plantName.toObject() : {}),
      ...(plantInfo ? plantInfo.toObject() : {}),
    };

    console.log("plant: ", plant);

    req.session.correctPlant = plantName.commonName;

    res.render("guessPlant", {
      title: "Guess The Plant",
      user: req.session.authenticated,
      cssFiles: ["games.css"],
      plant: plant,
      result: result
    });
  } catch (err) {
    console.error(err);
    sendErrorMessage(req, res, "Error - Failed Quiz Check", ["Failed User Guess Check"], "/plant-game", "Games");
  }
});

// Fetch a new random plant and render the next question in the quiz sequence
router.get("/next", async (req, res) => {
  try {
    const plantName = await getRandomPlant(req);

    const plantInfo = await PlantInfo.findOne({
      plantId: plantName._id, 
    });

    const plant = {
      ...(plantName ? plantName.toObject() : {}),
      ...(plantInfo ? plantInfo.toObject() : {}),
    };

    req.session.currentPlantById = plantName._id.toString();
    req.session.correctPlant = plantName.commonName;

    res.render("guessPlant", {
      title: "Guess The Plant",
      user: req.session.authenticated,
      cssFiles: ["games.css"],
      plant: plant,
      result: null
    });
  } catch (err) {
    console.error(err);
    sendErrorMessage(req, res, "Error - Failed Loading Next Question", ["Loading Next Question Failed"], "/plant-game", "Games");
  }
});

module.exports = router;
