const DEFAULT_TOKEN = {
	detection: {
		tag: /.*/
	},

	data: /.*/
}

module.exports = ({ statements, library }) => {
	let dimensions = library.ast.dimensions;

	const splitObject = object => {
		return {
			keys: Object.keys(object),
			values: Object.values(object),
			self: object
		}
	};

	statements.forEach(current => {
		library.ast.do.forEach(handler => {
			const use = splitObject(handler.use);
			const set = splitObject(handler.set);

			let conditions = {
				statements: []
			};

			use.values.forEach((rule, ruleIndex) => {
				const ruleType = use.keys[ruleIndex];

				console.log(ruleType)

				if(ruleType === 'statements') {
					const statements = splitObject(rule);

					statements.values.forEach((statement, statementIndex) => {
						const statementKey = statements.keys[statementIndex];

						if(statement.length > 0) {
							statement.forEach(token => {
								token = Object.assign({...DEFAULT_TOKEN}, token)
							})
						} else {

						}
					})
				} else if(ruleType === 'dimensions') {
				}
			});

			console.log(use)
		});
	})

	return {
		dimensions: library.ast.dimensions
	}
};