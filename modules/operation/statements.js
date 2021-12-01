module.exports = ({ tokens, library }) => {
	let result = [];
	let unusedTokens = [];
	let index = 0;

	const DEFAULT_RULE_TOKEN = {
		detection: {
			tag: /.*/,
		},

		data: /.*/
	};

	console.log(tokens.length)
	while(index < tokens.length) {
		let usedTokens = [];

		library.grammar.values.forEach((statement, statementIndex) => {
			if(index + statement.length <= tokens.length) {
				let fulfilled = true;
				let ruleIndex = 0;

				while(ruleIndex < statement.length) {
					const rule = statement[ruleIndex];

					const verifyToken = tokens[index + ruleIndex];
					let found = false;

					rule.tokens.forEach(ruleToken => {
						ruleToken = Object.assign({...DEFAULT_RULE_TOKEN}, ruleToken);

						if(
							ruleToken.detection.tag.test(verifyToken.detection.tag) &&
							ruleToken.data.test(verifyToken.data)
						) {
							found = true;
							usedTokens.push(verifyToken);
						}
					});

					if(found !== rule.is) {
						fulfilled = false;
					}

					ruleIndex++;
				}

				if(fulfilled) {
					if(unusedTokens.length > 0) {
						result.push({
							statement: 'unused',
							tokens: unusedTokens,
							index: index - usedTokens.length
						});

						unusedTokens = [];
					}

					result.push({
						statement: library.grammar.keys[statementIndex],
						tokens: usedTokens,
						index
					});

					// Skip used tokens
					index = index + usedTokens.length - 1;
				} else {
					unusedTokens.push(tokens[index]);
				}
			}
		});

		if(index === tokens.length - 1) {
			if(unusedTokens.length > 0) {
				result.push({
					statement: 'unused',
					tokens: unusedTokens,
					index: index - usedTokens.length
				});

				unusedTokens = [];
			}
		}

		index++;
	}

	return result;
};