module.exports = async (client, interaction) => {
    // Ignore if by a bot or not prefix
    console.log(interaction)
    if (!interaction.isCommand()) {return}
    // splits by spaces and removes prefix
    const args = message.content.slice(client.config.prefix.length).trim().split(' ')
    // gets the commmand from the message
    const msgCommand = args[0].toLowerCase()
    // find the command in commands collection
    const command = interaction.commandName
    // if command found then execute it
    args.shift()
    if (command) {
        console.log(`Executing ${msgCommand}`)
        command.execute(client, message, args)
    } else {
        message.channel.send(`Failed to find command! \nCheck available commands using **${client.config.prefix}help**`).then(function(message) {
            message.delete({timeout: 15000})
        })
    }

    // deletes user's message
    message.delete()
    
}