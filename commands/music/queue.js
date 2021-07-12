module.exports = {
    name: 'queue',
    category: 'music',
    description: 'Get the queue',
    execute(client, message, args) {
        const queue = client.player.getQueue(message)

        console.log(client.player.getQueue(message))
    }
}