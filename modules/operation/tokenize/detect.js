const _ = require('lodash');

const DEFAULT_CHECK = {
	use: /.*/,
	priority: 0,
	level: {
		set: null,
		change: 0,
		isPreCalculated: true
	}
};

const calculateLevelChanges = ({ check, level }) => {
	if(check.level.change !== 0) {
		level += check.level.change;
	}

	if(typeof check.level.set === 'number') {
	 	level = check.level.set;
	}

	return level;
};

module.exports = ({ workspace='', library={}, level=0 }) => {
	let found = [];

	// Loop through all tokens
	library.tokens.values.forEach((tag, index) => {
		tag.forEach(check => {
			// Assign default check
			check = _.merge({}, DEFAULT_CHECK, check);
			const matches = workspace?.match(check.use);

			// If check is valid
			if(matches ? matches[0]?.length > 0 : false) {
				// Pre-calculate level changes
				const calculatedLevel = calculateLevelChanges({ check, level });
				found.push({ check, tag: library.tokens.keys[index], match: matches[0], level: { current: check.level.isPreCalculated ? calculatedLevel : level, calculated: calculatedLevel }});
			}
		})
	});

	// Only return one token
	if(found.length > 0) {
		found = found.reduce((a, b) => {
			return (a?.priority > b?.priority) ? a : b;
		});

		return found;
	}

	return null;
};