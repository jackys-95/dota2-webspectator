/**
 * Used to gather live game data (work-in-progress)
 */


// Require statements for fetch API
require('es6-promise').polyfill();
require('isomorphic-fetch');

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

  app.get('emitter').on("ReadyToGatherLiveGameData", function () {
    util.log("System gathering live game data for lobby: " + bot.currentLobby)
    // Grab live game data from lobby
    if (bot.currentLobby)
    {
      var request = BuildLiveGameDataAPIRequest(bot.currentLobby);
      fetch(request).then(function(response)
      {
        util.log(response.status + " " + response.statusText);
        var contentType = response.headers.get('content-type');
        util.log(contentType);
        util.log(contentType.indexOf('application/json; charset=UTF-8'));
        if (response.status === 200 && contentType && contentType.indexOf('application/json; charset=UTF-8') !== -1)
        {
          return response.json().then(function(liveGameData)
          {
            // TODO: Determine Radiant and Dire
            var team1 = liveGameData.teams[0];
            var team2 = liveGameData.teams[1];

            for(index = 0; index < 5; index++) {
              lobbySteamIds.push(ConvertDotaIdToSteamId(team1.players[index].accountid));
              lobbySteamIds.push(ConvertDotaIdToSteamId(team2.players[index].accountid));
            };
            util.log(lobbySteamIds);
            app.get('emitter').emit('CompletedGatheringLiveData', lobbySteamIds);
          });
        }
        else
        {
          app.get('emitter').emit('GatherLiveDataBadRequest');
        }
      })
      .catch(function(err) {
        util.log('Can\'t fetch live game data: ' + err);
      });
    }
  });
};

function BuildLiveGameDataAPIRequest(currentLobbyId)
{
  var headers = new Headers({
    'Host': 'api.steampowered.com',
    'Accept': 'application/json',
    'Accept-Language': 'en-CA',
    'Accept-Encoding': 'gzip',
    'Connection': 'close'
  });

  var init = {
    method: 'GET',
    headers: headers
  }

  return new Request(BuildLiveGameDataAPIUrl(currentLobbyId), init);
}

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
function ConvertDotaIdToSteamId(id)
{
  // TODO: See whatsmysteamid.azurewebsites.net
  return id;
}

exports.GetLiveGameData = GetLiveGameData;