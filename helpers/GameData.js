/**
 * Used to gather live game data
 */

var util = require('util');

/**
 * Gets the live match data for someone
 */
var GetLiveGameData = function (bot, steamId)
{
  var lobbyIds = [];

  // Check if the bot is connected to Steam Client.
  // and logged into Steam, and connected to Dota 2 GC
  if (!bot.steamClientConnected && !bot.steamUserConnected && !bot.dotaConnected)
    return;

  // Grab lobby data
  bot.spectateFriendGame(steamId);

  // handle synchronization
  util.log("curr lobby" + bot.currentLobby);

  // Grab live game data from lobby

  return lobbyIds;
};

exports.GetLiveGameData = GetLiveGameData;