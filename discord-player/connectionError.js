module.exports = (client, queue, error) => {
    client.functions.get('log').execute(queue.guild.id, "Connection Error")
    client.functions.get('log').execute(queue.guild.id, error)
    queue.metadata.channel.send("Connection Error").then(message => {
        setTimeout(() => {message.delete()}, 15000)
    })
}