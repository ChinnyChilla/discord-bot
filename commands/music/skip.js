const {ApplicationCommandOptionType} = require('discord.js')
module.exports = {
    name: 'skip',
    description: 'Skips song(s)',
    category: 'music',
    options: [
        {
            type: ApplicationCommandOptionType.Integer,
            name: 'amount',
            description: 'skip amount of tracks'
        }
    ],
    async execute(client, interaction) {
        interaction.deferReply()
        const amount = interaction.options.getInteger('amount') ?? 1
        
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return interaction.editReply("There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return interaction.editReply(`For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }

        if (amount < 0) { return interaction.editReply("Invalid number!")}

        if (amount > queue.tracks.length || queue.tracks.length == 0) {
            queue.stop()
            client.functions.get('log').execute(interaction.guildId, `No more songs, leaving!`)
			client.functions.get('deleteQueue').execute(client, interaction.guildId)
            return interaction.editReply('No more songs, leaving!!')
        }
        
        for (i = 0; i < amount - 1; i++) {
            await queue.remove(0)
        }
        queue.skip()

        client.functions.get('log').execute(interaction.guildId, `Player skipped`)
        interaction.editReply('Skipping!')
        client.functions.get('updateQueue').execute(client, queue) 
    }
}