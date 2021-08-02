module.exports = (client, message, queue) => {
    message.channel.send('\u200B').then(function (message) {
        client.queueMessages.set(message.guild.id, message)
        console.log(`Set message to ${message.guild.id}`)
    })
}