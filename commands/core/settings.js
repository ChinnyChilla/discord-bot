const { MessageActionRow, Permissions, Message, MessageButton } = require('discord.js')
const path = require('path')
const fs = require('fs')
module.exports = {
    name: 'settings',
    category: 'core',
    description: 'Everything server setting',
    options: [
        {
            type: 1,
            name: "set",
            description: "Set a setting",
            options: [
                {
                    type: 3,
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
            type: 1,
            name: "view",
            description: "See current server config",
        }
    ],
    async execute(client, interaction) {
        const reqPath = path.join(__dirname, '../../data/serverConfig.json')
        var subCommand = interaction.options.getSubcommand()
        const serverConfig = require(reqPath)
        console.log("Before finish executing: "+ serverConfig)
        if (subCommand == "view") {
            const currentServerConfig = serverConfig[interaction.guild.id]
        } else if (subCommand == 'set') {
            if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                return interaction.editReply("You need ADMINISTRATOR to use this command!")
            }
            const selectedSetting = interaction.options.getString("setting")
            if (selectedSetting == "musicChannel") {
                interaction.editReply("Please type in a text channel (starts with #)")
                const filter = (message) => message.author.id == interaction.member.id
                const collector = interaction.channel.createMessageCollector({filter, max:1, time:15000})
                client.usersInMessageReactions.push(interaction.member.id)
                collector.on('end', async collected => {
                    const index = client.usersInMessageReactions.indexOf(interaction.member.id)
                    if (index > -1) {
                        client.usersInMessageReactions.splice(index, 1)
                    }
                    if (collected.size == 0) {return interaction.editReply({content: "Timed out"})}
                    collected.first().delete()
                    if (collected.first().content.match(/<#\d+>/)) {
                        serverConfig[interaction.guild.id][selectedSetting] = collected.first().content.slice(2, -1)
                        console.log(serverConfig)
                        fs.writeFileSync(reqPath, JSON.stringify(serverConfig), function(err) {
                            if (err) {
                                console.error(`An Error has occured! ${err}`)
                            } else {console.log("Write successful")}
                        })
                    } else {
                        return interaction.editReply("Invalid channel!")
                    }
                    interaction.editReply(`Set ${collected.first().content} to be the music channel`)
                    for (var serverId in serverConfig) { 
                        if (!client.musicChannels.includes(serverConfig[serverId]['musicChannel'])) {
                            client.musicChannels.push(serverConfig[serverId]['musicChannel'])
                        }
                    }
                })
            }
        }
    }
}