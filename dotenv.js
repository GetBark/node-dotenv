const fs = require('./lib/fs')
const proc = require('./lib/process')
const reader = require('./lib/reader')

function readSyncAndApply(opts = {}) {
	const contents = fs.readSync(opts.path, opts.encoding)
	proc(contents)
}
function readAsyncAndApply(opts = {}) {
	return fs.readAsync(opts.path, opts.encoding)
		.then(file => proc(file))
		.then(() => true)
}

module.exports = {
	config: readSyncAndApply,
	load: readSyncAndApply,
	configAsync: readAsyncAndApply,
	loadAsync: readAsyncAndApply,

	parse: reader,
	putenv: proc,
}
