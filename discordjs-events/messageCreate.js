module.exports = (client, message) => {
    if (!client.usersInMessageReactions.includes(message.author.id)) {
        if (client.musicChannels.includes(message.channelId) && !message.author.bot) {
			message.delete().catch(err => console.log("Message already deleted"));
            message.channel.send("This is a music channel, please use music commands!").then(returnMessage => {
				setTimeout(() => { returnMessage.delete().catch(err => console.log("Message already deleted")) }, 15000)
            })
        }
    }
}