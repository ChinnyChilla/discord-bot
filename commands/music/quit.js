module.exports = {
    name: 'quit',
    category: 'music',
    description: 'Quits playing',
    args: '',
    execute(client, message, args) {
        const func = client.functions.get('sendMessageTemp')
        client.player.stop(message)
        func.execute(message, "Quitted")
        message = client.queueMessages.get(message.guild.id)
        message.delete().then(message => {
            client.queueMessages.delete(message.guild.id)
        })
        clearInterval(client.queueIntervals.get(message.guild.id))
        client.queueIntervals.delete(message.guild.id)
        client.user.setPresence({ status: 'idle' })
    }
}