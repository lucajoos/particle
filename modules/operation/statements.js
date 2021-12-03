module.exports = ({ tokens, library }) => {
	let result = [];
	let unusedTokens = [];
	let index = 0;

	const DEFAULT_RULE = {
		is: true,

		isRepeating: false,
		isWildcard: false,
		isLookahead: false,
		isLookbehind: false,
		isSplitting: false,

		split: null,

		tokens: []
	};

	const DEFAULT_RULE_TOKEN = {
		detection: {
			tag: /.*/,
		},

		data: /.*/
	};

	const verify = (token, rule) => {
		let isAllowed = false;

		if(token && rule) {
			rule.tokens.forEach(ruleToken => {
				ruleToken = Object.assign({...DEFAULT_RULE_TOKEN}, ruleToken);

				if(
					ruleToken.detection.tag.test(token.detection.tag) &&
					ruleToken.data.test(token.data)
				) {
					isAllowed = true;
				}
			});
		}

		return isAllowed
	};

	while(index < tokens.length) {
		let hasFound = false;
		console.log('TOKEN: (' + index.toString() + '|' + (tokens.length - 1).toString() + ')')
		console.log(tokens[index])

		library.grammar.values.forEach((statement, statementIndex) => {
			console.log(`##STATE: ${statementIndex}`)
			let fulfilled = true;
			let lookahead = 0;
			let used = [];

			if(!hasFound) {
				let ruleIndex = 0;
				let shift = 0;
				let lookbehind = statement.filter(rule => rule?.isLookbehind === undefined ? false : rule?.isLookbehind).length;

				while(ruleIndex < statement.length) {
					const rule = Object.assign({...DEFAULT_RULE}, statement[ruleIndex]);

					let isAllowed = false;
					let isFirstRun = true;
					let repeatingIndex = 0;

					if(rule.isWildcard && rule.isRepeating) {
						throw new Error(`'isWildcard' and 'isRepeating' both 'true' on the same rule`);
					}

					console.log(`rule: ${ruleIndex} [${index + ruleIndex + repeatingIndex + shift - lookbehind}]`)

					while(isFirstRun || rule.isRepeating) {
						const tokenIndex = index + ruleIndex + repeatingIndex + shift - lookbehind;
						let token = tokens[tokenIndex];
						const isAllowedDeep = verify(token, rule);

						if((isAllowedDeep || rule.isWildcard) && isFirstRun) {
							if(rule.isLookahead) {
								lookahead++;
							} else if(!rule.isLookbehind) {
								used.push(token)
							}

							if(rule.isWildcard) {
								used.push(token);
							}

							isAllowed = true;
						} else if((isAllowedDeep || rule.isWildcard) && rule.isRepeating) {
							used.push(token)
						} else if(!isAllowedDeep && rule.isRepeating) {
							rule.isRepeating = false;
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

					if(isAllowed) {
						console.log('---allowed')
					}

					ruleIndex++;
				}

				if(fulfilled) {
					const updatedIndex = index + shift + ruleIndex - lookahead - 1 - lookbehind;
					console.log('FULFILLED')
					hasFound = true;

					if(unusedTokens.length > 0) {
						result.push({
							statement: 'unused',
							tokens: unusedTokens
						})

						unusedTokens = []
					}

					library.grammar.values[statementIndex].forEach((rule, ruleIndex) => {
						if(rule.isSplitting) {
							const token = used[ruleIndex];
							console.log('SPLITTING!')
							const data = token.data;

							const splitIndex = token.data.indexOf(rule.split);
							const splitToken = {...token};

							console.log(token.data)
							console.log(index)

							if(splitIndex !== -1) {
								token.data = data.substr(0, splitIndex);
								splitToken.data = data.substr(splitIndex);

								tokens = [...tokens.slice(0, updatedIndex + 1), splitToken, ...tokens.slice(updatedIndex + 1)];
							}
						}
					});

					result.push({
						statement: library.grammar.keys[statementIndex],
						tokens: used
					});

					index = updatedIndex;
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
					tokens: unusedTokens
				});

				unusedTokens = [];
			}
		}

		index++;
	}

	return result;
};