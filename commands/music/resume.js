const {sendMessage} = require('../../functions/sendMessage')

module.exports = {
    name: 'resume',
    category: 'music',
    description: 'Resumes music',
    async execute(client, interaction) {
		await interaction.deferReply()
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return sendMessage(client, interaction, "There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return sendMessage(client, interaction, `For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        queue.setPaused(false)
        client.functions.get('log').execute(interaction.guildId, `Player resumed`)
        sendMessage(client, interaction, 'Resuming!')
        client.functions.get('updateQueue').execute(client, queue)
    }
}