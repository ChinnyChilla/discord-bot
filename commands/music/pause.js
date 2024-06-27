const {sendMessage} = require('../../functions/sendMessage')
const { useMainPlayer } = require('discord-player');
const utils = require('../../utils/queueFunctions.js')

module.exports = {
    name: 'pause',
    description: 'Pauses music',
    category: 'music',
    args: '',
    async execute(client, interaction) {
		const player = useMainPlayer();
        const queue = player.nodes.get(interaction.guild.id);
        if (!queue) {return sendMessage(client, interaction, "There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return sendMessage(client, interaction, `For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        queue.node.setPaused(true)
        sendMessage(client, interaction, "Pausing!")
        utils.updateQueue(queue);
    }
}