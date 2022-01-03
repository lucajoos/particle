const util = require('util');
const statements = ({ tokens, library }) => {
	console.log(util.inspect(tokens, false, 4, true))
	return null;
};

module.exports = statements;