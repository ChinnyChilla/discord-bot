module.exports = (client, queue, tracks) => {
    client.functions.get('log').execute(queue.guild.id, `${tracks.length} Tracks added by ${tracks[0].requestedBy.tag}`)
    client.functions.get('updateQueue').execute(client, queue)
}