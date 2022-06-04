module.exports = {
    name: 'deleteQueue',
    category: 'functions',
    description: 'Deletes the queue',
    args: '[client, guildID]',
    execute(client, guildID) {
		const queueInfo = client.queueInfo.get(guildID)
        // Each server has a seperate log
      	client.functions.get('log').execute(guildID, "Deleting queue components")

        queueInfo.deleteQueueMessage()

        if (queueInfo.interval) {
			queueInfo.clearQueueInterval()
			queueInfo.setInterval(undefined)
		}
        if (queueInfo.buttonCollector) {
            queueInfo.stopButtonCollector()
            queueInfo.setButtonCollector(undefined)
        }
        queueInfo.setEmbed(undefined)
    }
}