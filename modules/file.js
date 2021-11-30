const path = require('path');
const fs = require('fs/promises');

module.exports = {
	read: async (location, options={ encoding: 'utf-8' }) => {
		return fs.readFile(path.resolve(location), options);
	},

	write: async (location, data, options={ encoding: 'utf-8' }) => {
		return fs.writeFile(path.resolve(location), data, options);
	}
};