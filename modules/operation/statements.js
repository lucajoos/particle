const { mergeDeep } = require('../helpers');
module.exports = ({ tokens, library }) => {
	let result = [];
	let unusedTokens = [];
	let index = 0;
	let level = 0;

	const DEFAULT_RULE = {
		is: true,

		isRepeating: false,
		isLookahead: false,
		isLookbehind: false,
		isSplitting: false,
		isOptional: false,

		split: null,
		level: {
			change: 0,
			set: null,
			isAffected: true
		},

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

		library.grammar.values.forEach((statement, statementIndex) => {
			let fulfilled = true;
			let repeating = 0;
			let optional = 0;
			let lookahead = 0;
			let behind = 0;
			let changes = [];
			let currentLevel = level;
			let used = [];

			if(!hasFound) {
				let ruleIndex = 0;
				let shift = 0;
				let lookbehind = statement.filter(rule => rule?.isLookbehind === undefined ? false : rule?.isLookbehind).length;

				while(ruleIndex < statement.length) {
					let rule = mergeDeep(DEFAULT_RULE, statement[ruleIndex]);

					let isAllowed = false;
					let isFirstRun = true;
					let repeatingIndex = 0;

					while(isFirstRun || rule.isRepeating) {
						const tokenIndex = index + ruleIndex + repeatingIndex + shift - lookbehind;

						let token = tokens[tokenIndex];
						let type = 0;
						let resolveIndex = 0;

						rule.token = tokenIndex;
						const isAllowedDeep = verify(token, rule);

						if(!isAllowedDeep && rule.isRepeating) {
							rule.isRepeating = false;

							if(repeatingIndex > 0) {
								shift = repeatingIndex - 1;
							}
						}

						if(
							((isAllowedDeep || rule.isOptional) && isFirstRun) ||
							((isAllowedDeep || rule.isOptional) && rule.isRepeating)
						) {
							if(rule.level.isAffected) {
								if(rule.level.set !== null) {
									currentLevel = rule.level.set;
								} else if(rule.level.change !== 0) {
									currentLevel += rule.level.change;
								}
							}

							if(!rule.isLookahead && !rule.isLookbehind) {
								used.push({ ...token, level: currentLevel });
								resolveIndex = used.length - 1;
							}

							if(rule.isOptional && !isAllowedDeep) {
								optional++;
							} else if(rule.isLookahead && isAllowedDeep) {
								resolveIndex = tokenIndex;
								lookahead++;
								type = 1;
							} else if(rule.isLookbehind && isAllowedDeep) {
								resolveIndex = behind;
								behind++;
								type = 2;
							}

							if(((isAllowedDeep || rule.isOptional) && isFirstRun)) {
								isAllowed = true;
							}

							if(isAllowedDeep) {
								changes.push({
									index: resolveIndex,
									type,
									level: currentLevel
								});
							}

							if(!rule.level.isAffected) {
								if(rule.level.set !== null) {
									currentLevel = rule.level.set;
								} else if(rule.level.change !== 0) {
									currentLevel += rule.level.change;
								}
							}
						}

						if(isFirstRun) {
							isFirstRun = false;
						}

						repeatingIndex++;
					}

					if(isAllowed !== rule.is) {
						fulfilled = false;
					} else {
						repeating += repeatingIndex;
					}

					ruleIndex++;
				}

				if(fulfilled) {
					const updatedIndex = index + shift + ruleIndex - optional - lookahead - lookbehind - 1;
					hasFound = true;

					if(unusedTokens.length > 0) {
						result.push({
							statement: 'unused',
							tokens: unusedTokens
						});

						unusedTokens = []
					}

					library.grammar.values[statementIndex].forEach((rule, ruleIndex) => {
						const token = used[ruleIndex];

						if(rule.isSplitting && token) {
							const data = token.data;

							const splitIndex = token.data.indexOf(rule.split);
							const splitToken = {...token};

							if(splitIndex !== -1) {
								token.data = data.substr(0, splitIndex);
								splitToken.data = data.substr(splitIndex);

								tokens = [...tokens.slice(0, updatedIndex + 1), splitToken, ...tokens.slice(updatedIndex + 1)];
								changes.splice(updatedIndex + 1);
							}
						}
					});

					let behindTokens = [];
					let currentStatementIndex = result.length - 1;
					let currentTokenIndex = result[currentStatementIndex]?.tokens?.length - 1 || 0;

					while(behindTokens.length < behind) {
						if(currentStatementIndex >= 0) {
							behindTokens.push({
								statementIndex: currentStatementIndex,
								tokenIndex: currentTokenIndex
							});

							if(currentTokenIndex === 0) {
								currentStatementIndex--;

								if(currentStatementIndex < 0) {
									break;
								}

								currentTokenIndex = result[currentStatementIndex].tokens.length;
							}

							currentTokenIndex--;
						}
					}

					behindTokens = behindTokens.reverse();

					changes.forEach(change => {
						switch (change.type) {
							case 0:
								used[change.index].level = change.level;
								break;
							case 1:
								tokens[change.index].level = change.level;
								break;
							case 2:
								const behindToken = behindTokens[change.index];
								result[behindToken.statementIndex].tokens[behindToken.tokenIndex].level = change.level;
								break;
						}
					});

					result.push({
						statement: library.grammar.keys[statementIndex],
						tokens: used
					});

					level = currentLevel;
					index = updatedIndex;
				}
			}
		});

		if(!hasFound) {
			const token = tokens[index];
			unusedTokens.push({...token, level: token.level ? token.level : level });
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