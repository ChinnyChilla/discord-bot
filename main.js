const Discord = require('discord.js');
const client = new Discord.Client()
const config = require('./config.json');
const fs = require('fs');

const { Player } = require('discord-player')

client.player = new Player(client, {leaveOnEnd: true, leaveOnEmpty: true, leaveOnEmptyCooldown: 10000, autoSelfDeaf: true});
client.config = config;
client.commands = new Discord.Collection();
client.queueMessages = new Discord.Collection();
client.queueEmbeds = new Discord.Collection();
client.queueIntervals = new Discord.Collection();
client.functions = new Discord.Collection();

console.log("Loading Events")

fs.readdirSync('./discordjs-events').forEach(file => {
    if (file.endsWith('.js')) {
        console.log("Loading discord.js file: " + file)
        const name = file.substring(0, file.length - 3)
        const event = require(`./discordjs-events/${file}`)
        client.on(name, event.bind(null, client));
    }
})

fs.readdirSync('./discord-player').forEach(file => {
    if (file.endsWith('.js')) {
        console.log("Loading discord-player file: " + file)
        const name = file.substring(0, file.length - 3)
        const event = require(`./discord-player/${file}`)
        client.player.on(name, event.bind(null, client));
    }
})

console.log("Events Loaded!")


console.log("Loading commands")
fs.readdirSync('./commands').forEach(dir => {
    const files = fs.readdirSync(`./commands/${dir}`);
    files.forEach(file => {
        if (file.endsWith(".js")) {
            console.log("Loading command: " + file)
            var command = require(`./commands/${dir}/${file}`)
            client.commands.set(command.name.toLowerCase(), command)
        }
    })
})
console.log("Comamnds Loaded!")

console.log("Loading Functions")
fs.readdirSync('./functions').forEach(file => {
    if (file.endsWith('.js')) {
        console.log("Loading function: " + file)
        var func = require(`./functions/${file}`)
        client.functions.set(file.substring(0, file.length - 3), func)
    }
})
console.log("Functions Loaded!")
client.on('ready', () => {
    console.log("Bot is ready!")
    client.user.setPresence({ activity: { name: '!help' }, status: 'idle' })
})

client.login(config.token)