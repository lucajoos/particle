const detect = require('./detect');

module.exports = (workspace, index) => {
	const detection = detect(workspace);

	if(detection) {
		if(workspace.length > 1 ? workspace.slice(0, -detection.match.length).length > 0 : false) {
			const text = workspace.slice(0, -detection.match.length);

			return [
				{
					detection: {
						use: null,
						tag: 'text',
						priority: -1,
						await: null,
						match: text
					},
					data: text
				},

				{
					detection,
					data: workspace.slice(-detection.match.length),
					index
				}
			]
		} else {
			return [{
				detection,
				data: workspace.slice(-detection.match.length),
				index
			}];
		}
	}
};