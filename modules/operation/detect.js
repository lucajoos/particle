module.exports = ({workspace='', library={}}) => {
	let found = [];

	library.tokens.values.forEach((tag, index) => {
		tag.forEach(check => {
			const matches = workspace?.match(check.use);

			if(matches ? matches[0]?.length > 0 : false) {
				found.push({...check, tag: library.tokens.keys[index], match: matches[0]});
			}
		})
	});

	if(found.length > 0) {
		return found.reduce((a, b) => {
			return (a?.priority > b?.priority) ? a : b;
		});
	}

	return null;
};