module.exports = (client, message) => {
    console.log("Bot has disconnected")
    try {
        message = client.queueMessages.get(message.guild.id)
        message.delete().then(message => {
            client.queueMessages.delete(message.guild.id)
        })
        clearInterval(client.queueIntervals.get(message.guild.id))
        client.queueIntervals.delete(message.guild.id)
        client.user.setPresence({ status: 'idle' })
    } catch (err) {
        console.log("Probably just in a channel for some reason")
    }
}