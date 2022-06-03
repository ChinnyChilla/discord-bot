const path = require('path')
module.exports = async (client, interaction) => {
    if (!interaction.isCommand()) {return}
	if (interaction.type == "MESSAGE_COMPONENT") {return client.emit("messageButtonClicked", interaction)}
    const command = client.commands.find(command => command.name == interaction.commandName)
    if (!command) {return}
    function notInGuild() {
        interaction.reply("This command is only available to servers!")
        setTimeout(() => interaction.deleteReply().catch(err => {
            if (err.httpStatus == 404) {
                console.log("Reply already deleted")
            }
        }), 30000)
        return
    }
    if (command.category == 'music' && !interaction.inGuild()) {
        notInGuild();
    }
    if (command.name == 'settings' && !interaction.inGuild()) {
        notInGuild();
    }
    await interaction.deferReply()
    setTimeout(() => interaction.deleteReply().catch(err => {
        if (err.httpStatus == 404) {
            console.log("Reply already deleted")
        }
    }), 30000)
    client.functions.get('log').execute(interaction.guildId, `${interaction.member.user.tag} requested command ${command.name}`)
    if (client.musicChannelServers.includes(interaction.guild.id) && !client.musicChannels.includes(interaction.channel.id) && command.category == 'music') {
        const serverConfig = require(path.join(__dirname, "../data/serverConfig.json"))
        return interaction.editReply(`This server has as dedicated music channel!\nPlease use <#${serverConfig[interaction.guild.id]['musicChannel']}> instead!`)
    }
    command.execute(client, interaction)
}