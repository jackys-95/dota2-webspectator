/**
* Helper file to connect bot to system
*/

var util = require("util"),
    fs = require("fs"),
    steam = require("steam"),
    crypto = require("crypto"),
    dota2 = require("dota2");

// Chatbot constructor
var ChatBot = function(username, password, options) {
  this.options = options || {};

  this.username = username;
  this.password = password;
  this.guardcode = "";

  this.steamClient = new steam.SteamClient();
  this.steamConnected = false;

  this.steamUser = new steam.SteamUser(this.steamClient);
  this.steamFriends = new steam.SteamFriends(this.steamClient);

  this.dotaClient = new dota2.Dota2Client(this.steamClient, true);
  this.dotaConnected = false;

  // Store object reference for event handler function scope
  var thisChatBot = this; 

  // Steam event handlers
  this.steamClient.on("connected", function() { thisChatBot._onSteamConnected(); });
  this.steamClient.on("logOnResponse", function () { thisChatBot._onSteamLoggedOn(); });

  // Dota 2 event handlers
  this.dotaClient.on("ready", function () { thisChatBot._onDota2Ready(); });
};

ChatBot.prototype.connectSteam = function() {
  this.steamClient.connect();
}

// Public methods
ChatBot.prototype.connectSteamUser = function () {
  if (!this.steamConnected)
  {
    util.log("Trying to log in chatbot: " + this.username);
    try 
    {
      this.steamUser.logOn({
        account_name: this.username,
        password: this.password,
        auth_code: this.guardcode
      })
    }
    catch (err)
    {
      util.log("CS LUL: Chatbot " + this.username + "couldn't log in.", err);
    }
  }
};

ChatBot.prototype.connectDota2 = function () {
  if (this.steamConnected && !this.dotaConnected)
  {
    util.log("Trying to connect chatbot to Dota 2 GC: " + this.username);
    this.dotaClient.launch();
  }
};

// Steam Events
ChatBot.prototype._onSteamConnected = function()
{
  util.log("Connecting to Steam Client");
  this.connectSteamUser();
};

ChatBot.prototype._onSteamLoggedOn = function()
{
  util.log("Chatbot: " + this.username + " logged on");
  this.steamConnected = true;
  this.connectDota2();
}

ChatBot.prototype._onDota2Ready = function()
{
  util.log("Chatbot:" + this.username + " connected to Dota 2 GC.");
  this.dotaConnected = true;
  util.log("Node-dota2 ready");
}

exports.ChatBot = ChatBot;