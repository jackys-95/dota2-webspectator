var express = require('express'),
    util = require('util'),
    gameData = require('../helpers/GameData'),
    router = express.Router()

router.get('/:steamId', function (req, res) {
  // Grab the main bot from the server
  var bot = app.get('currentBot');

  // Generate links by passing lobby ids into Jade templating
  var lobbyIds = gameData.GetLiveGameData(bot, req.params.steamId);

  res.send("Your Steam ID is: " + req.params.steamId);
})

module.exports = router;