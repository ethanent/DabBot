module.exports = (string, find) => {
	let temp = string
	let found = 0

	while (string.includes(find)) {
		string = string.replace(find, '')
		found++
	}

	return found
}