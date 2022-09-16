const  {PermissionsBitField, ApplicationCommandOptionType, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js')
module.exports = {
    name: 'clear',
    category: 'core',
    description: 'Clears the channel of messages',
    options: [
        {
            type: ApplicationCommandOptionType.Channel,
            name: "channel",
            description: "Channel to delete messages in",
            required: true,
            channelType: [0]
        },
        {
            type: ApplicationCommandOptionType.Integer,
            name: "amount",
            description: "Amount of messages to delete",
            required: true
        }
    ],
    execute(client, interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.editReply("You do not have the required permissions to execute this!")
        }
        const channel = interaction.options.getChannel('channel')
        if (!channel.type === ChannelType.GuildText) {return interaction.editReply("Can only delete messages in text channels!")}
        const amount = interaction.options.getInteger('amount')
        if (amount < 1 || amount > 100) {return interaction.editReply("Can only delete amounts between 1-99!")}
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('yes')
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("Do it!")
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId('no')
                .setStyle(ButtonStyle.Secondary)
                .setLabel("STOP!")
            )
        interaction.editReply({
            content: `You are about to delete **${amount}** messages from <#${channel.id}>.\n**Are you sure?**`,
            components: [row]
        })
        const filter = (buttonInteraction) => {
            return interaction.member.id === buttonInteraction.member.id
        }

        const collector = interaction.channel.createMessageComponentCollector({filter, max: 1, time: 15000})

        collector.on('end', (collection) => {
            if ((collection.first()?.customId) === 'yes') {
                channel.bulkDelete(amount, true).then(messages => {
                    client.functions.get('log').execute(interaction.guild.id, `Cleared ${messages.size} messages from ${channel.name}`)
                    channel.send(`Successfully deleted ${messages.size} messages`).then(message => {
                        setTimeout(() => {message.delete().catch(err => {
                            if (err.httpStatus == 404) {
                                console.log("Message already deleted")
                            }})
                        }, 8000)
                    })
                })
            } else {
                interaction.editReply({
                    content: "Stopped!",
                    components: []
                })
            }
        })
    }
}