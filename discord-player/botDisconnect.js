module.exports = (queue) => {
    console.log("Bot has disconnected")
    const guildID = queue.metadata.guild.id
    try {
        message = client.queueMessages.get(guildID)
        message.delete().then(message => {
            client.queueMessages.delete(guildID)
        })
        clearInterval(client.queueIntervals.get(guildID))
        client.queueIntervals.delete(guildID)
        client.user.setPresence({ status: 'idle' })
    } catch (err) {
        console.log("Probably just in a channel for some reason")
    }
}