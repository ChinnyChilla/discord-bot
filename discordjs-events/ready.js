module.exports = (client) => {
    console.log("Bot is ready!")
    console.log(`Currently in ${client.guilds.cache.size} server`)
    console.log(`Have ${client.users.cache.size} users`)
    client.user.setPresence({ activity: { name: '!help' }, status: 'idle' })
}