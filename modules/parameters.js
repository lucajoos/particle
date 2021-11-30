const { version } = require('../package.json');
const { program } = require('commander');

module.exports = argv => {
	program.version(version);
	program
		.option('-w, --watch', 'automatically re-render after change')
		.option('-s, --silent', 'disable output logs');

	if(argv ? argv.length <= 2 : false) {
		return null;
	}

	program.parse(argv);
	return {
		options: program.opts(),
		args: program.args
	}
};