const {sendMessage} = require('../../functions/sendMessage')
module.exports = {
    name: 'quit',
    description: 'Quits playing',
    category: 'music',
    async execute(client, interaction) {
		await interaction.deferReply();
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return sendMessage(client, interaction, "There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return sendMessage(client, interaction, `For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        queue.stop()
        sendMessage(client, interaction, "Quitted!")
        client.functions.get('log').execute(interaction.guildId, `Player Quitted`)
        client.functions.get('deleteQueue').execute(client, interaction.guild.id)
    }
}