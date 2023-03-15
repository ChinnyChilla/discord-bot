module.exports = (client, queue, track) => {
    client.functions.get('log').execute(queue.guild.id, `Track ${track.title} added by ${track.requestedBy.tag}`)
	client.functions.get('updateQueue').execute(client, queue)
}