const {sendMessage} = require('../../functions/sendMessage')

module.exports = {
    name: 'pause',
    description: 'Pauses music',
    category: 'music',
    args: '',
    async execute(client, interaction) {
		await interaction.deferReply()
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return sendMessage(client, interaction, "There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return sendMessage(client, interaction, `For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        queue.setPaused(true)
        sendMessage(client, interaction, "Pausing!")
        client.functions.get('log').execute(interaction.guildId, `Player paused`)
        client.functions.get('updateQueue').execute(client, queue, true)
    }
}