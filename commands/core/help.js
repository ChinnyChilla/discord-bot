module.exports = {
    name: 'help',
    category: 'core',
    description: 'DMs the user all commands',
    execute(client, message, args) {
        message.author.createDM.then(function() {
            const prefix = client.config.prefix;
            fs.readdirSync('./commands').forEach(dir => {
                var toSend = `**${dir}**`
                dir.readdirSync(`./commands/${dir}`).forEach(file => {
                    if(file.endsWith('.js')) {
                        toSend += `'''CSS ${prefix}${file.name} ${file.args}''' \n`
                        toSend += file.description + '\n'
                    }
                })
                message.author.send(toSend)
            })
        })

        
    }
}