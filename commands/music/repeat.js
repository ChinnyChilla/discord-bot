const {ApplicationCommandOptionType} = require('discord.js')
const {sendMessage} = require('../../functions/sendMessage')
const { Player } = require('discord-player')
const utils = require('../../utils/queueFunctions.js')
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
		const sendAsEphermal= true;
        const mode = interaction.options.getInteger('mode')
		const player = Player.singleton();
        const queue = player.nodes.get(interaction.guild.id);
        if (!queue) {return sendMessage(client, interaction, "There is currently no queue!", {ephemeral: sendAsEphermal})}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return sendMessage(client, interaction, `For this server, the music commands only work in <#${queue.metadata.channel.id}>`, {ephemeral:sendAsEphermal})
        }
        if (mode == 1) {
            queue.setRepeatMode(1)
            sendMessage(client, interaction,  'Repeating Song!',{ ephemeral: true})
        } else if (mode == 2){
            queue.setRepeatMode(2)
            sendMessage(client, interaction,  'Repeating Queue!',{ ephemeral: true})
        } else if (mode == 3) {
            queue.setRepeatMode(3)
            sendMessage(client, interaction,  "Autoplay Enabled!",{ ephemeral: true})
        } else {
            queue.setRepeatMode(0)
            sendMessage(client, interaction,  'Stopped repeating!',{ ephemeral: true})
        }
        utils.updateQueue(queue);
    }
}