const express = require("express");
const router = express.Router();

const guessPlantsGame = require("./guessPlantsGame.js");

// Render the main games dashboard with the user's current level and experience progress
router.get("/", (req, res) => {
  const player = {
    level: 12,
    currentExp: 1200,
    expToNextLevel: 1500,
  };

  const xpPercentage = (player.currentExp / player.expToNextLevel) * 100;

  const remainingXP = player.expToNextLevel - player.currentExp;

  res.render("games", {
    title: "Plant Games",
    user: req.session.authenticated,
    cssFiles: ["games.css"],
    player: player,
    xpPercentage: xpPercentage,
    remainingXP: remainingXP,
    matches: []
  });
});

router.use("/guess-plants", guessPlantsGame);

module.exports = router;
