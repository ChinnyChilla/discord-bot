module.exports = {
    name: 'skip',
    description: 'Skips song(s)',
    category: 'music',
    options: [
        {
            type: 4,
            name: 'amount',
            description: 'skip amount of tracks'
        }
    ],
    async execute(client, interaction) {
        const options = interaction.options.data
        const args = {}
        for (const option of options) {
            const {name, value} = option
            args[name] = value
        }
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return interaction.editReply("There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return interaction.editReply(`For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        if (args['amount']) {
            if (args['amount'] < 0) { return interaction.editReply("Invalid number!")}
            if (args['amount'] > queue.tracks.length) {
                client.functions.get('deleteQueue').execute(client, queue)
                return interaction.editReply('Skipped all tracks!')
            }
            for (i = 0; i < args['amount']; i++) {
                await queue.remove(0)
            }
            queue.skip()
            interaction.editReply(`Skipping ${args['amount']} tracks!`)
        } else {
            if (queue.tracks.length == 0) {
                interaction.editReply('No more songs, quitting')
                queue.destroy();
                return client.functions.get('deleteQueue').execute(client, queue)
            }
            queue.skip()
            interaction.editReply('Skipping!')
            
        }
        client.functions.get('updateQueue').execute(client, queue)
        
    }
}