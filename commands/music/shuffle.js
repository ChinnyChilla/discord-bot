module.exports = {
    name: 'shuffle',
    category: 'music',
    description: 'Shuffles the queue',
    args: '',
    execute(client, interaction) {
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return interaction.editReply("There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return interaction.editReply(`For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        queue.shuffle()
        interaction.editReply("Shuffled!")
        client.functions.get('log').execute(interaction.guildId, `Player shuffled`)
        client.functions.get('updateQueue').execute(client, queue)
    }
}