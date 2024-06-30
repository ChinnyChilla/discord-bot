require('dotenv').config()
const { Collection, Client, GatewayIntentBits, REST, Routes, Partials } = require('discord.js');
const DeezerExtractor = require("discord-player-deezer").default;
const TidalExtractor  = require("discord-player-tidal").default;
const logger = require('./utils/logger');
const rest = new REST({version: '10'}).setToken(process.env.DISCORD_TOKEN)
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.MessageContent
], partials: [Partials.Channel]})
// const config = require('./config.json');
const fs = require('fs');

// Check if the necesary directories are there

if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs')
}
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data')
    fs.writeFileSync('./data/likedSongs.json', '{}')
    fs.writeFileSync('./data/serverConfig.json', '{}')
}
const { Player } = require('discord-player');
const player = new Player(client);
player.extractors.register(DeezerExtractor);
player.extractors.register(TidalExtractor);
player.extractors.loadDefault();

var testCommands = new Array();
client.commands = new Array();
client.functions = new Collection();
client.defaultServerConfig = {
    musicChannel: "0" // 0 is no channel else channelID
}
client.usersInMessageReactions = new Array();
client.musicChannels = new Array();
client.admin_id = process.env.ADMIN_ID;
client.musicChannelServers = new Array();
client.imageQueue = {queue: [], isRunning: false}

logger.systemLog("info", "Loading Events")
fs.readdirSync('./discordjs-events').forEach(file => {
    if (file.endsWith('.js')) {
        logger.systemLog("info", "Loading discord.js file: " + file)
        const name = file.substring(0, file.length - 3)
        const event = require(`./discordjs-events/${file}`)
        if (name == 'ready') {
            client.once(name, event.bind(null, client))
        } else {
        client.on(name, event.bind(null, client));
        }
        
    }
})

const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js")); //Searches all .js files
for (const file of eventFiles) { //For each file, check if the event is .once or .on and execute it as specified within the event file itself
	logger.systemLog("info" ,`Reading events from ${file}`)
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, commands));
	} else {
		client.on(event.name, (...args) => event.execute(...args, commands));
	}
}

logger.systemLog("info", "Events Loaded!")

logger.systemLog("info", "Started refreshing application (/) commands.");

async function refreshCommands() {
    fs.readdirSync('./commands').forEach(dir => {
        const files = fs.readdirSync(`./commands/${dir}`);
        files.forEach(file => {
            if (file.endsWith(".js")) {
                logger.systemLog("info", "Loading command: " + file)
                var command = require(`./commands/${dir}/${file}`)
                if (command.testOnly) {
                    testCommands.push(command)
                } else {
                    client.commands.push(command)
                }
            };
        });
    });
    try {
        if (process.env.TEST_SERVER_GUILD_ID){
            await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.TEST_SERVER_GUILD_ID),
            { body: client.commands.concat(testCommands) });
            logger.systemLog("info", "Reloaded application (/) commands in test server")
            client.commands = client.commands.concat(testCommands)
        } else {
            await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), 
            { body: client.commands });
            logger.systemLog("info", "Successfully reloaded application (/) commands.");
        }

    } catch (err) {
        logger.systemLog("error", [err, "Failed to reload application commands"])
    };
};
refreshCommands()

logger.systemLog("info", "Loading Functions");
fs.readdirSync('./functions').forEach(file => {
    if (file.endsWith('.js')) {
        logger.systemLog("info", "Loading function: " + file);
        var func = require(`./functions/${file}`);
        client.functions.set(file.substring(0, file.length - 3), func);
    };
});
logger.systemLog("info", "Functions Loaded!")

client.login(process.env.DISCORD_TOKEN)
