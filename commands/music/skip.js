const {ApplicationCommandOptionType} = require('discord.js')
const {sendMessage} = require('../../functions/sendMessage')
const { Player } = require('discord-player');
const utils = require('../../utils/queueFunctions.js')
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
        
		const player = Player.singleton();
		const queue = player.nodes.get(interaction.guild.id);
        if (!queue) {return sendMessage(client, interaction, "There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return sendMessage(client, interaction, `For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }

        if (amount < 0) { return sendMessage(client, interaction, "Invalid number!")}

        if (amount > queue.tracks.length || queue.tracks.length == 0) {
            try {
				queue.delete();
				sendMessage(client, interaction, "No more songs, leaving!")
			} catch (err) {
				return sendMessage(client, interaction, "Failed to quit! (Skipped all songs)")
			}
			utils.deleteQueue(queue);
			return
        }
        
		if (amount > 1) {
			queue.node.skipTo(amount);
		} else {
			queue.node.skip()
		}
        
        sendMessage(client, interaction, 'Skipping!')
        utils.updateQueue(queue);
    }
}