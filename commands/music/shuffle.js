module.exports = {
    name: 'shuffle',
    category: 'music',
    description: 'Shuffles the queue',
    args: '',
    execute(client, interaction) {
        const func = client.functions.get('sendMessageTemp')
        client.player.shuffle(message)
        func.execute(message, "Shuffled!")
        client.functions.get('sendQueue').execute(client, message)
    }
}