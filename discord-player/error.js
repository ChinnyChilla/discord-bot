module.exports = (client, queue, error) => {
    client.functions.get('log').execute(queue.guild.id, `Error ${error}`)
    function sendMessage(data) {
        try {
            queue.metadata.channel.send(data).then(function(message) {
                setTimeout(() => {message.delete()}, 15000)
            })
        } catch (err) {
            console.log(`Error: ${err}`)
            console.log("Probably no queue metadata")
        }
    }
    if (error = "NotPlaying") {
        sendMessage("The bot is currently not playing anything!")
        queue.destroy()
    } else if (error = "UnableToJoin") {
        sendMessage("Could not join the channel!")
        
    } else if (error = "NotConnected") {
        sendMessage("The bot is currently not connected!")
        
    } else if (error = "ParseError") {
        sendMessage("The bot could not parse. \n Please try again!")
        
    } else if (error = "LiveVideo") {
        sendMessage("Something live video error")
        
    } else if (error = "VideoUnavailable") {
        sendMessage("This video is currently unavailable!")
        
    } else {
        message.channel.send(`An error has occured! Please contact the developer \n Error: ${error}`).then(function(message) {
            setTimeout(() => {message.delete({timeout: 120000})}, 15000)
        })
    }
}