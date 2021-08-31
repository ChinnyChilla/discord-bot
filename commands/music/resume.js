module.exports = {
    name: 'resume',
    category: 'music',
    description: 'Resumes music',
    execute(client, interaction) {
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return interaction.editReply("There is currently no queue!")}
        queue.setPaused(false)
        interaction.editReply('Resuming!')
        client.functions.get('updateQueue').execute(client, queue)
    }
}