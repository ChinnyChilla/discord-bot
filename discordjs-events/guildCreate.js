const fs = require('fs')
const path = require('path')
module.exports = (client, guild) => {
	guild.channels.create({name: 'chinny-music-bot', reason: "Create a music channel"}).then(channel => {
		const reqPath = path.join(__dirname, '../data/serverConfig.json')
		const serverConfig = require(reqPath)
		serverConfig[guild.id] = client.defaultServerConfig
		serverConfig[guild.id]['musicChannel'] = channel.id
		client.musicChannels.push(channel.id)
		client.musicChannelServers.push(guild.id)
		fs.writeFile(reqPath, JSON.stringify(serverConfig), function(err) {
			if (err) {
				console.error(`An Error has occured! ${err}`)
			}
		})
		channel.send({
			files: [{
				attachment: "./data/bejammin commands.png",
				name: "bejammin commands.png",
				description: "music commands"
			}]
		})
	})    
} 