const express = require("express");
const router = express.Router();

/* Define routes to game pages here */

// Game's Main Page
router.get("/", (req, res) => {
  const player = {
    level: 12,
    currentXP: 1200,
    xpForNextLevel: 1500,
  };

  const xpPercentage = (player.currentXP / player.xpForNextLevel) * 100;

  const remainingXP = player.xpForNextLevel - player.currentXP;

  res.render("games", {
    title: "Plant Games",
    user: req.session.authenticated,
    cssFiles: ["games.css"],
    player,
    xpPercentage,
    remainingXP,
    matches: [],
  });
});

// Plant Quiz Game Route
const guessPlantsGame = require("./guessPlantsGame.js");
router.use("/guess-plants", guessPlantsGame);

// Ranked Match Game Route

module.exports = router;
