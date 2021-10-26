module.exports = (client, queue) => {
    client.functions.get('log').execute(queue.guild.id, "Channel Empty, Leaving")
    client.functions.get('log').execute(queue.guild.id, "Queue Ended (from channelEmpty.js)")
    const guildID = queue.guild.id
    queueMessage = client.queueMessages.get(guildID)
    if(queueMessage) {
        if (!queueMessage.deleted) {
            queueMessage.delete().then(message => {
            client.queueMessages.delete(guildID)
        })
        .catch(err => {console.log(err)})
        }
    }

    if (client.queueIntervals.get(guildID)) {
        clearInterval(client.queueIntervals.get(guildID))
        client.queueIntervals.delete(guildID)
    }
    if (client.queueReactionsCollections.get(guildID)) {
        client.queueReactionsCollections.get(guildID).stop()
        client.queueReactionsCollections.delete(guildID)
    }

    client.queueEmbeds.delete(guildID)
}