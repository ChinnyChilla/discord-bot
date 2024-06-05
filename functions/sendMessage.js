module.exports.sendMessage = async function(client, interaction, messageContent, options={}) {
	var isEphemeral = options.ephemeral;
	var deletionTime = options.deletionTime ? options.deleteionTime : 10000
	var embeds = options.embeds ? options.embeds : []
	var attachments = options.attachments ? options.attachments : [];
	if (interaction.replied || interaction.deferred) {
		console.log("in edited reply");
		return interaction.editReply({content: messageContent, embeds: embeds, ephemeral: isEphemeral, files: attachments});
	}
	client.functions.get("log").execute(interaction.guild.id, `Interaction reply to ${interaction.member.displayName}\t Content: ${messageContent} | Embeds ${embeds.length} | optionCount: ${Object.keys(options).length}`)
	if (deletionTime != "inf") {
		console.log("sending reply")
		await interaction.reply({content: messageContent, embeds: embeds, ephemeral: isEphemeral, files: attachments, fetchReply: true}).then((message) => {
		setTimeout(() => {console.log("deleted message"); message.delete()}, 10000)
		})
		return
	}
	await interaction.reply({content: messageContent, embeds: embeds, ephemeral: isEphemeral, files: attachments})

}
