const identifiers = require('./identifiers');

module.exports = workspace => {
	let current;

	current = workspace.slice(-1);
	if(/[^\w\s\/]/.test(current)) {
		return {
			type: 'punctuation',
			length: current.length
		}
	} else if(/[\t\r\n]/.test(current)) {
		return {
			type: 'meta',
			length: current.length
		}
	}

	current = workspace.slice(-2);
	if(/\/\//.test(current)) {
		return {
			type: 'comment',
			length: current.length
		}
	}

	current = workspace.slice(-global.parameters.options.tab);
	if(new RegExp('\\s'.repeat(global.parameters.options.tab)).test(current)) {
		return {
			type: 'tab',
			length: current.length
		}
	}

	let foundIdentifier = null;

	identifiers.forEach(identifier => {
		if(workspace.toLowerCase().endsWith(identifier)) {
			foundIdentifier = identifier;
		}
	});

	if(foundIdentifier) {
		return {
			type: 'identifier',
			length: foundIdentifier.length
		};
	}

	return null;
};