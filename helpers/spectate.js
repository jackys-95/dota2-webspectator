/**
 * Extending node-dota 2 to handle spectating a friend's game.
 */ 

var dota2 = require("dota2");

// Spectate method
dota2.Dota2Client.prototype.spectateFriendGame = function (steamId) {
  // TODO: Check if the GC is ready too.
  var payload = {
    "steam_id" : steamId
  };

	this.sendToGC( dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCSpectateFriendGame,
                 dota2.schema.lookupType("CMsgSpectateFriendGame").encode(payload).finish());
};

// Get Dota 2 client handlers;
var handlers = dota2.Dota2Client.prototype._handlers;

var onSpectateFriendGameResponse = function onSpectateFriendGameResponse(message) {
  var steamServerId = dota2.schema.lookupType("CMsgSpectateFriendGameResponse").decode(message).server_steamid;
  this.emit("spectateFriendGameResp", steamServerId);
};

// Add the spectate response handler
handlers[dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCSpectateFriendGameResponse] = onSpectateFriendGameResponse;

exports.dota2 = dota2;