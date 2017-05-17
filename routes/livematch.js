var express = require('express'),
    util = require('util'),
    gameData = require('../helpers/GameData'),
    router = express.Router()

router.get('/:steamId', function (req, res, next) {
  // Grab the main bot from the server
  var bot = app.get('currentBot');

  // Generate links by passing lobby ids into Jade templating
  gameData.GetLiveGameData(bot, req.params.steamId);
  app.get('emitter').on('CompletedGatheringLiveData', function(resp)
  {
    res.send('The lobby ids are: ' + resp.toString());
  });
  app.get('emitter').on('GatherLiveDataBadRequest', function () {
    res.send('Try again');
  });
})

module.exports = router;