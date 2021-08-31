module.exports = {
    name: 'pause',
    description: 'Pauses music',
    category: 'music',
    args: '',
    execute(client, interaction) {
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return interaction.editReply("There is currently no queue!")}
        queue.setPaused(true)
        interaction.editReply("Pausing!")
        client.functions.get('updateQueue').execute(client, queue, true)
    }
}