const detect = require('./detect');

module.exports = workspace => {
	const detection = detect(workspace);
	let result = null;

	if(detection) {
		if(workspace.length > 1 ? workspace.slice(0, -detection.length).length > 0 : false) {
			result = [
				{
					type: 'text',
					data: workspace.slice(0, -detection.length)
				},

				{
					type: detection.type,
					data: workspace.slice(-detection.length)
				}
			]
		} else {
			result = [{
				type: detection.type,
				data: workspace.slice(-detection.length)
			}];
		}
	}

	return result;
};