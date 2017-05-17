var express = require('express')
    livematch = require('./routes/livematch'),
    steam = require('steam'),
    ChatBot = require('./helpers/botConnect').ChatBot,
    require('dotenv').config(),
    util = require('util'),
    app = express();

const EventEmitter = require('events');

// Load config
var config = require("./config.js");
var bots = [];

class MyEmitter extends EventEmitter {}

// Application event emitter.
const emitter = new MyEmitter();
app.set('emitter', emitter);

// Connect to our bot
var options = { steamGuardCode: config.steam_guard_code };
bots.push(new ChatBot(config.steam_user, config.steam_pass, options));
var bot = bots[0];
app.set('currentBot', bot);

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
  console.log('Project-Peter listening on port 3000.');
});
