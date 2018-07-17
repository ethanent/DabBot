const path = require('path')
const util = require('util')
const ofs = require('fs')
const fs = {
	'readFile': util.promisify(ofs.readFile),
	'writeFile': util.promisify(ofs.writeFile),
	'stat': util.promisify(ofs.stat),
	'readdir': util.promisify(ofs.readdir)
}

const baseSaveDir = path.join(__dirname, '..', 'data')

module.exports = {
	'getMember': async (id) => {
		let memberFileLocation = path.join(baseSaveDir, id)
		let res

		try {
			res = JSON.parse(await fs.readFile(memberFileLocation))
		}
		catch (err) {
			res = {
				'created': new Date(),
				'dabs': 0
			}

			await fs.writeFile(memberFileLocation, JSON.stringify(res))
		}

		return res
	},
	'setMember': async (id, data) => await fs.writeFile(path.join(baseSaveDir, id), JSON.stringify(data)),
	'memberExists': async (id) => (await fs.stat(path.join(baseSaveDir, id))).isFile(),
	'getAllMembers': async () => {
		let fileNames = await fs.readdir(baseSaveDir)

		let allMems = []

		for (let i = 0; i < fileNames.length; i++) {
			let currentMemData = JSON.parse(await fs.readFile(path.join(baseSaveDir, fileNames[i])))
			
			allMems.push(Object.assign(
				currentMemData, 
				{
					'id': fileNames[i]
				}
			))
		}

		return allMems
	}
}