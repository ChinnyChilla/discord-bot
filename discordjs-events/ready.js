const { ActivityType } = require('discord.js')
const logger = require('../utils/logger')
const fs = require('fs')
const path = require('path')
module.exports = (client) => {
    logger.systemLog("status", `Bot is ready as ${client.user.tag}!`)
    logger.systemLog("status", `Currently in ${client.guilds.cache.size} server`)
    client.user.setPresence({ activities: [{ name: 'Type / to begin!', 
    type: ActivityType.Listening }], status: 'online' })
    setInterval(() => {
        const now = new Date();
        logger.systemLog("status", `Status Report:`)
        logger.systemLog("status", `Current # of Connections: ${client.voice.adapters.size}`)
    }, 1000 * 600)
    // check for any new servers the bot is in
    const reqPath = path.join(__dirname, '../data/serverConfig.json')
    const serverConfig = require(reqPath)
    client.guilds.cache.forEach(guild => {
        if (!serverConfig[guild.id]) {
            serverConfig[guild.id] = client.defaultServerConfig
        }
    })
    fs.writeFile(reqPath, JSON.stringify(serverConfig), function(err) {
        if (err) {
            logger.systemLog("error", [err, "Failed to write to server config"])
        }
    })
    for (var serverId in serverConfig) { 
        if (!client.musicChannels.includes(serverConfig[serverId]['musicChannel'])) {
            client.musicChannels.push(serverConfig[serverId]['musicChannel'])
            client.musicChannelServers.push(serverId)
        }
    }
}