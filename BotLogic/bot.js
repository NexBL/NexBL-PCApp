const crypto = require('crypto');
const dotenv = require("dotenv"); dotenv.config();
const axios = require('axios').default;
const xmlparser = require('xml-parser');
const os = require('os');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { getConfig, getConfigValue, getBooleanConfig, getCosmetics, getGeneralSettings, getAllowedPlaylists, fetchCosmetic, fixPath, calcChecksum } = require('./utils/utils');
const { websocketHeaders } = require('./utils/constants');
const GetVersion = require('./utils/version');
const { Client: FNclient, Enums } = require('fnbr');
require('colors');

const timers = new Map();
const clients = new Map();
const matchmakingStates = new Map();

let baseClientOptions = {
    auth: {},
    debug: false,
    xmppDebug: false,
    platform: 'WIN',
    partyConfig: {
      chatEnabled: true,
      maxSize: 4
    }
};

async function floodPartyWithAllClients(user) {
  try {
    console.log("");
    let joinCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    const promises = [];
    
    for (const [clientId, client] of clients) {
      promises.push(new Promise(resolve => {
        setTimeout(async () => {
          try {
            if (!client || !client.user || !client.user.self) {
              skipCount++;
              return resolve();
            }
            
            const displayName = client.user.self.displayName || 'Unknown';
            
            try {
              if (client.party) {
                const currentPartyLeaderId = client.party.leader?.id;
                const partyMembers = Array.from(client.party.members?.keys() || []);
                
                if (currentPartyLeaderId === user || partyMembers.includes(user)) {
                  skipCount++;
                  return resolve();
                }
                
                try {
                  await client.party.leave(true);
                } catch (leaveErr) {
                  console.log(`Error leaving party for ${displayName}: ${leaveErr.message}`);
                }
              }

              try {
                const friendUser = client?.friend?.list?.get(user);
                
                if (!friendUser) {
                  skipCount++;
                  return resolve();
                }
                
                  await friendUser?.party?.join();
                  console.log(`[PARTY] Client ${displayName} successfully joined party!`);
                  joinCount++;
              } catch (joinErr) {
                if (joinErr.message && joinErr.message.includes('already joined')) {
                  skipCount++;
                } else {
                  console.log(joinErr)
                  errorCount++;
                }
              }
            } catch (err) {
              console.log(`Error with client ${displayName}: ${err.message}`);
              errorCount++;
            }
          } catch (err) {
            console.log(`Unexpected error with client: ${err.message}`);
            errorCount++;
          }
          resolve();
        }, 200 * promises.length);
      }));
    }
    
    await Promise.allSettled(promises);
    console.log(`Flood request completed: ${joinCount} joined, ${skipCount} skipped, ${errorCount} errors`);
  } catch (err) {
    console.log("Critical error in flood party function:", err.message);
  }
}


async function handleFriendMessage(message, client) {
  try {
    console.log(`[FRIEND] Received message from: ${message.author.displayName}, with content: ${message.content}`.yellow);

    if (message.content === "!!flood") {
      try {
        await floodPartyWithAllClients(message.author.id);
      } catch (err) {
        console.log(`Error in floodPartyWithAllClients from message handler:`, err.message);
      }
    } else if (message.content === "!!leave") {
      try {
        console.log(`[PARTY] Leaving party by command from ${message.author.displayName}`.yellow);
        await client.party.leave();
      } catch (err) {
        console.log(`Error in leaveParty from message handler:`, err.message);
      }
    } else if (message.content === "!!refresh") {
      try {
        console.log(`[COSMETICS] Refreshing cosmetics by command from ${message.author.displayName}`.cyan);
        await updateClientCosmetics(client);
      } catch (err) {
        console.log(`Error refreshing cosmetics from message handler:`, err.message);
      }
    } else if (message.content === "!!matchstate") {
      const partyMember = client.party.members.find(member => member.id === message.author.id);
      if (partyMember && partyMember.matchInfo) {
        console.log(`[PARTY] ${message.author.displayName}'s match location is: ${partyMember.matchInfo.location}`.yellow);
      }

    }
  } catch (err) {
    console.log(`Error in handleFriendMessage:`, err.message);
  }
}


async function handleFriendRequest(friend) {
  console.log(`[FRIEND] Received friend request from: ${friend.displayName}`.yellow);

  const whitelistEnabled = await getBooleanConfig("general:whitelist:enabled");
  const whitelistUsers = await getConfigValue("general:whitelist:users", []);
  const add_friends = await getBooleanConfig("general:add_friends");

  if (whitelistEnabled) {
    if (whitelistUsers.includes(friend.id) || whitelistUsers.includes(friend.displayName)) {
      console.log(`[FRIEND] Accepting friend request from whitelist: ${friend.displayName}`.green);
      await friend.accept();
      return;
    } else if (!add_friends) {
      console.log(`[FRIEND] Declining friend request (not in whitelist): ${friend.displayName}`.red);
      await friend.decline();
      return;
    }
  }

  if (add_friends) {
    console.log(`[FRIEND] Accepting friend request from: ${friend.displayName}`.green);
    await friend.accept();
  } else {
    console.log(`[FRIEND] Declining friend request from: ${friend.displayName}`.red);
    await friend.decline();
  }
}




async function updateClientCosmetics(client) {
    const cosmetics = await getCosmetics();
    
    const { 
      characterId, characterStyles, backpackId, backpackStyles, 
      eid, lvl, bannerId, bannerColor 
    } = cosmetics;
    
    const skin = await fetchCosmetic(characterId, "outfit");
    
    let backpack = null;
    let emote = null;
    
    if (backpackId && backpackId.trim() !== "") {
      backpack = await fetchCosmetic(backpackId, "backpack");
    }
    
    if (eid && eid.trim() !== "") {
      emote = await fetchCosmetic(eid, "emote");
    }

    if (!skin) {
      console.log(`[COSMETICS] Couldn't find skin: ${characterId}`.red);
      return;
    }

    if (backpackId && backpackId.trim() !== "" && !backpack) {
      console.log(`[COSMETICS] Couldn't find backpack: ${backpackId}`.red);
      return;
    }

    if (eid && eid.trim() !== "" && !emote) {
      console.log(`[COSMETICS] Couldn't find emote: ${eid}`.red);
      return;
    }
    
    await client.party.me.setLevel(lvl);
    await client.party.me.setBanner(bannerId, bannerColor);
    
    const outfitVariants = characterStyles && characterStyles.length > 0 
      ? characterStyles.map(style => ({ channel: style.channel, variant: style.variant })) 
      : undefined;
    
    const backpackVariants = backpackStyles && backpackStyles.length > 0 
      ? backpackStyles.map(style => ({ channel: style.channel, variant: style.variant })) 
      : undefined;
    
    await client.party.me.setOutfit(skin.id, outfitVariants, undefined);
    
    if (backpack) {
      await client.party.me.setBackpack(backpack.id, backpackVariants);
    }
    
    if (emote) {
      await client.party.me.setEmote(emote.id, fixPath(emote.path));
    }
    
    console.log(`[COSMETICS] Successfully updated cosmetics for ${client.user.self.displayName}`.green);
}

async function updateAllClientCosmetics() {
  try {
    const promises = [];
    for (const [clientId, client] of clients) {
      promises.push(new Promise(resolve => {
        setTimeout(async () => {
          try {
            if (!client || !client.user || !client.user.self) {
              return resolve();
            }
            
            const cosmetics = await getCosmetics();
              
            const { 
                characterId, characterStyles, backpackId, backpackStyles, 
                eid, lvl, bannerId, bannerColor 
              } = cosmetics;
              
            const skin = await fetchCosmetic(characterId, "outfit");
              
            let backpack = null;
            let emote = null;
            
            if (backpackId && backpackId.trim() !== "") {
              backpack = await fetchCosmetic(backpackId, "backpack");
            }
            
            if (eid && eid.trim() !== "") {
              emote = await fetchCosmetic(eid, "emote");
            }

            if (!skin) {
              console.log(`[COSMETICS] Couldn't find skin: ${characterId}`.red);
              return;
            }

            if (backpackId && backpackId.trim() !== "" && !backpack) {
              console.log(`[COSMETICS] Couldn't find backpack: ${backpackId}`.red);
              return;
            }

            if (eid && eid.trim() !== "" && !emote) {
              console.log(`[COSMETICS] Couldn't find emote: ${eid}`.red);
              return;
            }
            
            await client.party.me.setLevel(lvl);
            await client.party.me.setBanner(bannerId, bannerColor);
            
            const outfitVariants = characterStyles && characterStyles.length > 0 
              ? characterStyles.map(style => ({ channel: style.channel, variant: style.variant })) 
              : undefined;
            
            const backpackVariants = backpackStyles && backpackStyles.length > 0 
              ? backpackStyles.map(style => ({ channel: style.channel, variant: style.variant })) 
              : undefined;
            
            await client.party.me.setOutfit(skin.id, outfitVariants, undefined);
            
            if (backpack) {
              await client.party.me.setBackpack(backpack.id, backpackVariants);
            }
            
            if (emote) {
              await client.party.me.setEmote(emote.id, fixPath(emote.path));
            }
            
            console.log(`[COSMETICS] Successfully updated cosmetics for ${client.user.self.displayName}`.green);
          } catch (err) {
            console.log(`Unexpected error with client: ${err.message}`);
          }
          resolve();
        }, 200 * promises.length);
      }));
    }

  } catch (error) {
    console.error(`[COSMETICS] Error updating cosmetics: ${error.message}`.red);
  }
}

async function handlePartyInvite(invite) {
  const join_friends = await getConfigValue("general:join_friends");
  const whitelistEnabled = await getBooleanConfig("general:whitelist:enabled");
  const whitelistUsers = await getConfigValue("general:whitelist:users", []);
  
  let shouldAccept = false;
  
  if (join_friends) {
    console.log(`[PARTY] Accepting party invite from: ${invite.sender.displayName}`.green);
    shouldAccept = true;
  } else {
    if (whitelistEnabled) {
      if (whitelistUsers.includes(invite.sender.id) || whitelistUsers.includes(invite.sender.displayName)) {
        console.log(`[PARTY] Accepting party invite from whitelist: ${invite.sender.displayName}`.green);
        shouldAccept = true;
      } else {
        console.log(`[PARTY] Declining party invite from: ${invite.sender.displayName}`.red);
      }
    } else {
      console.log(`[PARTY] Declining party invite from: ${invite.sender.displayName}`.red);
    }
  }
  
  if (shouldAccept) {
    await invite.accept();
    
    await updateClientCosmetics(invite.client);
  }
}

async function getAllowedPlaylists() {
  return await getConfigValue("general:allowed_playlists", []);
}

async function handlePartyUpdated(updated, client) {
  if (!matchmakingStates.has(client.user.self.id)) {
    matchmakingStates.set(client.user.self.id, false);
  }
  
  console.log(`---------DEBUG---------\n${updated.meta.schema['Default:PartyState_s']}`)

  switch (updated.meta.schema["Default:PartyState_s"]) {
    case "BattleRoyalePreloading": {
      var loadout = client.party.me.meta.set("Default:LobbyState_j", {"LobbyState": {"hasPreloadedAthena": true}});   
      
      await client.party.me.sendPatch({'Default:LobbyState_j': loadout,});
      break;
    }

    case "BattleRoyaleMatchmaking": {
      if (matchmakingStates.get(client.user.self.id)) {
        console.log('[MATCHMAKING] Members has started matchmaking!'.green);
        return;
      };

      matchmakingStates.set(client.user.self.id, true);
      console.log(`[MATCHMAKING] Matchmaking Started!`.cyan);


      /**
       * @type {PartyMatchmakingInfo}
       */

      const PartyMatchmakingInfo = JSON.parse(updated.meta.schema["Default:PartyMatchmakingInfo_j"]).PartyMatchmakingInfo;

      if (!PartyMatchmakingInfo || PartyMatchmakingInfo.buildId === -1 || PartyMatchmakingInfo.regionId === '') {
        console.log(`[MATCHMAKING] It seems the PartyMatchmakingInfo is fucked, try again.`.red);
        return;
      }

      const playlistId = PartyMatchmakingInfo.playlistName.toLocaleLowerCase() || PartyMatchmakingInfo.linkCode.toLocaleLowerCase() || null;

      const disable_playlist_restriction = await getBooleanConfig("general:disable_playlist_restriction");
      const allowedPlaylists = await getAllowedPlaylists();

      if (!disable_playlist_restriction && !allowedPlaylists.includes(playlistId)) {
        console.log("Unsupported playlist".red, playlistId.red)
        client.party.leave();
        return;
      };

      const partyPlayerIds = client.party.members.filter(x => x.isReady).map(x => x.id).join(',');
      const bucketId = `${PartyMatchmakingInfo.buildId}:${PartyMatchmakingInfo.playlistRevision}:${PartyMatchmakingInfo.regionId}:${playlistId}`;
      
      console.log(`[MATCHMAKING] BucketID: ${bucketId}`.yellow);
      console.log(`[MATCHMAKING] Party Player IDs: ${partyPlayerIds}`.yellow);

      const query = new URLSearchParams();
      query.append("partyPlayerIds", partyPlayerIds);
      query.append("bucketId", bucketId);
      query.append("player.option.linkCode", playlistId.toString());
      query.append("player.platform", "Windows");
      query.append("input.KBM", "true");
      query.append("player.input", "KBM");
      query.append("player.option.preserveSquad", "false");
      query.append("player.option.crossplayOptOut", "false");
      query.append("player.option.partyId", client.party.id);
      query.append("player.option.splitScreen", "false");
      query.append("party.WIN", "true");
      query.append("player.option.microphoneEnabled", "false");
      query.append("player.option.uiLanguage", "en");

      client.party.members.filter(x => x.isReady).forEach(Member => {
        const platform = Member.meta.get("Default:PlatformData_j");
        if (!query.has(`party.{PlatformName}`)) {
          query.append(`party.{PlatformName}`, "true")
        }
      });

      const token = client.auth.sessions.get("fortnite").accessToken;

      let TicketRequest;

      try {
        TicketRequest = (
          await axios.get(
            `https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/game/v2/matchmakingservice/ticket/player/${client.user.self.id}?${query}`,
            {
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`
              }
            }
          )
        );
      } catch (e) {
        console.log(`[${'Matchmaking'.cyan}]`, 'Error while obtaining ticket'.red);
        client.party.leave();
        return;
      }

      if (TicketRequest.status != 200) {
        console.log(`[${'Matchmaking'.cyan}]`, 'Error while obtaining ticket'.red);
        client.party.leave();
        return;
      }

      /**
       * @type {MMSTicket}
       */
      const ticket = TicketRequest.data;

      console.log(`[${'Matchmaking'.cyan}]`, 'Ticket obtained'.green);

      const checksum = calcChecksum(ticket.payload, ticket.signature);

      var MMSAuth = [
        "Epic-Signed",
        ticket.ticketType,
        ticket.payload,
        ticket.signature,
        checksum
      ];

      const matchmakingClient = new WebSocket(
        ticket.serviceUrl,
        {
          perMessageDeflate: false,
          rejectUnauthorized: false,
          headers: {
            Origin: ticket.serviceUrl.replace('ws', 'http'),
            Authorization: MMSAuth.join(" "),
            ...websocketHeaders
          }
        }
      );

      matchmakingClient.on('unexpected-response', (request, response) => {
        let data = '';
        response.on('data', (chunk) => data += chunk);

        response.on('end', () => {
          const baseMessage = `[MATCHMAKING] Error while connecting to matchmaking service: (status ${response.statusCode} ${response.statusMessage})`;

          if (data == '') {
            console.error(baseMessage);
            try {
              client.party.me.setReadiness(false);
            } catch (err) {
              console.error(`[ERROR] Failed to set readiness: ${err.message}`.red);
            }
            return;
          }

          else if (response.headers['content-type'].startsWith('application/json')) {
            const jsonData = JSON.parse(data);

            if (jsonData.errorCode) {
              console.error(`${baseMessage}, ${jsonData.errorCode} ${jsonData.errorMessage || ''}`.red);
              try {
                client.party.me.setReadiness(false);
              } catch (err) {
                console.error(`[ERROR] Failed to set readiness: ${err.message}`.red);
              }
            } else {
              console.error(`${baseMessage} response body: ${data}`);
            };
          } else if (response.headers['x-epic-error-name']) {
            console.error(`${baseMessage}, ${response.headers['x-epic-error-name']}`.red);
          } else if (response.headers['content-type'].startsWith('text/html')) {
            const parsed = xmlparser(data);
            if (parsed.root) {
              try {
                const title = parsed.root.children.find(x => x.name == 'head').children.find(x => x.name == 'title');
                console.error(`${baseMessage} HTML title: ${title}`)
              } catch { console.error(`${baseMessage} HTML response body: ${data}`) }
            } else { console.error(`${baseMessage} HTML response body: ${data}`) }
          } else {
            console.error(`${baseMessage} response body: ${data}`);
          }
        });
      });

      matchmakingClient.on('close', () => {
        console.log(`[MATCHMAKING] Connection to matchmaker closed`.yellow);
        matchmakingStates.set(client.user.self.id, false); 
      });

      matchmakingClient.on('message', (msg) => {
        const message = JSON.parse(msg);

        console.log(`[MATCHMAKING] Message from the matchmaker`, message);
        if (message.name === 'Error') { 
          matchmakingStates.set(client.user.self.id, false);
        }
      });

      break;
    }

    case "BattleRoyalePostMatchmaking": {
      const isProcessingMatch = matchmakingStates.get(client.user.self.id);
      if (isProcessingMatch === 'processing') {
        return;
      }
 
      matchmakingStates.set(client.user.self.id, 'processing');
      
      var partyPlayerNames = client.party.members
        .map(x => `${x.displayName}`)
        .join('\n');

      if (partyPlayerNames.includes(undefined)) {
        console.log("[PARTY] Fake match prevented".yellow);
        matchmakingStates.set(client.user.self.id, false);
        return;
      }

      var activePartyMembers = Array.from(client.party.members.values())
        .filter(member => member.id !== client.user.self.id && member.isSittingOut === false);
      
      var randomPartyMember = activePartyMembers.length > 0 
        ? activePartyMembers[Math.floor(Math.random() * activePartyMembers.length)]
        : null;

      if (!randomPartyMember) {
        console.log("[PARTY] No active party members found".yellow);
        matchmakingStates.set(client.user.self.id, false);
        return;
      }

      let logCounter = 0;
      const logInterval = 5;
      let matchProcessed = false;

      const checkIfInGame = async () => {
        if (matchProcessed) return;

        if (randomPartyMember.matchInfo && randomPartyMember.matchInfo.location === "InGame") {
          matchProcessed = true;
          
          console.log(`[MATCHMAKING] ${randomPartyMember.displayName} has entered the match!`.yellow);
          
          try {
            const should_track_matches = await getBooleanConfig("general:should_track_matches");
            if (should_track_matches) {
              await updateMatchCount(client.user.self.displayName);
            }

            if (client.party?.me?.isReady) { 
              try {
                client.party.me.setReadiness(false);
              } catch (err) {
                console.error(`[ERROR] Failed to set readiness: ${err.message}`.red);
              }
            }

            const leave_on_match_start = await getBooleanConfig("general:leave_on_match_start");
            if (leave_on_match_start && client.party) { 
              try {
                await client.party.leave();
              } catch (err) {
                console.error(`[ERROR] Failed to leave party: ${err.message}`.red);
              }
            }

          } catch (err) {
            console.error(`[ERROR] Error processing match: ${err.message}`.red);
          } finally {
            matchmakingStates.set(client.user.self.id, false);
            clearInterval(checkInterval);
          }
        } else {
          logCounter++;
          if (logCounter % logInterval === 1) {
            console.log(`[MATCHMAKING] Waiting for ${randomPartyMember.displayName} to enter the match... Current location: ${randomPartyMember.matchInfo ? randomPartyMember.matchInfo.location : 'Unknown'}`.yellow);
          }
        }
      };

      const checkInterval = setInterval(checkIfInGame, 2000);
      
      checkIfInGame();

      setTimeout(() => {
        if (!matchProcessed) {
          clearInterval(checkInterval);
          console.log(`[MATCHMAKING] Timeout waiting for player to enter match`.yellow);
          matchmakingStates.set(client.user.self.id, false);
        }
      }, 30000);
      
      break;
    };

    case "BattleRoyaleView": { break; }

    default: {
      console.log('[PARTY] Unknown PartyState', updated.meta.schema["Default:PartyState_s"].red);
    };
  };
};



async function handlePartyMemberUpdated(member, client) {
  if (member.id == client.user.self.id) {
    return;
  }

  if (!client.party.me) {
    return;
  }


  if ((member.isReady && (client?.party?.me?.isLeader || member.isLeader) && !client.party?.me?.isReady) && !client.party.bManualReady) {
    if (client.party?.me?.isLeader) {
      await member.promote();
    }
    try {
      client.party.me.setReadiness(true);
    } catch (err) {
      console.error(`[ERROR] Failed to set readiness: ${err.message}`.red);
    }
  } else if ((!member.isReady && member.isLeader) && !client.party.bManualReady) {
    try {
      if (client?.WSS?.close) {
        client.WSS.close();
      } else {}
    } catch (e) {
      console.log(`[ERROR] ${e}`);
    }
  
    try {
      client.party.me.setReadiness(false);
    } catch (err) {
      console.error(`[ERROR] Failed to set readiness: ${err.message}`.red);
    }
  }

  var bAllmembersReady = true;

  client.party.members.forEach(member => {
    if (!bAllmembersReady) {  return;  }

    bAllmembersReady = member.isReady;
  });
}

async function handlePartyMemberJoin(member, client, emoteData) {

  if (client?.party?.me?.isLeader) {
    try {
      await member.promote();
      console.log(`[PARTY] ${member.displayName} is now the party leader.`)
    } catch (err) {
      console.log("[ERROR] Failed to promote member to party leader..")
    }
  }

  const partySize = client.party.size;
  
  const in_use_status = await getConfigValue("general:in_use:status");
  const in_use_type = await getConfigValue("general:in_use:type");
  const usable_status = await getConfigValue("general:usable:status");
  const usable_type = await getConfigValue("general:usable:type");
  const leave_time_value = await getConfigValue("general:leave_time:time");
  const leave_time_type = await getConfigValue("general:leave_time:leave_type");
  
  const latestEmoteId = await getConfigValue("cosmetics:eid");

  if (partySize > 1) {
    client.setStatus(in_use_status, in_use_type);
    
    const clientId = client.user.self.id;
    
    if (timers.has(clientId)) {
      clearTimeout(timers.get(clientId));
      timers.delete(clientId);
    }
    
    let timeoutMs = leave_time_value;
    switch (leave_time_type.toLowerCase()) {
      case 'seconds':
      case 'sec':
      case 's':
        timeoutMs *= 1000;
        break;
      case 'minutes':
      case 'min':
      case 'mins':
      case 'm':
        timeoutMs *= 60 * 1000;
        break;
      case 'hours':
      case 'hr':
      case 'hrs':
      case 'h':
        timeoutMs *= 60 * 60 * 1000;
        break;
      case 'days':
      case 'd':
        timeoutMs *= 24 * 60 * 60 * 1000;
        break;
      default:
        timeoutMs *= 60 * 1000;
    }
        
    const timer = setTimeout(() => {
      console.log(`[PARTY] Timer expired, leaving party`.yellow);
      if (client.party) {
        client.party.leave();
      }
      timers.delete(clientId);
    }, timeoutMs);
    
    timers.set(clientId, timer);
  } else {
    client.setStatus(usable_status, usable_type);
    
    const clientId = client.user.self.id;
    if (timers.has(clientId)) {
      clearTimeout(timers.get(clientId));
      timers.delete(clientId);
    }
  }

  setTimeout(async () => {
    try {
      const latestEmoteId = await getConfigValue("cosmetics:eid");
      console.log(`[COSMETICS] Setting latest emote: ${latestEmoteId}`.cyan);
      await client.party.me.setEmote(latestEmoteId);
    } catch (err) {
      console.error(`[ERROR] Failed to set emote: ${err.message}`.red);
    }
  }, 1500);
}

/**
 * Updates the match count in matches.json for a specific client
 * @param {string} clientName - The display name of the client
 */
async function updateMatchCount(clientName) {
  try {
    const should_track_matches = await getBooleanConfig("general:should_track_matches");
    
    if (should_track_matches === false) return;
    
    const matchesFilePath = path.join(__dirname, 'matches.json');
    let matchesData;
    
    try {
      const fileContent = fs.readFileSync(matchesFilePath, 'utf8');
      matchesData = JSON.parse(fileContent);
    } catch (err) {
      matchesData = {
        total: 0,
        accounts: []
      };
    }
    
    matchesData.total = (matchesData.total || 0) + 1;
    
    const clientIndex = matchesData.accounts.findIndex(account => account.client === clientName);
    
    if (clientIndex !== -1) {
      matchesData.accounts[clientIndex].matches += 1;
    } else {
      matchesData.accounts.push({
        client: clientName,
        matches: 1
      });
    }
    
    fs.writeFileSync(matchesFilePath, JSON.stringify(matchesData, null, 4), 'utf8');
    console.log(`[MATCHES] Updated match count for ${clientName}. Total matches: ${matchesData.total}`.cyan);
  } catch (err) {
    console.error(`[MATCHES] Error updating match count: ${err.message}`.red);
  }
}

async function main() {
  const cosmetics = await getCosmetics();
  const generalSettings = await getGeneralSettings();
  
  const { 
    characterId, characterStyles, backpackId, backpackStyles, 
    eid, lvl, bannerId, bannerColor 
  } = cosmetics;
  
  const { 
    add_friends, join_friends, leave_on_match_start, disable_playlist_restriction,
    start_accounts, should_track_matches, whitelistEnabled, whitelistUsers,
    leave_time_type, leave_time_value, in_use_status, in_use_type,
    usable_status, usable_type, starting_status 
  } = generalSettings;
  
  baseClientOptions.defaultStatus = starting_status;
  
  const skin = await fetchCosmetic(characterId, "outfit");
  
  let backpack = null;
  let emote = null;
  
  if (backpackId && backpackId.trim() !== "") {
    backpack = await fetchCosmetic(backpackId, "backpack");
  }
  
  if (eid && eid.trim() !== "") {
    emote = await fetchCosmetic(eid, "emote");
  }

  if (!skin) {
    console.log(`[ERROR] Couldn't find skin: ${characterId}`.red);
    return;
  }

  if (backpackId && backpackId.trim() !== "" && !backpack) {
    console.log(`[ERROR] Couldn't find backpack: ${backpackId}`.red);
    return;
  }

  if (eid && eid.trim() !== "" && !emote) {
    console.log(`[ERROR] Couldn't find emote: ${eid}`.red);
    return;
  }

  let outputMessage = `Skin: ${skin.name || "Unknown"}`;
  if (backpack) outputMessage += `\nBackpack: ${backpack.name || "Unknown"}`;
  if (emote) outputMessage += `\nEmote: ${emote.name || "Unknown"}`;
  
  const lastest = await GetVersion();
  const Platform = os.platform() === "win32" ? "Windows" : os.platform();
  const UserAgent = `Fortnite/${lastest.replace('-Windows', '')} ${Platform}/${os.release()}`
  axios.defaults.headers["user-agent"] = UserAgent;
  console.log("[STARTUP] UserAgent set to".yellow, axios.defaults.headers["user-agent"].yellow);

  let accountsData = [];
  try {
    const accountsFile = await new Promise((resolve, reject) => {
      fs.readFile('./accounts.json', 'utf8', (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    
    accountsData = JSON.parse(accountsFile);
    console.log(`[ACCOUNTS] Loaded ${accountsData.length} accounts from accounts.json`.green);
  } catch (err) {
    console.error(`[ACCOUNTS] Error loading accounts.json: ${err.message}`.red);
    return;
  }

  let accountsToStart = accountsData;
  if (start_accounts && start_accounts !== 'all' && start_accounts !== 'max') {
    const numAccounts = parseInt(start_accounts);
    if (isNaN(numAccounts)) {
      console.error(`[ACCOUNTS] Invalid start_accounts value: ${start_accounts}. Must be 'all', 'max', or a number.`.red);
      return;
    }
    
    if (numAccounts > accountsData.length) {
      console.error(`[ACCOUNTS] Error: Requested to start ${numAccounts} accounts, but only ${accountsData.length} accounts are available.`.red);
      return;
    }
    
    accountsToStart = accountsData.slice(0, numAccounts);
    console.log(`[ACCOUNTS] Starting ${accountsToStart.length} accounts as specified in config`.green);
  } else {
    console.log(`[ACCOUNTS] Starting all ${accountsToStart.length} accounts`.green);
  }

  let accountsobject = [];

  accountsToStart.forEach(account => {
    const { account_id, device_id, secret } = account;
    
    if (!account_id || !device_id || !secret) {
      console.log(`[ACCOUNTS] Skipping account: Invalid or missing credentials.`.yellow);
      return;
    }

    const deviceAuth = { accountId: account_id, deviceId: device_id, secret };
    
    const clientOptions = { ...baseClientOptions };
    clientOptions.auth = { deviceAuth };

    accountsobject.push(new FNclient(clientOptions));
  });

  await Promise.all(accountsobject.map(async (client) => {
    await client.login();
    console.log(`[LOGS] Logged in as ${client.user.self.displayName}`.green);
    client.setStatus(usable_status, usable_type)
    clients.set(client.user.self.id, client);

    try { await client.party.setPrivacy(Enums.PartyPrivacy.PRIVATE); } catch (err) { console.log('[PARTY] Failed to set privacy.'.red) };

    await client.party.me.setLevel(lvl);
    await client.party.me.setBanner(bannerId, bannerColor);
    
    const outfitVariants = characterStyles && characterStyles.length > 0 
      ? characterStyles.map(style => ({ channel: style.channel, variant: style.variant })) 
      : undefined;
    
    const backpackVariants = backpackStyles && backpackStyles.length > 0 
      ? backpackStyles.map(style => ({ channel: style.channel, variant: style.variant })) 
      : undefined;
    
    await client.party.me.setOutfit(skin.id, outfitVariants, undefined);
    
    if (backpack) {
      await client.party.me.setBackpack(backpack.id, backpackVariants);
    }

    client.on('friend:request', async (friend) => { await handleFriendRequest(friend) });
    client.on('party:invite', async (invite) => { await handlePartyInvite(invite) });
    client.on('party:joinrequest', async (request) => { await handlePartyInvite(request) });

    client.on('party:updated', async (updated) => { await handlePartyUpdated(updated, client); });
    client.on('party:member:updated', async (member) => { await handlePartyMemberUpdated(member, client); });
    client.on('party:member:joined', async (member) => { await handlePartyMemberJoin(member, client, emote); });
    client.on("friend:message", async (message) => { await handleFriendMessage(message, client); })
    client.on("party:member:message", async (message) => { await handleFriendMessage(message, client); })
  }));
}

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION: ' + err.message);
});

main().catch(err => {
  console.error('Error in main function:', err);
});



module.exports = {
  floodPartyWithAllClients,
  updateAllClientCosmetics
}