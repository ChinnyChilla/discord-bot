module.exports = {
    name: 'deleteQueue',
    category: 'functions',
    description: 'Deletes the queue',
    args: '[client, guildID]',
    execute(client, guildID) {
        // Each server has a seperate log
      client.functions.get('log').execute(guildID, "Deleting queue components")
        queueMessage = client.queueMessages.get(guildID)
        if(queueMessage) {
            queueMessage.delete().then(message => {
                client.queueMessages.delete(guildID)
            }).catch(err => {
                if (err.httpStatus == 404) {
                    console.log("Message already deleted")
                } else {
                console.log(err)}
            })
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
}