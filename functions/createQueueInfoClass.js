module.exports = class queueInfo {
	constructor(queueMessage, queue) {
		this.message = queueMessage
		this.queue = queue
	}
	buttonCollector = "";
	embed = "";
	interval = "";

	setQueue(queue) {
		this.queue = queue
	} 
	setButtonCollector(collector) {
		this.buttonCollector = collector
	}
	stopButtonCollector() {
		this.buttonCollector.stop()
	}
	setEmbed(embed) {
		this.embed = embed
	}
	setInterval(interval) {
		this.interval = interval
	}
	clearQueueInterval() {
		clearInterval(this.interval)
	}
	deleteQueueMessage() {
		this.message.delete().then(message => {
                client.queueMessages.delete(guildID)
            }).catch(err => {
                if (err.httpStatus == 404) {
                    console.log("Message already deleted")
                } else {
                console.log(err)}
            })
	}
}