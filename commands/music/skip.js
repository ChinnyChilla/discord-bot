const {ApplicationCommandOptionType} = require('discord.js')
const {sendMessage} = require('../../functions/sendMessage')
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
        await interaction.deferReply()
        const amount = interaction.options.getInteger('amount') ?? 1
        
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return sendMessage(client, interaction, "There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return sendMessage(client, interaction, `For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }

        if (amount < 0) { return sendMessage(client, interaction, "Invalid number!")}

        if (amount > queue.tracks.length || queue.tracks.length == 0) {
            queue.stop()
            client.functions.get('log').execute(interaction.guildId, `No more songs, leaving!`)
			client.functions.get('deleteQueue').execute(client, interaction.guildId)
            return sendMessage(client, interaction, 'No more songs, leaving!!')
        }
        
        for (i = 0; i < amount - 1; i++) {
            await queue.remove(0)
        }
        queue.skip()

        client.functions.get('log').execute(interaction.guildId, `Player skipped`)
        sendMessage(client, interaction, 'Skipping!')
        client.functions.get('updateQueue').execute(client, queue) 
    }
}