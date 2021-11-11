module.exports = (client, queue) => {
    client.functions.get('log').execute(queue.guild.id, "Bot has disconnected")
    const guildID = queue.guild.id
    client.functions.get('deleteQueue').execute(client, guildID)
}