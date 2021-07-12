module.exports = (client, message) => {
    // Ignore if by a bot or not prefix
    if (message.author.bot || !message.content.startsWith(client.config.prefix)) {return}
    // splits by spaces and removes prefix
    const args = message.content.slice(client.config.prefix.length).trim().split(' ')
    // gets the commmand from the message
    const msgCommand = args[0].toLowerCase()
    // find the command in commands collection
    const command = client.commands.get(msgCommand)
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