const logger = require('./logger');

async function sendMessage(interaction, messageContent, options = {}) {
	var isEphemeral = options.ephemeral;
	var deletionTime = options.deletionTime ? options.deletionTime : 15000
	var embeds = options.embeds ? options.embeds : []
	var attachments = options.attachments ? options.attachments : [];
	if (interaction.replied || interaction.deferred) {
		return interaction.editReply({ content: messageContent, embeds: embeds, ephemeral: isEphemeral, files: attachments });
	}
	if (deletionTime != "inf") {
		await interaction.reply({ content: messageContent, embeds: embeds, ephemeral: isEphemeral, files: attachments }).then(function (message) {
			setTimeout(() => { message.delete().catch(err => logger.guildLog(interaction.guild.id, "error", [err, "Message already deleted"])) }, deletionTime)
		}).catch((err) => logger.guildLog(interaction.guild.id, "error", [err, "Cannot interaction reply"]));
		return
	}
	await interaction.reply({ content: messageContent, embeds: embeds, ephemeral: isEphemeral, files: attachments }).catch((err) => logger.guildLog(interaction.guild.id, "error", [err, "Cannot interaction reply"]));

}

async function deferReply(interaction, options= {}) {
	var deletionTime = options.deletionTime ? options.deletionTime : 15000;
	if (deletionTime != "inf") {
		await interaction.deferReply({ fetchReply: true }).then((message) => {
			setTimeout(() => { message.delete().catch(err => logger.guildLog(interaction.guild.id, "error", [err, "Message already deleted"])) }, deletionTime)
		});
		return;
	}
	await interaction.deferReply().catch((err) => logger.guildLog(interaction.guild.id, "error", [err, "Cannot defer reply"]));
	return;
}


module.exports = { sendMessage, deferReply }
