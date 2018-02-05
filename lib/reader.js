const WHITESPACE = /^\s+$/
const ALPHANUM = /^[a-zA-Z0-9_]+$/

const isWhitespace = c => WHITESPACE.test(c)
const isAlphanum = c => ALPHANUM.test(c)

function prettyPrintErrorLine(line, errorIdx, lineNum) {
	let pointer = '^'
	if (errorIdx > 0) {
		for (let i = 0; i < errorIdx; i += 1) {
			pointer = ' ' + pointer // eslint-disable-line prefer-template
		}
	}
	return `Line ${ lineNum }, Col ${ errorIdx }\n${ line }\n${ pointer }`
}

/**
 * Take a single line of an "env" file, and parse it into a key-value tuple
 *
 * @param {string} rawLine The unprocessed line data as a raw string
 *
 * @param {number} lineIndex The index of the line relevant to processing. Assumed
 * to be one less than the actual line number
 *
 * @returns {[string, string] | null} Returns null if the line should be ignored,
 * otherwise a key/value tuple representing this line
 */
function parseLine(rawLine, lineIndex) {
	const line = rawLine.trim()
	const lineNum = lineIndex + 1

	if (line === '') { // Ignore Blank Lines
		return null
	}
	if (line.startsWith('#')) { // Ignore Comments
		return null
	}

	let idx = 0
	let error = null

	let beforeEquals = true
	let quoted = false
	let escapeNext = false

	const key = []
	const value = []

	while (idx < line.length && error == null) {
		const char = line.charAt(idx)

		if (beforeEquals && char === '=') {
			beforeEquals = false
			idx += 1
			continue
		}

		if (beforeEquals && !isAlphanum(char)) {
			error = `Found non-alphanumeric character in variable name @ ${ prettyPrintErrorLine(line, idx, lineNum) }`
			break
		}

		if (!beforeEquals && char === '"') {
			if (!escapeNext) {
				if (quoted) {
					quoted = false
				} else {
					quoted = true
				}
				idx += 1
				continue
			}
		}

		if (isWhitespace(char)) {
			if (beforeEquals) {
				error = `Found unexpected whitespace in variable name @ Line ${ prettyPrintErrorLine(line, idx, lineNum) }`
				break
			} else if (!quoted) {
				error = `Found unquoted whitespace in value of key ${ key.join('') } @ ${ prettyPrintErrorLine(line, idx, lineNum) }`
				break
			}
		}

		if (!escapeNext && char === '\\') {
			escapeNext = true
			idx += 1
			continue
		} else {
			escapeNext = false
		}

		if (beforeEquals) {
			key.push(char)
		} else {
			value.push(char)
		}

		idx += 1
	}

	if (error != null) {
		throw new Error(error)
	}

	return [key.join(''), value.join('')]
}

function rejectNull(obj) {
	return obj != null
}

function mapKeyValueTupleToObject(obj, [key, value]) {
	return Object.assign(obj, {
		[key]: value,
	})
}

/**
 * Take the given file contents representing a series of shell variables
 * and convert it into a key-value object
 *
 * @param {string} contents A string representing a file formatted as a series of
 * shell variables
 *
 * @returns {Object} A map of env names to env values, parsed out from contents
 */
module.exports = function parseEnvString(contents) {
	return contents.split('\n')
		.map(parseLine)
		.filter(rejectNull)
		.reduce(mapKeyValueTupleToObject, {})
}
