const {sendMessage} = require('../../functions/sendMessage')
const { useMainPlayer } = require('discord-player');
const utils = require('../../utils/queueFunctions.js')
module.exports = {
    name: 'shuffle',
    category: 'music',
    description: 'Shuffles the queue',
    args: '',
    async execute(client, interaction) {
		const player = useMainPlayer();
		const queue = player.nodes.get(interaction.guild.id);
        if (!queue) {return sendMessage(client, interaction, "There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return sendMessage(client, interaction, `For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        queue.enableShuffle(false);
        sendMessage(client, interaction, "Shuffled!")
        utils.updateQueue(queue);
    }
}