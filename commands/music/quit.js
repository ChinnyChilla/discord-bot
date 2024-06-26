const {sendMessage} = require('../../functions/sendMessage')
const { useMainPlayer } = require('discord-player');
const discordFuncs = require('../../utils/discordFunctions.js')
const queueUtils = require('../../utils/queueFunctions.js')
const logger = require('../../utils/logger.js');
module.exports = {
    name: 'quit',
    description: 'Quits playing',
    category: 'music',
    async execute(client, interaction) {
		await discordFuncs.deferReply(interaction);
		const player = useMainPlayer();
        const queue = player.nodes.get(interaction.guild.id);
        if (!queue) {return sendMessage(client, interaction, "There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return sendMessage(client, interaction, `For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        try {
			queue.delete();
			queueUtils.deleteQueue(queue);
			sendMessage(client, interaction, "Quitted!");
		} catch (e) {
			sendMessage(client, interaction, "Failed to quit!");
			logger.guildLog(interaction.guild.id, "error", [e, "Failed to quit channel"]);
		}
    }
}