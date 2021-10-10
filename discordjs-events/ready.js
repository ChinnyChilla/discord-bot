module.exports = (client) => {
    console.log(`Bot is ready as ${client.user.tag}!`)
    console.log(`Currently in ${client.guilds.cache.size} server`)
    client.user.setPresence({ activities: [{ name: 'Type / to begin!', 
    type: 'STREAMING' }], status: 'online' })
}