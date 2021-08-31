module.exports = (client, queue, track) => {
    const guildID = queue.guild.id
    clearInterval(client.queueIntervals.get(guildID))
    client.queueIntervals.delete(guildID)
}