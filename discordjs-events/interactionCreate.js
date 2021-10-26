module.exports = async (client, interaction) => {
    if (!interaction.isCommand()) {return}
    const command = client.commands.find(command => command.name == interaction.commandName)
    if (command.category == 'music' && !interaction.inGuild()) {
        interaction.reply("Music commands are only available in a guild!")
        setTimeout(() => {interaction.deleteReply()}, 30000)
        return
    }
    interaction.deferReply().then(() => {
        setTimeout(() => interaction.deleteReply(), 30000)
        client.functions.get('log').execute(interaction.guildId, `${interaction.member.user.tag} requested command ${command.name}`)
        command.execute(client, interaction)  
    })
    
    
}