//Regular discord.js setup
const { Client } = require("discord.js");
const client = new Client();
const TOKEN = "ODA3MDg1NTcyMzg4NDIxNjgy.YBy3Aw.vz7FJtu-Z77yee8QkTfV474a8iM";
const PREFIX = "!";
client.login(TOKEN);

//Music Setup
const { Player, EVENTS } = require("discord.js-player");
const { EVT_TRACK_START, EVT_TRACK_ADD } = EVENTS;
const YOUR_SPOTIFY_ID = "26243361c26a462fa10b92f4fd50c817";
const YOUR_SPOTIFY_SECRET = "568cb813e9d642e885afdf33a1feeefe";


console.log("EVENTS" + EVENTS)
// Create a new Player (you need a Spotify ID/Secret)
client.music = new Player(YOUR_SPOTIFY_ID, YOUR_SPOTIFY_SECRET, {canUseCache: true});
client.music.connect();

//Optional Events
client.music.on(EVT_TRACK_START, (channel, track) => {
    channel.send(`Track ${track.title} started playing!`);
});
client.music.on(EVT_TRACK_ADD, (channel, tracks) => {
    channel.send(`Added ${tracks.length} to the queue!`);
});

client.on("message", async (message) => {
    if (!message.content.startsWith(PREFIX)) return;
    
    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    //!play https://open.spotify.com/track/2Tax7fSPDly9OLIAZRd0Dp?si=i4825VV5THG_F-RNXBp8zA
    //!play https://www.youtube.com/watch?v=_LgTsA9-kyM
    //!play Through The Dark Alexi
    //will get track Through The Dark by Alexi Murdoch and play it
    if(command === "play"){
        
        //Make sure you are connected to a voice channel
        const voiceChannel = message.member.voice.channel
        let queue = client.music.getQueue(message.guild.id)
        //If no queue, one will be created
        if (!queue) queue = client.music.createQueue(message.guild.id, message.channel, voiceChannel, [], {emit: {trackStart: true}})
        //addedBy is optional
        client.music.play(queue.id, args.join(' '), {addedBy: message.author.username})
        
    } else if(command === "queue") {
        const shownQueue = client.music.getQueue(message.guild.id).showQueue({
            limit: 10,
            show: {
                queueNumber: true,
                addedBy: true,
                align: true,
                alignmentSpace: 70
            }
        })
        await message.channel.send(shownQueue.join('\n'))
        /**
         * Example of shownQueue
         * 
         * [1] Gold (feat. Casey Lee Williams)                                       4:03  [Requested By FrozenSynapses]
         * [2] I Burn By Jeff and Casey Lee Williams with Lyrics                     3:10  [Requested By FrozenSynapses]
         * [3] I May Fall (feat. Casey Lee Williams & Lamar Hall)                    4:04  [Requested By FrozenSynapses]
         * [4] Red Like Roses Part II by Jeff and Casey Lee Williams with Lyrics     4:05  [Requested By FrozenSynapses]
         * [5] I Burn Remix (feat. Casey Lee Williams)                               3:08  [Requested By FrozenSynapses]
         * [6] From Shadows (feat. Casey Lee Williams) by Jeff Williams with Lyrics  5:19  [Requested By FrozenSynapses]
         * [7] Wings (feat. Casey Lee Williams)                                      5:12  [Requested By FrozenSynapses]
         * [8] EP 1 Score - Ruby Rose                                                8:38  [Requested By FrozenSynapses]
         * [9] EP 2 Score - The Shining Beacon Pt 1                                  3:32  [Requested By FrozenSynapses]
         * [10] EP 3 Score - The Shining Beacon Pt 2                                 4:40  [Requested By FrozenSynapses]
         */
    }
});