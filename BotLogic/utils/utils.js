const path = require("path");
const fs = require("fs");
const axios = require("axios");
const crypto = require("crypto");
require("colors");

const CONFIG_PATH = path.join(__dirname, "..", "config.json");

// this file includes some utiliy functions for bot.js


async function getConfig() {
    return new Promise((resolve, reject) => {
        fs.readFile(CONFIG_PATH, "utf8", (err, data) => {
            if (err) {
                console.error(`[ERROR] Failed to read the config file: ${err.message}`.red);
                resolve({});
                return;
            }

            try {
                const config = JSON.parse(data);
                resolve(config);
            } catch (parseErr) {
                console.error(`[ERROR] Failed to parse config file: ${parseErr.message}`.red);
                resolve({});
                return;
            }
        })
    })
}


async function getConfigValue(path, defaultValue=null) {
    try {
        const config = await getConfig();
        const parts = path.split(":");
        let current = config;

        for (const part of parts) {
            if (current === undefined || current === null) return defaultValue;
            current = current[part];
        }

        return current !== undefined ? current : defaultValue;
    } catch (error) {
        console.error(`[ERROR] Failed getting config value for: ${path}: ${error.message}`.red);
        return defaultValue;
    }
}


async function getBooleanConfig(path, defaultValue = false) {
    const value = await getConfigValue(path, defaultValue);
    return value === true || value === "true";
};

async function getCosmetics() {
    return {
        characterId: await getConfigValue("cosmetics:character:id"),
        characterStyles: await getConfigValue("cosmetics:character:styles", []),
        backpackId: await getConfigValue("cosmetics:backpack:id"),
        backpackStyles: await getConfigValue("cosmetics:backpack:styles", []),
        eid: await getConfigValue("cosmetics:eid"),
        lvl: await getConfigValue("cosmetics:lvl"),
        bannerId: await getConfigValue("cosmetics:banner:id"),
        bannerColor: await getConfigValue("cosmetics:banner:color")
    };
}

async function getGeneralSettings() {
    return {
        add_friends: await getBooleanConfig("general:add_friends"),
        join_friends: await getConfigValue("general:join_friends"),
        leave_on_match_start: await getBooleanConfig("general:leave_on_match_start"),
        disable_playlist_restriction: await getBooleanConfig("general:disable_playlist_restriction"),
        start_accounts: await getConfigValue("general:start_accounts"),
        should_track_matches: await getBooleanConfig("general:should_track_matches"),
        whitelistEnabled: await getBooleanConfig("general:whitelist:enabled"),
        whitelistUsers: await getConfigValue("general:whitelist:users", []),
        leave_time_type: await getConfigValue("general:leave_time:leave_type"),
        leave_time_value: await getConfigValue("general:leave_time:time"),
        in_use_status: await getConfigValue("general:in_use:status"),
        in_use_type: await getConfigValue("general:in_use:type"),
        usable_status: await getConfigValue("general:usable:status"),
        usable_type: await getConfigValue("general:usable:type"),
        starting_status: await getConfigValue("general:starting_status")
    };
};

async function getAllowedPlaylists() {
    return await getConfigValue("general:allowed_playlists", []);
}

async function fetchCosmetic(name, type) {
    try {
      if (!name || name.trim() === "") {
        return null;
      }
      
      const url = `https://fortnite-api.com/v2/cosmetics/br/search?id=${encodeURI(name)}&type=${type}&responseFlags=7`;
      
      const response = await axios.get(url);
  
      if (response.status !== 200) {
        return null;
      }
      
      if (!response.data || !response.data.data) {
        return null;
      }
      
      return response.data.data;
    } catch (err) {
      return null;
    }
};


function fixPath(path) {
    if (!path) {
        throw new Error("Path is undefined");
    }

    return path
        .replace(/^FortniteGame\/Content/, '/Game')
        .replace(/FortniteGame\/Plugins\/GameFeatures\/BRCosmetics\/Content/, '/BRCosmetics')
        .split('/')
        .slice(0, -1)
        .join('/');
};


function calcChecksum(payload, signature) {
    const plaintext = payload.slice(10, 20) + "Don'tMessWithMMS" + signature.slice(2, 10);
    const data = Buffer.from(plaintext, 'utf16le');
    const hashObject = crypto.createHash('sha1');
    const hashDigest = hashObject.update(data).digest();
    return Buffer.from(hashDigest.subarray(2,10)).toString('hex').toUpperCase();
}



module.exports = {
    getConfig,
    getConfigValue,
    getBooleanConfig,
    getCosmetics,
    getGeneralSettings,
    getAllowedPlaylists,
    fetchCosmetic,
    fixPath,
    calcChecksum
}