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

		if(token && rule) {
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
		}

		return {
			isAllowed,
			used
		}
	};

	while(index < tokens.length) {
		let hasFound = false;

		library.grammar.values.forEach((statement, statementIndex) => {
			let fulfilled = true;
			let lookahead = 0;
			let used = [];

			if(!hasFound) {
				if(index < tokens.length) {
					let ruleIndex = 0;
					let shift = 0;

					while(ruleIndex < statement.length) {
						const rule = statement[ruleIndex];

						let isAllowed = false;
						let isRepeating = rule?.isRepeating === undefined ? false : rule?.isRepeating;
						let isLookahead = rule?.isLookahead === undefined ? false : rule?.isLookahead;
						let isFirstRun = true;
						let repeatingIndex = 0;

						while(isFirstRun || isRepeating) {
							const { isAllowed: isAllowedDeep, used: usedDeep } = verify(tokens[index + ruleIndex + repeatingIndex + shift], statement[ruleIndex]);

							if(isAllowedDeep && isFirstRun) {
								if(!isLookahead) {
									used = [...used, ...usedDeep];
								} else {
									lookahead++;
								}

								isAllowed = true;
							} else if(isAllowedDeep && isRepeating) {
								if(!isLookahead) {
									used = [...used, ...usedDeep];
								} else {
									lookahead++;
								}
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
						hasFound = true;

						if(unusedTokens.length > 0) {
							result.push({
								statement: 'unused',
								tokens: unusedTokens
							})

							unusedTokens = []
						}

						result.push({
							statement: library.grammar.keys[statementIndex],
							tokens: used
						});

						index = index + shift + ruleIndex - lookahead - 1;
					}
				}
			}
		});

		if(!hasFound) {
			unusedTokens.push(tokens[index]);
		}

		if(index === tokens.length - 1) {
			if(unusedTokens.length > 0) {
				result.push({
					statement: 'unused',
					tokens: unusedTokens,
					index: index
				});

				unusedTokens = [];
			}
		}

		index++;
	}

	return result;
};