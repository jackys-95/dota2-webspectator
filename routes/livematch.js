var express = require('express'),
    router = express.Router()

router.get('/:steamId', function (req, res) {
  // Todo: Programatically check the status of our Steam and Dota 2 GC connections

  var message = "";
  if (bots.length != 0)
  {
    message = "Chatbot is ready.";
  }
  else
  {
    message = "Chatbot is not ready.";
  }

  res.send(message + "Your Steam ID is: " + req.params.steamId);
})

module.exports = router;