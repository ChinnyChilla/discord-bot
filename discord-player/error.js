module.exports = (client, error, message) => {
    message.channel.send(`An error has occured! Please contact the developer \n Error: ${error}`).then(function(message) {
        message.delete({timeout: 120000});
    })
}