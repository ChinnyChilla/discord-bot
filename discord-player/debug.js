module.exports = (client, queue, message) => {
    client.functions.get('log').execute(queue.guild.id, `Debug Message: ${message}`)
}