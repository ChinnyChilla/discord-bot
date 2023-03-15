const {sendMessage} = require('../../functions/sendMessage')
module.exports = {
    name: 'shuffle',
    category: 'music',
    description: 'Shuffles the queue',
    args: '',
    async execute(client, interaction) {
		await interaction.deferReply()
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return sendMessage(client, interaction, "There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return sendMessage(client, interaction, `For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        queue.shuffle()
        sendMessage(client, interaction, "Shuffled!")
        client.functions.get('log').execute(interaction.guildId, `Player shuffled`)
        client.functions.get('updateQueue').execute(client, queue)
    }
}