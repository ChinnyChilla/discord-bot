module.exports = {
    name: 'help',
    category: 'core',
    description: 'DMs the user all commands',
    args: '',
    execute(client, message, args) {
        const fs = require('fs')
        const path = require('path')
        message.author.createDM().then(function() {
            const prefix = client.config.prefix;
            const reqPath = path.join(__dirname, '../')
            fs.readdirSync(reqPath).forEach(dir => {
                var toSend = `**${dir}**\n`
                console.log(toSend)
                fs.readdirSync(`${reqPath}/${dir}`).forEach(file => {
                    if(file.endsWith('.js')) {
                        var command = require(`${reqPath}/${dir}/${file}`)
                        toSend += `\`\`\`${prefix}${command.name} ${command.args}\n\`\`\``
                        toSend += command.description + '\n'
                    }
                })
                message.author.send(toSend)
                var toSend = ''
            })
        })

        
    }
}