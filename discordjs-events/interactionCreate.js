module.exports = async (client, interaction) => {
    if (!interaction.isCommand()) {return}
    const command = client.commands.find(command => command.name == interaction.commandName)
    if (command.category == 'music' && !interaction.inGuild()) {
        interaction.reply("Music commands are only available in a guild!")
        setTimeout(() => {interaction.deleteReply()}, 30000)
    }interaction.reply(`Recieved your ${command.name} command... please wait`).then(() => {
        setTimeout(() => interaction.deleteReply(), 30000)
        command.execute(client, interaction)
    })
    
    
}