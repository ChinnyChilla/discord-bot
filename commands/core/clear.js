module.exports = {
    name: 'clear',
    category: 'core',
    description: 'Clears the channel of messages',
    args: '',
    options: [
        {
            type: 7,
            name: "channel",
            description: "Channel to delete messages in",
            required: true,
            channelType: ["GUILD_TEXT"]
        },
        {
            type: 4,
            name: "amount",
            description: "Amount of messages to delete",
            required: true
        }
    ],
    execute(client, interaction) {
        console.log("Got one")
    }
}