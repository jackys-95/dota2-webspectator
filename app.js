var express = require('express')
    livematch = require('./routes/livematch'),
    steam = require('steam'),
    ChatBot = require('./helpers/botConnect').ChatBot,
    app = express()

// Load config
var config = require("./config.js");
var bots = [];

// Connect to our bot
bots.push(new ChatBot(config.steam_user, config.steam_pass));
var bot = bots[0];
bot.connectSteam();

app.get("/", function (req, res) {
  var message = "";

  if (bot.steamConnected && bot.dotaConnected)
  {
    message = "Chatbot is ready.";
  }
  else
  {
    message = "Chatbot is not ready.";
    // TODO: Re-connect the bot.
  }

  res.send(message);
});

app.use('/livematch', livematch);

app.listen(3000, function () {
  console.log('Example app listening on port 3000.');
});
