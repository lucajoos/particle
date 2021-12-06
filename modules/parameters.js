const { version } = require('../package.json');
const { program } = require('commander');
const path = require('path');

module.exports = argv => {
	const DEFAULTS = {
		tabLength: 4,
		libraryPath: './library/index.js'
	};

	program.version(version);
	program
		.option('-l, --library <path>', 'manually set the library path', DEFAULTS.libraryPath)
		.option('-t, --tab <length>', 'set the length of a tab', DEFAULTS.tabLength.toString())
		.option('-w, --watch', 'automatically re-render after change')
		.option('-s, --silent', 'disable output logs');

	if(argv ? argv.length <= 2 : false) {
		return null;
	}

	program.parse(argv);

	let options = program.opts();
	options.tabLength = parseInt(options.tabLength) || DEFAULTS.tabLength;
	options.libraryPath = options.library || DEFAULTS.libraryPath;

	const library = require(path.resolve(options.libraryPath || DEFAULTS.libraryPath))(options);

	options.library = {
		tokens: {
			keys: Object.keys(library.tokens),
			values: Object.values(library.tokens)
		},
		grammar: {
			keys: Object.keys(library.grammar),
			values: Object.values(library.grammar)
		},
		ast: library.ast
	};

	return {
		args: program.args,
		...options
	};
};