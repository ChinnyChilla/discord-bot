module.exports = async (client, queue, connection) => {
    client.functions.get('log').execute(queue.guild.id, "Connection established")
}
