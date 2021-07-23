module.exports = (client, error, message) => {
    const sendMessage = client.functions.get('sendMessageTemp')
    if (error = "NotPlaying") {
        sendMessage.execute(message, "The bot is currently not playing anything!")
        console.error("NotPlaying Error")
    } else if (error = "UnableToJoin") {
        sendMessage.execute(message, "Could not join the channel!")
        console.error("UnableToJoin Error")
    } else if (error = "NotConnected") {
        sendMessage.execute(message, "The bot is currently not connected!")
        console.error("NotConnected Error")
    } else if (error = "ParseError") {
        sendMessage.execute(message, "The bot could not parse. \n Please try again!")
        console.error("ParseError Error")
    } else if (error = "LiveVideo") {
        sendMessage.execute(message, "Something live video error")
        console.error("LiveVideo Error")
    } else if (error = "VideoUnavailable") {
        sendMessage.execute(message, "This video is currently unavailable!")
        console.error("VideoUnavailable Error")
    } else {
        message.channel.send(`An error has occured! Please contact the developer \n Error: ${error}`).then(function(message) {
            message.delete({timeout: 120000});
        })
        console.error(`Unknown error \n Erorr: ${error}`)
    }
}