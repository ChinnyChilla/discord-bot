module.exports = (client, message, queue) => {
    console.log("Queue Created")
    message.channel.send('.').then(function (message) {
        client.queueMessages.set(message.guild.id, message)
        console.log(`Set message to ${message.guild.id}`)
    })
}