module.exports = (client, queue, track) => {
    client.functions.get('log').execute(queue.guild.id, `Track ${track.title} Ended`)
    const guildID = queue.guild.id
    clearInterval(client.queueIntervals.get(guildID))
    client.queueIntervals.delete(guildID)
}