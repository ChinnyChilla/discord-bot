const date = require('date-and-time')
module.exports = (client) => {
    console.log(`Bot is ready as ${client.user.tag}!`)
    console.log(`Currently in ${client.guilds.cache.size} server`)
    client.user.setPresence({ activities: [{ name: 'Type / to begin!', 
    type: 'STREAMING' }], status: 'online' })
    setInterval(() => {
        const now = new Date();
        console.log(`[${date.format(now, 'HH:mm')}] Status Report:`)
        console.log(`Current # of Connections: ${client.voice.adapters.size}`)
    }, 1000 * 600)

}