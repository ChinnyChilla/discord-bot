module.exports = (client, queue, track) => {
    client.functions.get('log').execute(queue.guild.id, `Track ${track.title} Ended`)
    const guildID = queue.guild.id
	const queueInfo = client.queueInfo.get(queue.guild.id)
	if (queueInfo == null) {return};
    queueInfo.clearQueueInterval()
    queueInfo.setInterval("")
}