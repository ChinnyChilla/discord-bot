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
        var reqPath = path.join(__dirname, '../../config.json')
        const config = require(reqPath)

        client.config = config;
        var commands = new Discord.Collection();

        console.log("Loading Events")

        fs.readdirSync('../../discordjs-events').forEach(file => {
            if (file.endsWith('.js')) {
                console.log("Loading discord.js file: " + file)
                const name = file.substring(0, file.length - 3)
                const event = require(`./discordjs-events/${file}`)
                client.on(name, event.bind(null, client));
            }
        })

        fs.readdirSync('../../discord-player').forEach(file => {
            if (file.endsWith('.js')) {
                console.log("Loading discord-player file: " + file)
                const name = file.substring(0, file.length - 3)
                const event = require(`./discord-player/${file}`)
                client.player.on(name, event.bind(null, client));
            }
        })

        console.log("Events Reloaded!")

        console.log("Loading commands")
        fs.readdirSync('../../commands').forEach(dir => {
            const files = fs.readdirSync(`./commands/${dir}`);
            files.forEach(file => {
                if (file.endsWith(".js")) {
                    console.log("Loading command: " + file)
                    var command = require(`./commands/${dir}/${file}`)
                    commands.set(command.name.toLowerCase(), command)
                }
            })
        })
        client.commands = commands
        console.log("Comamnds Reloaded!")
        
    }
}