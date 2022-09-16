const date = require('date-and-time')
const { ActivityType } = require('discord.js')
const fs = require('fs')
const path = require('path')
module.exports = (client) => {
    console.log(`Bot is ready as ${client.user.tag}!`)
    console.log(`Currently in ${client.guilds.cache.size} server`)
    client.user.setPresence({ activities: [{ name: 'Type / to begin!', 
    type: ActivityType.Listening }], status: 'online' })
    setInterval(() => {
        const now = new Date();
        console.log(`[${date.format(now, 'HH:mm')}] Status Report:`)
        console.log(`Current # of Connections: ${client.voice.adapters.size}`)
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
            console.error(`An Error has occured! ${err}`)
        }
    })
    for (var serverId in serverConfig) { 
        if (!client.musicChannels.includes(serverConfig[serverId]['musicChannel'])) {
            client.musicChannels.push(serverConfig[serverId]['musicChannel'])
            client.musicChannelServers.push(serverId)
        }
    }
}