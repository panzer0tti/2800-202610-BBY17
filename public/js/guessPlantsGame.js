const express = require("express");
const { ObjectId } = require("mongodb");

const { sendErrorMessage } = require("./authentication");
const { database } = require("./mongoDBConnection");

const router = express.Router();

const mongodbDatabase = process.env.MONGODB_DATABASE;
const plantNameCollection = database
  .db(mongodbDatabase)
  .collection("plant_names");
const plantInfoCollection = database
  .db(mongodbDatabase)
  .collection("plant_info");

async function getPlantInfo(plantId) {
  const objectIdResult = await plantInfoCollection.findOne({
    plantId: plantId,
  });

  if (objectIdResult) {
    return objectIdResult;
  }

  return plantInfoCollection.findOne({
    plantId: plantId.toString(),
  });
}

async function getRandomPlant(req) {
  if (!req.session.usedPlants) {
    req.session.usedPlants = [];
  }

  const total = await plantNameCollection.estimatedDocumentCount();

  if (total === 0) {
    throw new Error("No plants exist in plant_names collection.");
  }

  if (req.session.usedPlants.length >= total) {
    req.session.usedPlants = [];
  }

  let plant = null;

  for (let attempts = 0; attempts < 10; attempts++) {
    const random = Math.floor(Math.random() * total);
    const candidate = await plantNameCollection.findOne({}, { skip: random });

    if (
      candidate &&
      !req.session.usedPlants.includes(candidate._id.toString())
    ) {
      plant = candidate;
      break;
    }
  }

  if (!plant) {
    const random = Math.floor(Math.random() * total);
    plant = await plantNameCollection.findOne({}, { skip: random });
  }

  req.session.usedPlants.push(plant._id.toString());
  return plant;
}

async function buildPlantObject(plantName) {
  const plantInfo = await getPlantInfo(plantName._id);

  return {
    ...plantName,
    ...(plantInfo || {}),
  };
}

router.get("/", async (req, res) => {
  if (!req.session.usedPlants) {
    req.session.usedPlants = [];
  }

  try {
    const plantName = await getRandomPlant(req);
    const plant = await buildPlantObject(plantName);

    req.session.currentPlantId = plantName._id.toString();
    req.session.correctPlant = plantName.commonName;

    res.render("guessPlant", {
      title: "Guess The Plant",
      user: req.session.authenticated,
      cssFiles: ["games.css"],
      plant,
      result: null,
    });
  } catch (error) {
    console.error(error);

    sendErrorMessage(
      req,
      res,
      "Error - Failed Quiz Loading",
      ["Loading quiz failed."],
      "/plant-game",
      "Games"
    );
  }
});

router.post("/guess", async (req, res) => {
  if (!req.session.usedPlants) {
    req.session.usedPlants = [];
  }

  try {
    const userGuess = (req.body.userGuess || "").trim().toLowerCase();
    const correctAnswer = (req.session.correctPlant || "").toLowerCase();

    let result = "";

    if (userGuess === correctAnswer) {
      result = "Correct!";
    } else {
      result = `Wrong! The correct answer was "${req.session.correctPlant}".`;
    }

    const plantId = new ObjectId(req.session.currentPlantId);
    const plantName = await plantNameCollection.findOne({ _id: plantId });
    const plant = await buildPlantObject(plantName);

    res.render("guessPlant", {
      title: "Guess The Plant",
      user: req.session.authenticated,
      cssFiles: ["games.css"],
      plant,
      result,
    });
  } catch (error) {
    console.error(error);

    sendErrorMessage(
      req,
      res,
      "Error - Failed Quiz Check",
      ["Failed to check your guess."],
      "/plant-game",
      "Games"
    );
  }
});

router.get("/next", async (req, res) => {
  try {
    const plantName = await getRandomPlant(req);
    const plant = await buildPlantObject(plantName);

    req.session.currentPlantId = plantName._id.toString();
    req.session.correctPlant = plantName.commonName;

    res.render("guessPlant", {
      title: "Guess The Plant",
      user: req.session.authenticated,
      cssFiles: ["games.css"],
      plant,
      result: null,
    });
  } catch (error) {
    console.error(error);

    sendErrorMessage(
      req,
      res,
      "Error - Failed Next Question",
      ["Failed to load the next question."],
      "/plant-game",
      "Games"
    );
  }
});

module.exports = router;
