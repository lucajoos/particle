global.options = require('./modules/parameters')(process.argv);
const file = require('./modules/file');
const operation = require('./modules/operation');
const util = require('util');

global.options.args.forEach(async document => {
	const data = await file.read(document);
	const tokens = operation.tokenize({ data, library: global.options.library });
	const statements = operation.statements({ tokens, library: global.options.library});
	//const ast = operation.ast({ statements, library: global.options.library });

	console.log(util.inspect(statements, false, 3, true))
});