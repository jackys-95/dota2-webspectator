var express = require('express')
    livematch = require('./routes/livematch'),
    steam = require('steam'),
    ChatBot = require('./helpers/botConnect').ChatBot,
    app = express()

// Load config
var config = require("./config.js");
global.bots = [];

// Connect to our bot
bots.push(new ChatBot(config.steam_user, config.steam_pass));
bots[0].connectSteam();

app.get("/", function (req, res) {
  res.send('Hello World');
});

app.use('/livematch', livematch);

app.listen(3000, function () {
  console.log('Example app listening on port 3000.');
});
