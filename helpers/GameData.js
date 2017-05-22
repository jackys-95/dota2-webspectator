/**
 * Used to gather live game data (work-in-progress)
 */

// Require statements for fetch API
require('es6-promise').polyfill();
require('isomorphic-fetch');

var util = require('util'),
    bigNumber = require('big-number')
    emitter = require('../app').emitter;

/**
 * Gets the live match data for someone
 */
var CreateLiveGameDataRequest = function (bot, steamId, res)
{
  // Check if the bot is connected to Steam Client.
  // and logged into Steam, and connected to Dota 2 GC
  if (!bot.steamClientConnected && !bot.steamUserConnected && !bot.dotaConnected)
    return;

  // Create live game data request
  request = { "SteamId": steamId, "Response": res };

  bot.addLiveGameDataRequest(request);

  // The request handler should be built into app.js on an interval.
};

// Live Game Data handlers
emitter.on('ReadyToGatherLiveGameData', function (bot) {
  util.log('System gathering live game data for lobby: ' + bot.currentLobby)
    // Grab live game data from lobby
  if (bot.currentLobby)
  {
    var request = BuildLiveGameDataAPIRequest(bot.currentLobby);
    fetch(request).then(function(response)
    {
      util.log(response.status + ' ' + response.statusText);
      var contentType = response.headers.get('content-type');
      if (response.status === 200 && contentType && contentType.indexOf('application/json; charset=UTF-8') !== -1)
      {
        return response.json().then(function(liveGameData)
        {
          var lobbySteamIds = [];
          // TODO: Determine Radiant and Dire
          var team1 = liveGameData.teams[0];
          var team2 = liveGameData.teams[1];

          for(index = 0; index < 5; index++) {
            lobbySteamIds.push(ConvertDotaIdToSteamId(team1.players[index].accountid));
            lobbySteamIds.push(ConvertDotaIdToSteamId(team2.players[index].accountid));
          };
          util.log(lobbySteamIds);
          emitter.emit('CompletedGatheringLiveData', bot, lobbySteamIds);
        });
      }
      else
      {
        emitter.emit('GatherLiveDataBadRequest', bot);
      }
    })
    .catch(function(err) {
      util.log('Can\'t fetch live game data: ' + err);
    });
  }
});

/**
 * API returned 400. Clear the request for now.
 */
emitter.on('GatherLiveDataBadRequest', function (bot) {
  bot.currentRequest.Response.send('Try again, sorry!');
  bot.currentRequest = null;
  util.log('GatherLiveDataBadRequest successfully handled.');
});

/**
 * API successfully returned lobby ID info.
 */
emitter.on('CompletedGatheringLiveData', function (bot, lobbyIds) {
  bot.currentRequest.Response.send('The lobby IDs are: ' + lobbyIds.toString());
  bot.currentRequest = null;
  util.log('CompletedGatheringLiveData successfully handled.');
});

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
  return bigNumber(id).add(76561197960265728).toString();
}

exports.CreateLiveGameDataRequest = CreateLiveGameDataRequest;