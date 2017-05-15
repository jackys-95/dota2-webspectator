/**
 * Used to gather live game data (work-in-progress)
 */

var util = require('util');

/**
 * Gets the live match data for someone
 */
var GetLiveGameData = function (bot, steamId)
{
  var lobbySteamIds = [];

  // Check if the bot is connected to Steam Client.
  // and logged into Steam, and connected to Dota 2 GC
  if (!bot.steamClientConnected && !bot.steamUserConnected && !bot.dotaConnected)
    return;

  // Grab lobby data
  bot.spectateFriendGame(steamId);

  // handle synchronization
  util.log('curr lobby' + bot.currentLobby);

  // Grab live game data from lobby
  if (bot.currentLobby)
  {
    var url = BuildLiveGameDataRequest(bot.currentLobby);
    fetch(url).then(function(res)
    {
      var contentType = res.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1)
      {
        response.json().then(function(json)
        {
          liveGameData = JSON.parse(json);
          // TODO: Determine Radiant and Dire
          var team1 = liveGameData.teams[0];
          var team2 = liveGameData.teams[1];

          for(index = 0; index < 5; index++) {
            lobbySteamIds.push(ConvertDotaIdToSteamId(team1[index]));
            lobbySteamIds.push(ConvertDotaIdToSteamId(team2[index]));
          };
        });
      }
    })
    .catch(function(err) {
      util.log('Can\'t fetch live game data: ' + err);
    });
  }

  return lobbySteamIds;
};

/**
 * Build the API url for getting Live Game Data.
 */
function BuildLiveGameDataAPIUrl(currentLobbyId)
{
  return 'https://api.steampowered.com/IDOTA2MatchStats_570/GetRealtimeStats/v1'
         + '?key=' + process.env.API_KEY
         + '&server_steam_id=' + currentLobbyId;
};

/**
 * Dota 2 uses its own account id system, must convert to Steam id.
 */
function ConvertDotaIdtoSteamId(id)
{
  // TODO: See whatsmysteamid.azurewebsites.net
  return id;
}

exports.GetLiveGameData = GetLiveGameData;