const logger = require('../utils/logger');

module.exports.sendMessage = async function(client, interaction, messageContent, options={}) {
	
	var isEphemeral = options.ephemeral;
	var deletionTime = options.deletionTime ? options.deleteionTime : 10000
	var embeds = options.embeds ? options.embeds : []
	var attachments = options.attachments ? options.attachments : [];
	if (interaction.replied || interaction.deferred) {
		logger.guildLog(interaction.guild.id, "debug", `Interaction replied or deferred; editing reply | ${interaction.member.name}`);
		return interaction.editReply({content: messageContent, embeds: embeds, ephemeral: isEphemeral, files: attachments});
	}
	// client.functions.get("log").execute(interaction.guild.id, `Interaction reply to ${interaction.member.displayName}\t Content: ${messageContent} | Embeds ${embeds.length} | optionCount: ${Object.keys(options).length}`)
	if (deletionTime != "inf") {
		await interaction.reply({content: messageContent, embeds: embeds, ephemeral: isEphemeral, files: attachments, fetchReply: true}).then((message) => {
			setTimeout(() => {message.delete().catch(err => {
				if (err.status == 404) {
					logger.guildLog(interaction.guild.id, "warn", "Message already deleted (in sendMessage.js)");
				} else {
					logger.guildLog(interaction.guild.id, "error", [err, "Failed to delete message"])
				}
				
			}
				
			)}, 10000)
		}).catch((err) => {logger.guildLog(interaction.guild.id, "error", [err, "Failed to reply to message"])});
		return
	}
	logger.guildLog(interaction.guild.id, "debug", `Replying to ${interaction.member.name}`);
	await interaction.reply({ content: messageContent, embeds: embeds, ephemeral: isEphemeral, files: attachments }).catch((err) => 
		{logger.guildLog(interaction.guild.id, "error", [err, "Failed to reply to message"])});

}
