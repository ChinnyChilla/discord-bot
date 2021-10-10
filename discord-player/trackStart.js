module.exports = (client, queue, track) => {
    client.functions.get('log').execute(queue.guild.id, `Track ${track.title} starting`)
    client.functions.get('sendQueue').execute(client, queue, track)
}