module.exports = {
    name: 'quit',
    description: 'Quits playing',
    category: 'music',
    execute(client, interaction) {
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return interaction.editReply("There is currently no queue!")}
        queue.destroy()
        interaction.editReply("Quitted!")
    }
}