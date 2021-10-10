const path = require('path')
const fs = require('fs')
const date = require('date-and-time')


module.exports = {
    name: 'log',
    category: 'functions',
    description: 'Logs debug stuff',
    args: '[guildID, content]',
    execute(guildID, content) {
        // Each server has a seperate log
        const reqPath = path.join(__dirname, `../logs/${guildID}.log`)
        const currentTime = date.format(new Date(), 'MMM DD hh:mm:ss A')
        fs.appendFile(reqPath, "\n" + currentTime + " " + content, function(err) {
            if (err) {
                console.error("ERROR WRITING TO LOG FILE " + err)
            }
        })
    }
}