const {ApplicationCommandOptionType} = require('discord.js')
module.exports = {
    name: 'repeat',
    description: 'Repeats current track or entire queue',
    category: 'music',
    options: [
        {
            name: "mode",
            type: ApplicationCommandOptionType.Integer,
            description: "Repeat mode",
            required: true,
            choices: [
                {
                    name: "Off",
                    value: 0
                   
                },
                {
                    name: "Track",
                    value: 1,
                    description: "Repeat track"
                },
                {
                    name: "Queue",
                    value: 2,
                    description: "Repeat queue"
                },
                {
                    name: "Autoplay",
                    value: 3,
                    description: "Autoplay"
                }
            ]
        }
    ],
    execute(client, interaction) {
        const mode = interaction.options.getInteger('mode')
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return interaction.editReply("There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return interaction.editReply(`For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        if (mode == 1) {
            queue.setRepeatMode(1)
            interaction.editReply('Repeating Song!')
        } else if (mode == 2){
            queue.setRepeatMode(2)
            interaction.editReply('Repeating Queue!')
        } else if (mode == 3) {
            queue.setRepeatMode(3)
            interaction.editReply("Autoplay Enabled!")
        } else {
            queue.setRepeatMode(0)
            interaction.editReply('Stopped repeating!')
        }client.functions.get('log').execute(interaction.guildId, `Player repeatMode set to ${queue.repeatMode}`)
        client.functions.get('updateQueue').execute(client, queue)
    }
}