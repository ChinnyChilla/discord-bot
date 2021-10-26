const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
require('dotenv').config()
const { Collection, Client, Intents } = require('discord.js');

const rest = new REST({version: '9'}).setToken(process.env.DISCORD_TOKEN)
const client = new Client({ intents: [
    Intents.FLAGS.GUILDS, 
    Intents.FLAGS.GUILD_MESSAGES, 
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS    
]})
// const config = require('./config.json');
const fs = require('fs');

// Check if the necesary directories are there

if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs')
}
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data')
    fs.writeFileSync('./data/likedSongs.json', '{}')
}
const { Player } = require('discord-player')

client.commands = new Array();
client.player = new Player(client);
client.queueMessages = new Collection();
client.queueEmbeds = new Collection();
client.queueIntervals = new Collection();
client.functions = new Collection();
client.queueReactionsCollections = new Collection();

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


console.log("Started refreshing application (/) commands.");

async function refreshCommands() {
    fs.readdirSync('./commands').forEach(dir => {
        const files = fs.readdirSync(`./commands/${dir}`);
        files.forEach(file => {
            if (file.endsWith(".js")) {
                console.log("Loading command: " + file)
                var command = require(`./commands/${dir}/${file}`)
                client.commands.push(command)
                // client.commands.set(command.name.toLowerCase(), command)
            };
        });
    });
    try {
        if (process.env.TEST_SERVER_GUILD_ID){
            await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.TEST_SERVER_GUILD_ID),
            { body: client.commands });
            console.log("Reloaded application (/) commands in test server")
        }
        await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), 
        { body: client.commands });
        console.log("Successfully reloaded application (/) commands.");
    } catch (err) {
        console.log("REFRESHING SLASH COMMANDS FAILED")
        console.error(err);
    };
};
refreshCommands()


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
