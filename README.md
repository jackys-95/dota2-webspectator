# dota2-webspectator
This project utilizes node-dota2 and node-steam to enable automated spectating of dota2 matches. This gives us the Steam server ID that the game is being played on, which in turn can be used with the Steam API to get realtime game data.

Using API data we can construct a somewhat real-time web spectating interface.

Usage
---
* At the moment it's not in quite a usable state, but will update after I do some more work. There might be some useful bits of code inside of helpers, which handles spectating and calling the API.
* helpers/spectate.js is an extension to node-dota2 which allows you to send spectate requests to the game coordinator. 
* helpers/botConnect.js is a not quite code-tested Steam bot class inspired by [bonnici's node-steam chat bot](https://github.com/bonnici/node-steam-chat-bot) and its [fork made by Efreak](https://github.com/Efreak/node-steam-chat-bot). Bots are used to spectate a friend's game using the GC.
* helpers/GameData.js currently will take the Steam server ID after a successful spectate action, and call the API to return a list of all Steam IDs in the lobby.
* You will need a Steam API key to hit the real-time endpoint at GET https://api.steampowered.com/IDOTA2MatchStats_570/GetRealtimeStats/v1

Notes
---
The same restrictions apply to spectating in client; there is a delay (typically two minutes) to all data returned from the API.
