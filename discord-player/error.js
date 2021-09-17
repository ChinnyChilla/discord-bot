module.exports = (client, queue, error) => {
    function sendMessage(data) {
        try {
            queue.metadata.channel.send(data).then(function(message) {
                message.delete({timeout: 30000})
            })
        } catch (err) {
            console.log(`Error: ${err}`)
            console.log("Probably no queue metadata")
        }
    }
    if (error = "NotPlaying") {
        sendMessage("The bot is currently not playing anything!")
        console.error("NotPlaying Error")
    } else if (error = "UnableToJoin") {
        sendMessage("Could not join the channel!")
        console.error("UnableToJoin Error")
    } else if (error = "NotConnected") {
        sendMessage("The bot is currently not connected!")
        console.error("NotConnected Error")
    } else if (error = "ParseError") {
        sendMessage("The bot could not parse. \n Please try again!")
        console.error("ParseError Error")
    } else if (error = "LiveVideo") {
        sendMessage("Something live video error")
        console.error("LiveVideo Error")
    } else if (error = "VideoUnavailable") {
        sendMessage("This video is currently unavailable!")
        console.error("VideoUnavailable Error")
    } else {
        message.channel.send(`An error has occured! Please contact the developer \n Error: ${error}`).then(function(message) {
            message.delete({timeout: 120000});
        })
        console.error(`Unknown error \n Erorr: ${error}`)
    }
}