module.exports = (client, message) => {
	console.log(message)
    if (!client.usersInMessageReactions.includes(message.author.id)) {
        if (client.musicChannels.includes(message.channelId) && !message.author.bot) {
            message.delete();
            message.channel.send("This is a music channel, please use music commands!").then(returnMessage => {
                setTimeout(() => {returnMessage.delete()}, 15000)
            })
        }
    }
}