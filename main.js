global.parameters = require('./modules/parameters')(process.argv);
const file = require('./modules/file');
const operation = require('./modules/operation');

global.parameters.args.forEach(async document => {
	const data = await file.read(document);
	console.log(operation.analyze(data))
});