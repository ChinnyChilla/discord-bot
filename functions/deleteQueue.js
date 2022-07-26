const axios = require('axios')
const https = require('https')
module.exports = {
    name: 'deleteQueue',
    category: 'functions',
    description: 'Deletes the queue',
    args: '[client, guildID]',
    execute(client, guildID) {
		const queueInfo = client.queueInfo.get(guildID)
		const instance = axios.create({
			httpsAgent: new https.Agent({  
				rejectUnauthorized: false
			})
		});
		instance.post('https://chinny.site/api/post/updateQueue', {
				action: 'delete',
				token: process.env.SERVER_QUEUE_TOKEN,
				id: guildID,
				queue: {'deleted': true}
			}).catch(err => console.log("Error updating delete: " + err))
        // Each server has a seperate log
      	client.functions.get('log').execute(guildID, "Deleting queue components")

		if (!queueInfo) {return}
        queueInfo.deleteQueueMessage()

        if (queueInfo.interval) {
			queueInfo.clearQueueInterval()
		}
        if (queueInfo.buttonCollector) {
            queueInfo.stopButtonCollector()
        }
        client.queueInfo.delete(guildID)
    }
}