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

	const verify = (token, rule) => {
		let used = [];
		let isAllowed = false;

		rule.tokens.forEach(ruleToken => {
			ruleToken = Object.assign({...DEFAULT_RULE_TOKEN}, ruleToken);

			if(
				ruleToken.detection.tag.test(token.detection.tag) &&
				ruleToken.data.test(token.data)
			) {
				isAllowed = true;
				used.push(token);
			}
		});

		return {
			isAllowed,
			used
		}
	};

	while(index < tokens.length) {
		let used = [];
		let fulfilled = true;

		library.grammar.values.forEach((statement, statementIndex) => {
			if(index + statement.length <= tokens.length) {
				let ruleIndex = 0;
				let shift = 0;

				while(ruleIndex < statement.length) {
					const rule = statement[ruleIndex];

					let isAllowed = false;
					let isRepeating = rule?.isRepeating || false;
					let isFirstRun = true;
					let repeatingIndex = 0;

					while(isFirstRun || isRepeating) {
						const { isAllowed: isAllowedDeep, used: usedDeep } = verify(tokens[index + ruleIndex + repeatingIndex + shift], statement[ruleIndex]);

						if(isAllowedDeep && isFirstRun) {
							used = [...used, ...usedDeep];
							isAllowed = true;
						} else if(isAllowedDeep && isRepeating) {
							used = [...used, ...usedDeep];
						} else if(!isAllowedDeep && isRepeating) {
							isRepeating = false;
							shift = repeatingIndex - 1;
						}

						if(isFirstRun) {
							isFirstRun = false;
						}

						repeatingIndex++;
					}

					if(isAllowed !== rule.is) {
						fulfilled = false;
					}

					ruleIndex++;
				}

				if(fulfilled) {
					if(unusedTokens.length > 0) {
						result.push({
							statement: 'unused',
							tokens: unusedTokens,
							index: index - used.length
						});

						unusedTokens = [];
					}

					result.push({
						statement: library.grammar.keys[statementIndex],
						tokens: used,
						index
					});

					index = index + used.length - 1;
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