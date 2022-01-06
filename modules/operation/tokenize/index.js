const evaluate = require('./evaluate');
const detect = require('./detect');

module.exports = ({ data, library }) => {
	const characters = data.split('');

	let structure = [];
	let workspace = '';
	let index = 0;
	let level = 0;

	// Loop through all characters
	while(index < characters.length) {
		const char = characters[index];
		workspace = `${workspace}${char}`;

		// Evaluate current token
		const tokens = evaluate({ workspace, index, library, level });

		if(tokens ? tokens.length > 0 : false) {
			// Set global level to last set level
			level = tokens[tokens.length - 1].detection.level.calculated;
			structure = [...structure, ...tokens];
			workspace = '';
		}

		if(
			(index === data.length - 1) &&
			workspace.length > 0
		) {
			// Detect last token
			const detection = detect({ workspace, library, level });

			structure.push({
				detection: detection ? detection : {
					use: null,
					tag: 'text',
					priority: -1,
					match: workspace,
					level: {
						current: level,
						calculated: level
					}
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
			match: '',
			level: {
				current: 0,
				calculated: 0
			}
		},
		data: '',
		index: data.length
	});

	return structure;
};