# node-dotenv

[![Build Status](https://travis-ci.org/GetBark/node-dotenv.svg?branch=master)](https://travis-ci.org/GetBark/node-dotenv)

A dependency free env file reader and writer for Node.js

## About

There already exists a pretty good library for reading `.env` files. `@bark/dotenv`, however, aims to provide
an extra level of validation and consistency with the implicit `.env` file standard. A `.env` file should be
`source`able in a shell script, which means that certain extra restrictions (as well as some additional lax-ness)
need to be adhered to.

Values with spaces in them need to be quoted, otherwise this is a syntax error. In addition, escaped quotation marks
inside of quoted sections should be printed literally in the interpreted value. Shell scripts also allow quoted
sections within strings (e.g. `my" value"` is valid, equal to the string `"my value"`)

## Usage

To read a `.env` formatted string

```js
const { reader } = require('@bark/dotenv')
const values = reader(`
APP_KEY=123
# This one gets changed a lot
FOO_BAR=https://localhost:8001
`)

console.log(values) // { "APP_KEY": "123", "FOO_BAR": "https://localhost:8001" }
```

## Roadmap to v1.0.0

`@bark/dotenv` aims to offer a complete suite of tools for dealing with `.env` files - not just reading them. Each feature 
is one step closer to completion, but wont be considered complete until it also has a comprehensive test suite to accompany it

- [x] Read `.env` file string into dumb object
- [ ] Read `.env` file into editable representation
- [ ] Save `.env` file from editable representation
- [ ] Disk I/O
- [ ] Format Verification
