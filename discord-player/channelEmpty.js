module.exports = (queue) => {
    const guildID = queue.metadata.guild.id
    message = client.queueMessages.get(guildID)
    message.delete().then(message => {
        client.queueMessages.delete(guildID)
    })
    clearInterval(client.queueIntervals.get(guildID))
    client.queueIntervals.delete(guildID)
    client.user.setPresence({ status: 'idle' })
    client.functions.get('sendMessageTemp').execute(message, "Channel empty, Leaving!")
}