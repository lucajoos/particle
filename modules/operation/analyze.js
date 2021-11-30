const tokenize = require('./tokenize');
const detect = require('./detect');

module.exports = data => {
	const characters = data.split('');

	let structure = [];
	let workspace = '';

	characters.forEach((char, index) => {
		const result = tokenize(workspace);

		if(result) {
			structure = [...structure, ...result];
			workspace = '';
		}

		workspace = `${workspace}${char}`;

		if(
			(index === data.length - 1) &&
			workspace.length > 0
		) {
			const type = detect(workspace);

			structure.push({
				type: type ? type : 'text',
				data: workspace
			});
		}
	});

	return structure;
};