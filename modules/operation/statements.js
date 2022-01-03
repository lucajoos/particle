const _ = require('lodash');

// Defaults
const DEFAULT_RULE_TOKEN = {
	tag: /.*/,
	data: /.*/
};

const DEFAULT_RULE = {
	isRecursive: false,
	isRepeating: false,
	isWildcard: false,
	isOptional: false,
	level: {
		id: null,
		match: null
	},
	tokens: []
};

const standardizeRule = (rule=DEFAULT_RULE) => {
	rule = _.merge({}, DEFAULT_RULE, rule);

	rule.tokens = rule.tokens.map(ruleToken => {
		return _.merge({}, DEFAULT_RULE_TOKEN, ruleToken);
	});

	return rule;
};

const statements = ({ tokens, library }) => {
	console.log('\n\n/////////////////////////////////////')
	const { grammar: { keys: grammarKeys, values: grammarValues }} = library;

	let result = [];
	let unusedTokens = [];
	let tokenIndex = 0;
	let level = 0;

	let candidates = {
		statements: {},
		index: 0
	};

	// Helper functions
	const resetCandidates = ({ index }) => {
		grammarValues.forEach((statement, statementIndex) => {
			candidates.statements[
				grammarKeys[statementIndex]
				] = {
				tag: grammarKeys[statementIndex],
				tokens: [],
				level: {
					current: level,
					ids: {}
				},
				repeat: {
					isRepeating: false,
					isFirst: true,
					tokens: [],
					count: 0,
					ruleIndex: 0
				},
				skip: 0,
				statement
			};
		})

		candidates.index = index;
	};

	const verifyToken = ({ rule = DEFAULT_RULE, token, tag }) => {
		let isRuleMatching = false;

		if(rule.level.id) {
			candidates.statements[tag].level.ids[rule.level.id] = token.detection.level.current;
		}

		if(tag.length > 0) {
			if(!rule.isWildcard) {
				// Check each token in rule
				rule.tokens.forEach(ruleToken => {
					if(
						ruleToken.tag.test(token.detection.tag) &&
						ruleToken.data.test(token.data) &&
						(
							typeof rule.level.match === 'number' ? (
								rule.level.match === token.detection.level.current
							) : (
								typeof rule.level.match === 'string' ? (
									candidates.statements[tag].level.ids[rule.level.match] === token.detection.level.current
								) : true
							)
						)
					) {
						// Token is valid if one token is valid
						isRuleMatching = true;
					}
				});
			} else {
				isRuleMatching = true;
			}
		}

		return isRuleMatching;
	};

	const resolveTokens = ({ rule=DEFAULT_RULE, tokens }) => {
		let result;

		if(rule.isRecursive) {
			result = statements({
				tokens,
				library
			});
		} else {
			result = [{
				tag: 'plain',
				tokens
			}];
		}

		return result;
	}

	resetCandidates({ index: tokenIndex });

	while(tokenIndex < tokens.length) {
		const token = tokens[tokenIndex];
		console.log(`\n\n ############ TOKEN: ${tokenIndex} [${token.detection.tag}] ############`)

		Object.values(candidates.statements).forEach(({ tag, statement, repeat, skip }) => {
			let ruleIndex = repeat.isRepeating ? repeat.ruleIndex : tokenIndex - candidates.index - repeat.count;

			if(statement[ruleIndex] && skip === 0) {
				console.log(repeat.count)
				console.log(`___rule ${ruleIndex}___`)
				let rule = standardizeRule(statement[ruleIndex]);
				const nextRule = standardizeRule(statement[ruleIndex + 1]);
				let isValid = verifyToken({ rule, token, tag });
				const isNextRuleValid = verifyToken({ rule: nextRule, token, tag});

				if(rule.isOptional && isNextRuleValid) {
					console.log('--optional')
					rule = nextRule;
					isValid = isNextRuleValid;
					candidates.statements[tag].skip++;
					candidates.statements[tag].tokens.push([]);
				}

				if(rule.isRepeating && isValid) {
					console.log('--valid ...repeating...')
					// Start repetition
					candidates.statements[tag].repeat.tokens.push(token);
					candidates.statements[tag].repeat.isRepeating = true;
					candidates.statements[tag].repeat.ruleIndex = ruleIndex;

					if(!candidates.statements[tag].repeat.isFirst) {
						candidates.statements[tag].repeat.count++;
					} else {
						candidates.statements[tag].repeat.isFirst = false;
					}

					if(
						ruleIndex + 1 < statement.length &&
						tokenIndex + 1 < tokens.length
					) {
						// Verify next rule & token
						const nextToken = tokens[tokenIndex + 1];
						const isNextValid = verifyToken({ rule: nextRule, token: nextToken, tag});

						if(isNextValid) {
							console.log('STOP REPETITION')
							// Stop repetition
							candidates.statements[tag].repeat.isRepeating = false;
							candidates.statements[tag].repeat.isFirst = true;

							candidates.statements[tag].tokens = candidates.statements[tag].tokens.concat(
								resolveTokens({
									rule,
									tokens: candidates.statements[tag].repeat.tokens
								})
							);

							candidates.statements[tag].repeat.tokens = [];
						}
					}
				} else if(isValid) {
					console.log('--valid')
					// Normal match
					candidates.statements[tag].tokens = candidates.statements[tag].tokens.concat(
						resolveTokens({
							rule,
							tokens: [token]
						})
					);
				} else {
					console.log('--invalid')
					// Remove candidate
					delete candidates.statements[tag];
				}
			} else {
				candidates.statements[tag].skip--;
			}

			if(
				ruleIndex === statement.length - 1 && candidates.statements[tag]
			) {
				console.log('STATEMENT FOUND')
				// Statement found
				result.push(candidates.statements[tag]);
				resetCandidates({ index: tokenIndex + 1 });
			}
		});

		if(Object.values(candidates.statements).length === 0) {
			console.log('RESETTING')
			// No statement found
			const index = candidates.index;

			if(tokenIndex === index) {
				unusedTokens.push(token);
			}

			resetCandidates({ index: index + 1 });
			tokenIndex = index;
		}

		tokenIndex++;
	}

	if(unusedTokens.length > 0) {
		// Push remaining tokens
		result.push({
			tag: 'plain',
			tokens: unusedTokens
		});
	}
	console.log('\n\n/////////////////////////////////////')
	console.log(result)
	return result;
};

module.exports = statements;