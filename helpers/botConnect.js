/**
 * Helper file to connect bot to system
 */

var util = require("util"),
    fs = require("fs"),
    steam = require("steam"),
    crypto = require("crypto"),
    // Use our extension to node-dota2
    dota2 = require("./spectate").dota2;

// Chatbot constructor
var ChatBot = function(username, password, options) {
  this.options = options || {};

  this.username = username;
  this.password = password;
  this.guardcode = "";

  this.steamClient = new steam.SteamClient();
  this.steamClientConnected = false;

  this.steamUser = new steam.SteamUser(this.steamClient);
  this.steamUserConnected = false;
  this.steamFriends = new steam.SteamFriends(this.steamClient);

  this.dotaClient = new dota2.Dota2Client(this.steamClient, true);
  this.dotaConnected = false;

  this.currentLobby;

  // Store object reference for event handler function scope
  var thisChatBot = this; 

  // Steam event handlers
  this.steamClient.on("connected", function () { thisChatBot._onSteamConnected(); });
  this.steamClient.on("error", function () { thisChatBot._onSteamDisconnected(); });
  this.steamClient.on("logOnResponse", function (logonResp) { thisChatBot._onSteamLoggedOn(logonResp); });
  this.steamClient.on("loggedOff", function () { thisChatBot._onSteamLoggedOff() });

  // Dota 2 event handlers
  this.dotaClient.on("ready", function () { thisChatBot._onDota2Ready(); });
  this.dotaClient.on("unready", function () { thisChatBot._onDota2UnReady(); });
  this.dotaClient.on("spectateFriendGameResp", function () { thisChatBot._onDota2SpectateFriendGameResp(); });
};

// Helper methods
ChatBot.prototype.IsFriendsWith = function (steamId) {
  // Check if the bot is Steam friends with steamId user
  // TODO: Convert the friends object to a map.
  if (this.steamFriends.friends.hasOwnProperty(steamId))
  {
    return true;
  }
  else
  {
    return false;
  }
};

ChatBot.prototype.connectSteam = function() {
  this.steamClient.connect();
};

// Public methods
ChatBot.prototype.connectSteamUser = function () {
  if (this.steamClientConnected && !this.steamUserConnected)
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
  if (this.steamClientConnected && this.steamUserConnected && !this.dotaConnected)
  {
    util.log("Trying to connect chatbot to Dota 2 GC: " + this.username);
    this.dotaClient.launch();
  }
};

ChatBot.prototype.spectateFriendGame = function (steamId) {
  if (this.IsFriendsWith(steamId))
  {
    util.log("Chatbot: " + this.username + " is connecting to " + steamId + "'s game.");
    this.dotaClient.spectateFriendGame(steamId);
  }
};

// Steam Events
ChatBot.prototype._onSteamConnected = function () {
  this.steamClientConnected = true;
  util.log("Connected to Steam Client");
  this.connectSteamUser();
};

ChatBot.prototype._onSteamDisconnected = function () {
  util.log("Disconnected from Steam client.");
  this.steamClientConnected = false;
};

ChatBot.prototype._onSteamLoggedOn = function (logonResp) {
  util.log("Chatbot: " + this.username + " logged on");
  if (logonResp.eresult == steam.EResult.OK) {
    this.steamFriends.setPersonaState(steam.EPersonaState.Busy); // to display your steamClient's status as "Online"
    this.steamFriends.setPersonaName(this.username); // to change its nickname
  }
  this.steamUserConnected = true;
  this.connectDota2();
};

ChatBot.prototype._onSteamLoggedOff = function () {
  util.log("Chatbot: " + this.username + " logged off");
  this.steamUserConnected = false;
};

ChatBot.prototype._onDota2Ready = function () {
  util.log("Chatbot:" + this.username + " connected to Dota 2 GC.");
  this.dotaConnected = true;
  util.log("Node-dota2 ready");
};

ChatBot.prototype._onDota2UnReady = function () {
  util.log("Chatbot:" + this.username + " disconnected from Dota 2 GC.");
  this.dotaConnected = false;
};

ChatBot.prototype._onDota2SpectateFriendGameResp = function (resp) {
  if (resp != null)
    util.log("Chatbot has connected to server: " + resp);
  else
    util.log("Friend is not playing at the moment.");
  this.currentLobby = resp;
};

exports.ChatBot = ChatBot;