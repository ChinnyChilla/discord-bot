module.exports = {
    name: 'shuffle',
    category: 'music',
    description: 'Shuffles the queue',
    args: '',
    execute(client, interaction) {
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return interaction.editReply("There is currently no queue!")}
        queue.shuffle()
        interaction.editReply("Shuffled!")
        client.functions.get('updateQueue').execute(client, queue)
    }
}