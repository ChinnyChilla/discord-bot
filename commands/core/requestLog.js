const  {PermissionsBitField} = require('discord.js')
const { sendMessage } = require('../../functions/sendMessage')
const path = require('path')
module.exports = {
    name: 'requestlog',
    category: 'core',
    description: 'Retrieve the current logs for this server',
    async execute(client, interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.ViewAuditLog) || !interaction.member.id == process.env.ADMIN_ID) {
            return sendMessage(client, interaction, "You need the ***ViewAuditLog*** permission to view this file!")
        }
		const reqPathDebug = path.join(__dirname, `../../logs/${interaction.guild.id}-debug.log`)
		const reqPathWarning = path.join(__dirname, `../../logs/${interaction.guild.id}-warnings.log`)
		return sendMessage(client, interaction, "Here is your log file", {attachments: [reqPathDebug, reqPathWarning], ephemeral: true})
	}	
}