global.options = require('./modules/parameters')(process.argv);
const file = require('./modules/file');
const operation = require('./modules/operation');

global.options.args.forEach(async document => {
	const data = await file.read(document);
	console.log(operation.tokenize(data))
});