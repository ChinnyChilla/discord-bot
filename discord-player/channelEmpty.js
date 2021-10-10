module.exports = (client, queue) => {
    client.functions.get('log').execute(queue.guild.id, "Channel Empty, Leaving")
}