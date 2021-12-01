const evaluate = require('./evaluate');
const detect = require('./detect');

module.exports = (data, library) => {
	const characters = data.split('');

	let structure = [];
	let candidates = [];
	let await = null;
	let workspace = '';
	let index = 0;

	const resolve = () => {
		let priority = -1;

		candidates.forEach(candidate => {
			candidate.forEach(token => {
				if(token.detection.priority > priority) {
					priority = token.detection.priority
				}
			});
		});

		candidates = candidates.filter(candidate => {
			let isHigher = false;

			candidate.forEach(token => {
				if(token.detection.priority >= priority) {
					isHigher = true;
				}
			});

			return isHigher;
		});

		return candidates.reduce((a, b) => {
			return (a[a.length - 1]?.index < b[b.length - 1]?.index) ? a : b;
		});
	};

	while(index < characters.length) {
		const char = characters[index];
		workspace = `${workspace}${char}`;

		const tokens = evaluate(workspace, index, library);

		if(tokens) {
			if(!await && !tokens[tokens.length - 1].detection.await) {
				structure = [...structure, ...tokens];
				workspace = '';
			} else {
				if(!await && tokens[tokens.length - 1].detection.await) {
					await = tokens[tokens.length - 1].detection.await;
				}

				if(await ? !await.test(workspace) : true) {
					candidates.push(tokens);
				} else if(await.test(workspace)) {
					const candidate = resolve();
					structure = [...structure, ...candidate];
					workspace = '';
					candidates = [];
					await = null;
					index = candidate[candidate.length - 1].index;
				}
			}
		}

		if(
			(index === data.length - 1) &&
			workspace.length > 0
		) {
			const detection = detect(workspace, library);

			if(await && candidates.length > 0) {
				const candidate = resolve();
				structure = [...structure, ...candidate];
				workspace = '';
				candidates = [];
				await = null;
				index = candidate[candidate.length - 1].index;
			} else {
				structure.push({
					detection: detection ? detection : {
						use: null,
						tag: 'text',
						priority: -1,
						await: null,
						match: workspace
					},
					data: workspace
				});
			}
		}

		index++;
	}

	return structure;
};