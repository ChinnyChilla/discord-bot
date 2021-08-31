module.exports = (client, queue) => {
    console.log("Bot has been disconnected")
    const guildID = queue.guild.id
    try {
        message = client.queueMessages.get(guildID)
        message.delete().then(message => {
            client.queueMessages.delete(guildID)
        })
        clearInterval(client.queueIntervals.get(guildID))
        client.queueIntervals.delete(guildID)
        client.queueReactionsCollections.get(guildID).stop()
        client.queueReactionsCollections.delete(guildID)
    } catch (err) {
        console.log("Probably just in a channel for some reason")
    }
}