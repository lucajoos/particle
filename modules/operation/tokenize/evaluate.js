const detect = require('./detect');

module.exports = ({ workspace='', index=-1, library={}, level=0 }) => {
	const detection = detect({ workspace, library, level });

	if(detection) {
		// Token detected
		if(workspace.length > 1 ? workspace.slice(0, -detection.match.length).length > 0 : false) {
			// There is some text before detected token
			const text = workspace.slice(0, -detection.match.length);

			return [
				{
					detection: {
						use: null,
						tag: 'text',
						priority: -1,
						match: text,
						level: {
							current: level,
							calculated: level
						}
					},
					data: text,
					index: index - text.length
				},

				{
					detection,
					data: workspace.slice(-detection.match.length),
					index
				}
			]
		} else {
			// There is no text before detected token
			return [{
				detection,
				data: workspace.slice(-detection.match.length),
				index
			}];
		}
	}
};