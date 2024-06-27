const path = require('path')
const { sendMessage } = require('../functions/sendMessage')
const logger = require('../utils/logger');
module.exports = async (client, interaction) => {
    if (!interaction.isCommand()) {return}
	logger.guildLog(interaction.guild.id, "info", `Recieved interaction from ${interaction.member.name}`)
    const command = client.commands.find(command => command.name == interaction.commandName)
    if (!command) {return}
    function notInGuild() {
        sendMessage(client, interaction, "This command is only available to servers!")
        setTimeout(() => interaction.deleteReply().catch(err => {
            if (err.httpStatus == 404) {
                logger.guildLog(interaction.guild.id, "warn", "Reply already deleted")
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
	// Maybe ill add it later
	// if (command.name == 'imagegen') {
	// 	console.log("Found image gen")
	// 	command.execute(client, interaction)
	// 	return
	// }
    // client.functions.get('log').execute(interaction.guildId, `${interaction.member.user.tag} requested command ${command.name}`)
    if (client.musicChannelServers.includes(interaction.guild.id) && !client.musicChannels.includes(interaction.channel.id) && command.category == 'music') {
        const serverConfig = require(path.join(__dirname, "../data/serverConfig.json"))
        return sendMessage(client, interaction, `This server has as dedicated music channel!\nPlease use <#${serverConfig[interaction.guild.id]['musicChannel']}> instead!`, {ephemeral: true})
    }
	logger.guildLog(interaction.guild.id, "info", `Executing command ${command.name}`);
    command.execute(client, interaction)
}