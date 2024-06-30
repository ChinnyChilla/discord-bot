const logger = require('../utils/logger');
module.exports = class queueInfo {
	constructor(queueMessage) {
		this.message = queueMessage
		this.guildID = queueMessage.guild.id
	}
	buttonCollector = undefined;
	embed = undefined;
	interval = undefined;
	queue = undefined;
	isLyricsMode = false;

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
		this.interval = null;
	}
	deleteQueueMessage() {
		if (!this.message) {return};
		this.message.delete().then(message => {
            }).catch(err => {
                if (err.status == 404) {
                    logger.guildLog(this.message.guild.id, "warn", "Message already deleted (in createQueueInfo.js)")
                } else {
					logger.guildLog(this.message.guild.id, "error", [err, "Could not delete original queuemessage"])
               	}
            })
		this.message = undefined;
	}
}