module.exports = {
    name: 'reload',
    category: 'core',
    description: 'Reload all the commands of the discord bot (REQUIRES DEV)',
    args: '',
    execute(client, message, args) {
        const sendMessage = client.functions.get('sendMessageTemp')
        if (message.author.id !== client.config.devID) {
            sendMessage(message, "You must be the developer in order to use this!")
            return
        }
        const path = require('path');
        const Discord = require('discord.js')
        const fs = require('fs')
        var reqPath = path.join(__dirname, '../../config.json')
        const config = require(reqPath)

        client.config = config;
        var commands = new Discord.Collection();

        console.log("Loading commands")
        reqPath = path.join(__dirname, '../../commands')
        fs.readdirSync(reqPath).forEach(dir => {
            const files = fs.readdirSync(`${reqPath}/${dir}`);
            files.forEach(file => {
                if (file.endsWith(".js")) {
                    console.log("Loading command: " + file)
                    var command = require(`${reqPath}/${dir}/${file}`)
                    commands.set(command.name.toLowerCase(), command)
                }
            })
        })
        client.commands = commands
        console.log("Comamnds Reloaded!")
        
    }
}