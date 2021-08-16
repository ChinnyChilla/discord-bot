const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')

const { Client, Intents } = require('discord.js');

const rest = new REST({version: '9'}).setToken(process.env.DISCORD_TOKEN)
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]})
// const config = require('./config.json');
const fs = require('fs');

const { Player } = require('discord-player')

var commands = []
client.player = new Player(client);
// client.config = config;
// client.commands = new Discord.Collection();
client.queueMessages = new Array();
client.queueEmbeds = new Array();
client.queueIntervals = new Array();
client.functions = new Array();
client.queueReactionsCollections = new Array();

console.log("Loading Events")

fs.readdirSync('./discordjs-events').forEach(file => {
    if (file.endsWith('.js')) {
        console.log("Loading discord.js file: " + file)
        const name = file.substring(0, file.length - 3)
        const event = require(`./discordjs-events/${file}`)
        if (name == 'ready') {
            client.once(name, event.bind(null, client))
        } else {
        client.on(name, event.bind(null, client));
        }
        
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
            commands.push(command)
            // client.commands.set(command.name.toLowerCase(), command)
        };
    });
});

console.log("Comamnds Loaded!");
async function setCommands() {
    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), 
        {body: commands});
        console.log("Successfully reloaded application (/) commands.");
    } catch (err) {
        console.error(err);
    };
};
setCommands()

console.log("Loading Functions");
fs.readdirSync('./functions').forEach(file => {
    if (file.endsWith('.js')) {
        console.log("Loading function: " + file);
        var func = require(`./functions/${file}`);
        client.functions.set(file.substring(0, file.length - 3), func);
    };
});
console.log("Functions Loaded!")

client.login(process.env.DISCORD_TOKEN)
