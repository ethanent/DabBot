const path = require('path')
const ofs = require('fs')
const Discord = require('discord.js')
const poky = require('poky')
const createRichEmbed = require(path.join(__dirname, 'lib', 'createRichEmbed.js'))
const memberData = require(path.join(__dirname, 'lib', 'memberData.js'))

const client = new Discord.Client()

let dabboards = []
let recentDabs = []

setInterval(() => {
	recentDabs = []
}, 3 * 60 * 1000)

const updateDabboards = async () => {
	let leaderMems = await memberData.getAllMembers()

	leaderMems = leaderMems.sort((a, b) => a.dabs > b.dabs ? -1 : 1)

	let boardContent = ''

	for (let i = 0; i < 5; i++) {
		if (!leaderMems[i]) break

		boardContent = boardContent + (i + 1) + '. ' + (await client.fetchUser(leaderMems[i].id)) + '\n'
	}

	dabboards.forEach(async (board) => {
		(await board.fetchMessages()).forEach(async (message) => await message.delete())

		await board.send(createRichEmbed('-=-=- Dab Leaderboards -=-=-', boardContent, 'Leaderboards update every 5 minutes'))
	})
}

client.on('ready', async () => {
	await client.user.setPresence({
		'game': {
			'name': 'everyone dab',
			'type': 'WATCHING'
		},
		'status': 'online'
	})

	client.guilds.forEach((guild) => {
		if (guild.channels.exists('name', 'dab-leaderboard')) {
			dabboards.push(guild.channels.find('name', 'dab-leaderboard'))
		}
	})

	await updateDabboards()

	setInterval(updateDabboards, 5 * 60 * 1000)

	console.log('Started completely.')
})

// Commands

client.on('message', async (message) => {
	if (message.author.bot) return
	if (!message.member) return

	if (message.content.indexOf('!') === 0) {
		const segments = message.content.substring(1).split(' ')
		const command = segments[0]

		const senderData = await memberData.getMember(message.member.id)

		switch (command) {
			case 'dabs':
				await message.channel.send(createRichEmbed('Dab Score', 'You\'ve dabbed **' + senderData.dabs + '** time' + (senderData.dabs !== 1 ? 's' : '') + '.'))
				break
		}
	}
})

// Dab detection

client.on('message', async (message) => {
	if (message.author.bot) return
	if (!message.member) return

	if (recentDabs.includes(message.member)) return

	const senderData = await memberData.getMember(message.member.id)

	const serverDabEmoji = message.guild.emojis.array().filter((emoji) => emoji.name.includes('dab'))

	let dabbed = false

	for (let i = 0; i < serverDabEmoji.length; i++) {
		if (message.content.includes(serverDabEmoji[i].toString())) {
			dabbed = true
		}
	}

	if (dabbed) {
		recentDabs.push(message.member)

		let sentM = await message.channel.send(createRichEmbed('Savage Dab', 'Congratulations, you\'ve just dabbed!'))

		senderData.dabs++

		await memberData.setMember(message.member.id, senderData)

		await poky(2000)

		await sentM.delete()
	}
})

client.login(JSON.parse(ofs.readFileSync(path.join(__dirname, 'config.json'))).token)