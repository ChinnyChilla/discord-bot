module.exports = {
    name: 'deleteQueue',
    category: 'functions',
    description: 'Deletes the queue',
    args: '[client, queue]',
    execute(client, queue) {
        const guildID = queue.guild.id
        queueMessage = client.queueMessages.get(guildID)
        if (!queueMessage.deleted) {
            queueMessage.delete().then(message => {
                client.queueMessages.delete(guildID)
            })
            .catch(err => {console.log(err)})
        }

        if (client.queueIntervals.get(guildID)) {
            clearInterval(client.queueIntervals.get(guildID))
            client.queueIntervals.delete(guildID)
        }
        client.queueEmbeds.delete(guildID)
        client.queueReactionsCollections.get(guildID).stop()
        client.queueReactionsCollections.delete(guildID)
    }



}