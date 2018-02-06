const fs = require('fs')
const pathUtil = require('path')
const reader = require('./reader')

function cwdPath() {
	return pathUtil.join(process.cwd(), '.env')
}

exports.readSync = function readEnvSync(path = cwdPath(), encoding = 'utf8') {
	const file = fs.readFileSync(path, encoding)
	return reader(file)
}

exports.readAsync = function readEnvAsync(path = cwdPath(), encoding = 'utf8') {
	return new Promise((res, rej) => {
		fs.readFile(path, encoding, (err, file) => {
			if (err) {
				rej(err)
			} else {
				res(file)
			}
		})
	}).then(file => reader(file))
}
