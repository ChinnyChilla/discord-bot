module.exports = {
    name: 'repeat',
    description: 'Repeats current track or entire queue',
    category: 'music',
    options: [
        {
            name: "mode",
            type: 4,
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
            ]
        }
    ],
    execute(client, interaction) {
        const args = {}
        for (const option of interaction.options.data) {
            const {name, value} = option
            args[name] = value
        }
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return interaction.editReply("There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return interaction.editReply(`For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        if (args['mode'] == 1) {
            queue.setRepeatMode(1)
            interaction.editReply('Repeating song!')
        } else if (args['mode'] == 2){
            queue.setRepeatMode(2)
            interaction.editReply('Repeating queue!')
        } else {
            queue.setRepeatMode(0)
            interaction.editReply('Stopped repeating!')
        }client.functions.get('log').execute(interaction.guildId, `Player repeatMode set to ${queue.repeatMode}`)
        client.functions.get('updateQueue').execute(client, queue)
    }
}