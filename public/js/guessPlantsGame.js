const express = require("express");
<<<<<<< HEAD
const router = express.Router();

const PlantName = require("./plantName");
const PlantInfo = require("./plantInfo");
const {sendErrorMessage} = require("./authentication")
=======
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
>>>>>>> sal_welcomepage_EJS_JS_CSS

async function getRandomPlant(req) {
  if (!req.session.usedPlants) {
    req.session.usedPlants = [];
  }

<<<<<<< HEAD
  const total = await PlantName.estimatedDocumentCount();
=======
  const total = await plantNameCollection.estimatedDocumentCount();

  if (total === 0) {
    throw new Error("No plants exist in plant_names collection.");
  }
>>>>>>> sal_welcomepage_EJS_JS_CSS

  if (req.session.usedPlants.length >= total) {
    req.session.usedPlants = [];
  }

  let plant = null;

<<<<<<< HEAD
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

/* Start Plant Quiz */
router.get("/", async (req, res) => {
  /* Initializate session's plant storage */
=======
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
>>>>>>> sal_welcomepage_EJS_JS_CSS
  if (!req.session.usedPlants) {
    req.session.usedPlants = [];
  }

  try {
    const plantName = await getRandomPlant(req);
<<<<<<< HEAD

    // Find matching Plant's ID in plant_info
    const plantInfo = await PlantInfo.findOne({
      plantId: plantName._id,
    });

    // Combine both plantName and plantInfo to get plant in Object form
    const plant = {
      ...(plantName ? plantName.toObject() : {}),
      ...(plantInfo ? plantInfo.toObject() : {}),
    };

    console.log("plant: ", plant);

    req.session.currentPlantById = plantName._id.toString();
=======
    const plant = await buildPlantObject(plantName);

    req.session.currentPlantId = plantName._id.toString();
>>>>>>> sal_welcomepage_EJS_JS_CSS
    req.session.correctPlant = plantName.commonName;

    res.render("guessPlant", {
      title: "Guess The Plant",
      user: req.session.authenticated,
      cssFiles: ["games.css"],
<<<<<<< HEAD
      plant: plant,
      result: null
    });
  } catch (err) {
    console.error(err);
    sendErrorMessage(req, res, "Error - Failed Quiz Loading", ["Loading Quiz Failed"], "/plant-game", "Games");
  }
});

// Check User's Guess
router.post("/guess", async (req, res) => {
  /* Initializate session's plant storage */
=======
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
>>>>>>> sal_welcomepage_EJS_JS_CSS
  if (!req.session.usedPlants) {
    req.session.usedPlants = [];
  }

  try {
<<<<<<< HEAD
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

=======
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
>>>>>>> sal_welcomepage_EJS_JS_CSS
    req.session.correctPlant = plantName.commonName;

    res.render("guessPlant", {
      title: "Guess The Plant",
      user: req.session.authenticated,
      cssFiles: ["games.css"],
<<<<<<< HEAD
      plant: plant,
      result: result
    });
  } catch (err) {
    console.error(err);
    sendErrorMessage(req, res, "Error - Failed Quiz Check", ["Failed User Guess Check"], "/plant-game", "Games");
  }
});

/* Next Question Route */
router.get("/next", async (req, res) => {
  const plantName = await getRandomPlant(req);

  const plantInfo = await PlantInfo.findOne({
    plantId: plantName._id.toString(),
  });

  const plant = {
    ...plantName.toObject(),
    ...(plantInfo ? plantInfo.toObject() : {}),
  };

  req.session.currentPlantId = plantName._id.toString();
  req.session.correctPlant = plantName.commonName;

  res.render("guessPlant", {
    title: "Guess The Plant",
    user: req.session.authenticated,
    cssFiles: ["games.css"],
    plant: plant,
    result: null
  });
});

=======
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

>>>>>>> sal_welcomepage_EJS_JS_CSS
module.exports = router;
