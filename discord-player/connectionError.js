module.exports = (client, queue, error) => {
    client.functions.get('log').execute(queue.guild.id, `Connection Error: ${error}`)
    queue.metadata.channel.send("Connection Error, retrying").then(message => {
        setTimeout(() => {message.delete()}, 15000)
        queue.play(queue.tracks[0], {immediate: true})
        queue.remove(0)
    })
	console.log(error)
}