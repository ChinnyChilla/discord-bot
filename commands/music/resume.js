const {sendMessage} = require('../../functions/sendMessage')
const { Player } = require('discord-player');
const utils = require('../../utils/queueFunctions.js')
module.exports = {
    name: 'resume',
    category: 'music',
    description: 'Resumes music',
    async execute(client, interaction) {
		const player = Player.singleton();
		const queue = player.nodes.get(interaction.guild.id);
        if (!queue) {return sendMessage(client, interaction, "There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return sendMessage(client, interaction, `For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        queue.node.setPaused(true)
        sendMessage(client, interaction, 'Resuming!')
        utils.updateQueue(queue);
    }
}