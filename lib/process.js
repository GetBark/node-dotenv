function keyExists(key) {
	return process.env.hasOwnProperty(key)
}

module.exports = function applyObjectToProcess(obj) {
	for (const key in obj) {
		if (!keyExists(key) && obj.hasOwnProperty(key)) {
			process.env[key] = obj[key]
		}
	}
}
