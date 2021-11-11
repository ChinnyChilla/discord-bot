module.exports = (client, queue) => {
    client.functions.get('log').execute(queue.guild.id, "Queue Ended")
    client.functions.get('deleteQueue').execute(client, queue.guild.id)
}