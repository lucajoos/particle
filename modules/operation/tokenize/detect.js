const DEFAULT_CHECK = {
	use: /.*/,
	priority: 0,
	level: {
		set: null,
		change: 0
	}
};

module.exports = ({workspace='', library={}}) => {
	let found = [];

	// Loop through all tokens
	library.tokens.values.forEach((tag, index) => {
		tag.forEach(check => {
			// Assign default check
			check = Object.assign(DEFAULT_CHECK, check);
			const matches = workspace?.match(check.use);

			if(matches ? matches[0]?.length > 0 : false) {
				// Valid
				found.push({...check, tag: library.tokens.keys[index], match: matches[0]});
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