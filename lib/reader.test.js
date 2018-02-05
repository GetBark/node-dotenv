const reader = require('./reader')

describe('With a valid environment file', () => {
	test('transforms simple values', () => {
		expect(reader('TEST=bar')).toEqual({ TEST: 'bar' })
	})

	test('return quoted values without quotes', () => {
		const valuesWithQuotes = `
		MY_VAL=bar
		MY_QUOTED_VAL="Long name"
		`

		expect(reader(valuesWithQuotes)).toEqual({ MY_VAL: 'bar', MY_QUOTED_VAL: 'Long name' })
	})

	test('allows partially quoted values, as in shell expressions', () => {
		const withPartialQuoting = 'TEST=my"partially quoted "value'
		expect(reader(withPartialQuoting)).toEqual({ TEST: 'mypartially quoted value' })
	})

	test('allows quoted values to contain escaped quotes', () => {
		const withEscapedQuotesInQuotes = 'TEST="darcy said \\"Oh boo!\\""'
		expect(reader(withEscapedQuotesInQuotes)).toEqual({ TEST: 'darcy said "Oh boo!"' })
	})

	test('escaped slashes are included in result', () => {
		const withEscapedSlash = 'TEST="Quoted value with \\\\"'
		expect(reader(withEscapedSlash)).toEqual({ TEST: 'Quoted value with \\'})
	})

	test('triple slash renders one slash and escapes the character following the third slash', () => {
		const withConfusingSlashes = 'TEST="My value with a \\\\\\"visible\\" slash"' // -> "My value with a \\\"visible\" slash" -> My value with a \"visible" slash
		expect(reader(withConfusingSlashes)).toEqual({ TEST: 'My value with a \\"visible" slash'})
	})

	test('allows any character to be escaped without breaking', () => {
		const pointlessEscapes = 'TEST=Foo\\Bar\\Ba\\z'
		expect(reader(pointlessEscapes)).toEqual({ TEST: 'FooBarBaz' })
	})

	test('parses a file containing simple & complex values, as well as blank lines and comments', () => {
		const kitchenSink = `
		# The value of app_key gets generated automatically
		APP_KEY=123asd
		APP_URL=https://localhost
		APP_NAME="The Best Application"

		# The server injects this value, don't worry about it too much
		DATABASE_URL=postgres://user:pass@localhost:6349/cool_db
		
		LOGIN_MOTD="As brian always said, \\"Hello\\"."
		TRASH_VALUE=This" is a totally legit "way" of writing values"

		`

		expect(reader(kitchenSink)).toEqual({
			APP_KEY: '123asd',
			APP_URL: 'https://localhost',
			APP_NAME: 'The Best Application',
			DATABASE_URL: 'postgres://user:pass@localhost:6349/cool_db',
			LOGIN_MOTD: 'As brian always said, "Hello".',
			TRASH_VALUE: 'This is a totally legit way of writing values',
		})
	})
})

describe('With a file containing errors', () => {
	test('throws on bad variable names', () => {
		const charsToTest = '%$£"!^&*()+-\\/|?<>,.;:\'@~[]{}'
		for (const char of charsToTest.split('')) {
			expect(() => reader(`TE${char}ST=123`)).toThrow(/^Found.+in variable name/)
		}
	})

	test('throws when spaces are unquoted in value', () => {
		const withUnquotedWhitespace = 'TEST=I Forgot the quotes'
		expect(() => reader(withUnquotedWhitespace)).toThrow(/^Found.+whitespace.+in value/)
	})

	test('includes key name when value is badly formatted', () => {
		const names = ['FOO', 'BAR', 'BAZ']
		for (const name of names) {
			expect(() => reader(`${name}=123 456`))
				.toThrow(new RegExp(`^Found.+whitespace.+value of key ${name}`))
		}
	})

	test('throws on first error', () => {
		const reallyBadFile = 'NAME WITH SPACES=unquoted value\nBad$Name=123'
		expect(() => reader(reallyBadFile)).toThrow(/^Found.+in variable name/)
	})
})

describe('Will return an empty object', () => {
	test('when file only contains comments', () => {
		const commentsOnly = `# This is a comment in an env file\n# And this is a comment on the second line`
		expect(reader(commentsOnly)).toEqual({})
	})

	test('when file only contains blank lines', () => {
		const onlyBlankLines = `\n\n\n\n`
		expect(reader(onlyBlankLines)).toEqual({})
	})

	test('when file only contains a combination of blank lines and comments', () => {
		const blanksAndComments = `# My comment on the first linen\n\n# My comment on the third line`
		expect(reader(blanksAndComments)).toEqual({})
	})
})