var express = require('express'),
    util = require('util'),
    gameData = require('../helpers/GameData'),
    router = express.Router();

router.get('/:steamId', function (req, res, next) {
  // Grab the main bot from the server
  var bot = app.get('currentBot');

  // Generate links by passing lobby ids into Jade templating
  gameData.CreateLiveGameDataRequest(bot, req.params.steamId, res);

  // It should wait for the LiveGameDataRequest to be processed before returning.
});

module.exports = router;