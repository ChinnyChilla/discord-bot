module.exports = {
    name: 'reload',
    category: 'core',
    description: 'Reload all the commands of the discord bot (REQUIRES DEV)',
    args: '',
    execute(client, interaction) {
        const sendMessage = client.functions.get('sendMessageTemp')
        if (message.author.id !== client.config.devID) {
            sendMessage.execute(message, `<@${message.author.id}>You must be the developer in order to use this!`)
            return
        }
        const path = require('path');
        const Discord = require('discord.js')
        const fs = require('fs')
        var reqPath = path.join(__dirname, '../../config.json')
        delete require.cache[reqPath]
        const config = require(reqPath)
        

        client.config = config;
        var commands = new Discord.Collection();

        console.log("Reloading commands")
        reqPath = path.join(__dirname, '../../commands')
        delete require.cache[reqPath]
        fs.readdirSync(reqPath).forEach(dir => {
            const files = fs.readdirSync(`${reqPath}/${dir}`);
            files.forEach(file => {
                if (file.endsWith(".js")) {
                    delete require.cache[require.resolve(`${reqPath}/${dir}/${file}`)]
                    console.log("Loading command: " + file)
                    var command = require(`${reqPath}/${dir}/${file}`)
                    commands.set(command.name.toLowerCase(), command)
                }
            })
        })
        client.commands = []
        client.commands = commands
        console.log("Comamnds Reloaded!")
        sendMessage.execute(message, "Commands reloaded!")
        
    }
}