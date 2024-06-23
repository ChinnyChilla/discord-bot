const logger = require('../utils/logger');

module.exports = (client, message) => {
    if (!client.usersInMessageReactions.includes(message.author.id)) {
        if (client.musicChannels.includes(message.channelId) && !message.author.bot) {
			message.delete().catch(err => logger.guildLog(message.guild.id, "error", [err, "Could not delete message"]));
            message.channel.send("This is a music channel, please use music commands!").then(returnMessage => {
				setTimeout(() => { returnMessage.delete().catch(err => logger.guildLog(message.guild.id, "error", [err, "Could not delete message"])) }, 15000)
            })
        }
    }
}