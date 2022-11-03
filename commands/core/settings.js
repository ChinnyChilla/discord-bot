const { MessageActionRow, PermissionsBitField, Message, MessageButton, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js')
const path = require('path')
const fs = require('fs')
module.exports = {
    name: 'settings',
    category: 'core',
    description: 'Everything server setting',
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "set",
            description: "Set a setting",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "setting",
                    description: "Specific setting",
                    choices: [
                        {
                            name: "Music Channel",
                            description: "Select a default music channel",
                            value: "musicChannel",
                        }
                    ]
            }]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "view",
            description: "See current server config",
        }
    ],
    async execute(client, interaction) {
        const reqPath = path.join(__dirname, '../../data/serverConfig.json')
        var subCommand = interaction.options.getSubcommand()
        const serverConfig = require(reqPath)

        if (subCommand == "view") {
            const discordEmbed = new EmbedBuilder()
            .setTitle('Current server settings')
            const currentServerConfig = serverConfig[interaction.guild.id]
            discordEmbed.addFields({name: "Current music channel", value: `<#${currentServerConfig['musicChannel']}>`})
            interaction.editReply({embeds: [discordEmbed]})
        } else if (subCommand == 'set') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.editReply("You need ADMINISTRATOR to use this command!")
            }
            const selectedSetting = interaction.options.getString("setting")
            if (selectedSetting == "musicChannel") {
                interaction.editReply("Please type in a text channel (starts with #) or 0 to remove music channel from this server")
                const filter = (message) => message.author.id == interaction.member.id
                const collector = interaction.channel.awaitMessages({filter, max:1, time:15000})
                client.usersInMessageReactions.push(interaction.member.id)
                collector.then(async collected => {
                    const index = client.usersInMessageReactions.indexOf(interaction.member.id)
                    if (index > -1) {
                        client.usersInMessageReactions.splice(index, 1)
                    }
                    if (collected.size == 0) {return interaction.editReply({content: "Timed out"})}
                    collected.first().delete().catch(err => console.log("Message already deleted"))
					if (collected.first().content == '0') {
                            const index = client.musicChannelServers.indexOf(interaction.guild.id)
                            if (index >-1) {
                                client.musicChannelServers.splice(index, 1)
                            }
                            return interaction.editReply("Successfully removed")
                        }
                    if (collected.first().content.match(/<#\d+>/)) {
						const previousId = serverConfig[interaction.guild.id]['musicChannel']
                        serverConfig[interaction.guild.id][selectedSetting] = collected.first().content.slice(2, -1)
                        client.functions.get('log').execute(interaction.guild.id, `Set musicChannel to ${collected.first().content}`)
						
                        fs.writeFileSync(reqPath, JSON.stringify(serverConfig), function(err) {
                            if (err) {
                                console.error(`An Error has occured! ${err}`)
                            } else {console.log("Write successful")}
                        })
						if (previousId !== 0) {
							const prevIndex = client.musicChannels.indexOf(previousId)
							if (prevIndex >-1) {
                                client.musicChannels.splice(prevIndex, 1)
								client.functions.get('log').execute(interaction.guild.id, `Successfully removed previous musicChannel ${previousId}`)
                            }
						}
						try {
							const channel = await client.channels.fetch(serverConfig[interaction.guild.id][selectedSetting])
							console.log(channel)
							channel.send({
								files: [{
									attachment: "./data/bejammin commands.png",
									name: "bejammin commands.png",
									description: "music commands"
								}]
							})
						} catch (err) {
							console.error(err)
						}
                    } else {
						console.log(collected.first())
                        return interaction.editReply("Invalid channel!")
                    }
                    interaction.editReply(`Set ${collected.first().content} to be the music channel`)
                    for (var serverId in serverConfig) { 
                        if (!client.musicChannels.includes(serverConfig[serverId]['musicChannel'])) {
                            client.musicChannels.push(serverConfig[serverId]['musicChannel'])
                            client.musicChannelServers.push(serverId)
                        }
                    }
                })
            }
        }
    }
}