module.exports = {
    name: 'pause',
    description: 'Pauses music',
    category: 'music',
    args: '',
    execute(client, interaction) {
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return interaction.editReply("There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return interaction.editReply(`For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        queue.setPaused(true)
        interaction.editReply("Pausing!")
        client.functions.get('updateQueue').execute(client, queue, true)
    }
}