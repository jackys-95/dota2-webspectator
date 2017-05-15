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
  this.steamGuardCode = options.steamGuardCode;
  this.sha_sentryfile = this.loadSentryFile();

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
  this.steamClient.on("error", function (error) { thisChatBot._onSteamError(error); });
  this.steamClient.on("logOnResponse", function (logonResp) { thisChatBot._onSteamLoggedOn(logonResp); });
  this.steamClient.on("loggedOff", function () { thisChatBot._onSteamLoggedOff(); });

  // Steam user event handlers
  this.steamUser.on('updateMachineAuth', function(sentry, callback) { thisChatBot._onUpdateMachineAuth(sentry, callback); });

  // Dota 2 event handlers
  this.dotaClient.on("ready", function () { thisChatBot._onDota2Ready(); });
  this.dotaClient.on("unready", function () { thisChatBot._onDota2UnReady(); });
  this.dotaClient.on("spectateFriendGameResp", function (resp) { thisChatBot._onDota2SpectateFriendGameResp(resp); });
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

ChatBot.prototype.connectSteam = function () {
  this.steamClient.connect();
};

ChatBot.prototype.loadSentryFile = function () {
  try {
    var sentry = fs.readFileSync('sentry');
    if (sentry.length) return sentry;
  } catch (beef) {
    util.log("Cannae load the sentry. " + beef);
  }
}

// Public methods
ChatBot.prototype.connectSteamUser = function () {
  if (this.steamClientConnected && !this.steamUserConnected)
  {
    util.log("Trying to log in chatbot: " + this.username);
    util.log("SteamGuard: " + this.steamGuardCode);
    try 
    {
      this.steamUser.logOn({
        account_name: this.username,
        password: this.password,
        auth_code: this.steamGuardCode,
        sha_sentryfile: this.sha_sentryfile
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

ChatBot.prototype._onSteamError = function (error) {
  if (error != null)
  {
    util.log("Steam Client connection closed by server.");
  }
  else
  {
    util.log("Disconnected from Steam client.");
  }

  this.steamClientConnected = false;

  // Don't do this continuously otherwise it will lock accounts.
  // TODO: Setup a reconnection interval parameter
  // this.connectSteam();
};

ChatBot.prototype._onSteamLoggedOn = function (logonResp) {
  if (logonResp.eresult == steam.EResult.OK) {
    util.log("Chatbot: " + this.username + " logged on");
    this.steamFriends.setPersonaState(steam.EPersonaState.Busy); // to display your steamClient's status as "Online"
    this.steamFriends.setPersonaName(this.username); // to change its nickname
    this.steamUserConnected = true;
    this.connectDota2();
  }
  else
  {
    // TODO: Add a error code number to error message object.
    util.log("Error Code: " + logonResp.eresult);
  }
};

// Used to store information about successful SteamGuard logins.
// i.e. subsequent Steam logins from our server no longer need SteamGuard codes.
// TODO: When scaling, add username prefixes to sentry file.
ChatBot.prototype._onUpdateMachineAuth = function(sentry, callback) {
    var hashedSentry = crypto.createHash('sha1').update(sentry.bytes).digest();
    fs.writeFileSync('sentry', hashedSentry)
    util.log("sentryfile saved");
    callback({
        sha_file: hashedSentry
    });
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
  if (resp != 0)
    util.log("Chatbot has connected to server: " + resp);
  else
    util.log("Friend is not playing at the moment.");
  this.currentLobby = resp;
};

exports.ChatBot = ChatBot;