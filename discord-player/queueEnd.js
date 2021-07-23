module.exports = (client, message, queue) => {
    console.log("Queue Ended")
    message = client.queueMessages.get(message.guild.id)
    message.delete().then(message => {
        client.queueMessages.delete(message.guild.id)
    })
    clearInterval(client.queueIntervals.get(message.guild.id))
    client.queueIntervals.delete(message.guild.id)
    client.user.setPresence({ status: 'idle' })
}