module.exports = class queueInfo {
	constructor(queueMessage) {
		this.message = queueMessage
		this.guildID = queueMessage.guild.id
	}
	buttonCollector = undefined;
	embed = undefined;
	interval = undefined;
	queue = undefined;

	setQueue(queue) {
		this.queue = queue;
	}
	setButtonCollector(collector) {
		this.buttonCollector = collector
	}
	stopButtonCollector() {
		if (!this.buttonCollector) {return};
		this.buttonCollector.stop()
	}
	setEmbed(embed) {
		this.embed = embed
	}
	setInterval(interval) {
		this.interval = interval
	}
	clearQueueInterval() {
		if (!this.interval) {return};
		clearInterval(this.interval)
	}
	deleteQueueMessage() {
		this.message.delete().then(message => {
			console.log("Deleting queue message")
            }).catch(err => {
                if (err.status == 404) {
                    console.log("Message already deleted")
                } else {
                console.log(err)}
            })
	}
}