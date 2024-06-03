const { ApplicationCommandOptionType } = require("discord.js");
const { execute } = require("./settings");
const axios = require('axios');
const https = require('https');
const { resourceLimits } = require("worker_threads");

module.exports = {
	name: 'imagegen',
	category: 'core',
	description: "Generate an image",
	options: [{
		type: ApplicationCommandOptionType.String,
		name: "prompt",
		description: "Give me a prompt",
		required: true,
	}],

	async execute(client, interaction) {
		interaction.deferReply();
		async function getImage() {
			const first = client.imageQueue.queue.shift()
			first.interaction.editReply(`<@${interaction.member.id}>, Generating image \n Started: <t:${Math.floor(Date.now()/1000)}:R>`)
			const instance = axios.create({
				httpsAgent: new https.Agent({  
					rejectUnauthorized: false
				})
			});

			return new Promise((resolve, reject) => {
				instance.get(`${process.env.IMAGE_URL}?token=${process.env.IMAGE_URL_TOKEN}&prompt=${first.prompt}`).then(response => {
					resolve({image: response, prompt: prompt})
				})
			}) 
		}
		const prompt = interaction.options.getString("prompt");
		client.imageQueue.queue.push({prompt: prompt, interaction: interaction})
		interaction.editReply("In queue, please wait")
		if (!client.imageQueue.isRunning) {
			client.imageQueue.isRunning = true;
			const image = await getImage()
			if (image.image.data == "error") {
				interaction.editReply("An error occured, please try again")
			}
			interaction.editReply({content: `**Completed** \n ${image.prompt}`, files: [{
				attachment: image.image.data,
				name: "result.png",
			}]})
			if (client.imageQueue.data) {}
		}
	}

}