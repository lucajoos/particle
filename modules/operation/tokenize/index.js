const evaluate = require('./evaluate');
const detect = require('./detect');

module.exports = ({ data, library }) => {
	const characters = data.split('');

	let structure = [];
	let workspace = '';
	let index = 0;

	// Loop through all characters
	while(index < characters.length) {
		const char = characters[index];
		workspace = `${workspace}${char}`;

		// Evaluate current token
		const tokens = evaluate({ workspace, index, library });

		if(tokens) {
			structure = [...structure, ...tokens];
			workspace = '';
		}

		if(
			(index === data.length - 1) &&
			workspace.length > 0
		) {
			// Detect last token
			const detection = detect({ workspace, library });

			structure.push({
				detection: detection ? detection : {
					use: null,
					tag: 'text',
					priority: -1,
					await: null,
					match: workspace
				},
				data: workspace,
				index: data.length - workspace.length
			});
		}

		index++;
	}

	// Add 'end' token to structure
	structure.push({
		detection: {
			use: null,
			tag: 'end',
			priority: -1,
			await: null,
			match: ''
		},
		data: '',
		index: data.length
	});

	return structure;
};