module.exports = (client, queue, message) => {
    console.debug(`DEBUG MESSAGE: ${message} in server ${queue.metadata.guild.id}`)
}