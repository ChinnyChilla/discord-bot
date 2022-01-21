module.exports = async (client, interaction) => {
    if (!interaction.isCommand()) {return}
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
    command.execute(client, interaction)  
}