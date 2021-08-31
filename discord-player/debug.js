module.exports = (client, queue, message) => {
    console.debug(`DEBUG MESSAGE (${queue.guild.id}): ${message}`)
}