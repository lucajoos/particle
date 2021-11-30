const { version } = require('../package.json');
const { program } = require('commander');

module.exports = argv => {
	const DEFAULTS = {
		tab: 4
	};

	program.version(version);
	program
		.option('-t, --tab <length>', 'set the length of a tab', DEFAULTS.tab.toString())
		.option('-w, --watch', 'automatically re-render after change')
		.option('-s, --silent', 'disable output logs');

	if(argv ? argv.length <= 2 : false) {
		return null;
	}

	program.parse(argv);

	let options = program.opts();
	options.tab = parseInt(options.tab) || DEFAULTS.tab

	return {
		options: options,
		args: program.args
	};
};