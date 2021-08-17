module.exports = (client, queue) => {
    const guildID = queue.metadata.guild.id
    message = client.queueMessages.get(guildID)
    message.delete().then(message => {
        clearInterval(client.queueIntervals.get(guildID))
        client.queueIntervals.delete(guildID)
        client.user.setPresence({ status: 'idle' })
    })
}