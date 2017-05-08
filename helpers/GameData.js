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

  // Check if the bot is Steam friends with steamId user
  // TODO: Convert the friends object to a map.
  if (!bot.steamFriends.friends.hasOwnProperty(steamId))
    util.log("Bot is not friends with SteamId: " + steamId);
  else
    util.log("Bot is friends with SteamId: " + steamId);

  // Grab lobby protobuf

  // Grab live game data protobuf

  return lobbyIds;
};

exports.GetLiveGameData = GetLiveGameData;