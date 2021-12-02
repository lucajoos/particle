global.options = require('./modules/parameters')(process.argv);
const file = require('./modules/file');
const operation = require('./modules/operation');
const util = require('util');

global.options.args.forEach(async document => {
	const data = await file.read(document);
	const tokens = operation.tokenize({ data, library: global.options.library });
	console.log(tokens)
	console.log(util.inspect(operation.statements({ tokens, library: global.options.library}), false, 3, true))
});