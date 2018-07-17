const Discord = require('discord.js')

module.exports = (title, description, footer) => {
	const embed = new Discord.RichEmbed({
		title,
		description
	})

	embed.setColor('#FFCC4D')
	if (footer) embed.setFooter(footer)

	return embed
}