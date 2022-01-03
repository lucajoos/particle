const { mergeDeep } = require('../helpers');

// Defaults
const DEFAULT_RULE_TOKEN = {
	tag: /.*/,
	data: /.*/
};

const DEFAULT_RULE = {
	isRecursive: false,
	isRepeating: false,
	isWildcard: false,
	level: {
		id: null,
		change: 0,
		set: null,
		match: null,
		isAffected: true
	},
	tokens: []
};

// Candidates
let candidates = {
	startIndex: 0,
	statements: {}
};

const standardizeRule = (rule=DEFAULT_RULE) => {
	rule = mergeDeep(DEFAULT_RULE, rule);

	rule.tokens.map(ruleToken => {
		return mergeDeep(DEFAULT_RULE_TOKEN, ruleToken);
	});

	return rule;
};

const verifyToken = (rule=DEFAULT_RULE, token, tag='') => {
	let isRuleMatching = false;

	if(tag.length > 0) {
		// Verify
		if(!rule.isWildcard) {
			// Check each token in rule
			rule.tokens.forEach(ruleToken => {
				if(
					ruleToken.tag.test(token.detection.tag) &&
					ruleToken.data.test(token.data) &&
					(
						rule.level.match ? (
							typeof rule.level.match === 'number' ? (
								rule.level.match === candidates.statements[tag].level
							) : (
								typeof rule.level.match === 'string' ? (
									candidates.statements[tag].levelIds[rule.level.match] === candidates.statements[tag].level
								) : true
							)
						) : true
					)
				) {
					// Token is valid if one valid token is found
					isRuleMatching = true;
				}
			});
		} else {
			isRuleMatching = true;
		}
	}

	return isRuleMatching;
};

const applyLevelChanges = (rule=DEFAULT_RULE, tag='') => {
	if(tag.length > 0) {
		let level = candidates.statements[tag].level
		level += rule.level.change;
		level = rule.level.set ? rule.level.set : level;

		// Save level if there is a level id
		if(rule.level.id) {
			candidates.statements[tag].levelIds[rule.level.id] = level;
		}

		// Save mutated level
		candidates.statements[tag].level = level;
	}
};

const resetCandidates = ({ values, keys }, tokenIndex, level) => {
	values.forEach((statement, statementIndex) => {
		candidates.statements[
			keys[statementIndex]
			] = {
			tag: keys[statementIndex],
			tokens: [],
			skip: {
				count: 0,
				index: 0
			},
			levelIds: {},
			level,
			statement
		};
	})

	candidates.startIndex = tokenIndex;
};

const _statements = ({ tokens, library: { grammar: { values: grammarValues, keys: grammarKeys} } }) => {
	let result = [];
	let tokenIndex = 0;
	let level = 0;

	console.log(`TOKENS: ${tokens.length - 1}`)

	// Initialize candidates
	resetCandidates({ values: grammarValues, keys: grammarKeys}, tokenIndex, level);

	// Loop through all tokens
	while(tokenIndex < tokens.length) {
		const token = tokens[tokenIndex];
		console.log(`TOKEN: ${tokenIndex} [${token.detection.tag}]`)

		// Check each rule
		Object.values(candidates.statements).forEach(({ tag, statement, skip }) => {
			// Calculate current rule index
			const ruleIndex = tokenIndex - candidates.startIndex - skip.index;
			console.log(`RULE INDEX: ${ruleIndex}`)

			if(statement[ruleIndex] && skip.count === skip.index) {
				const rule = standardizeRule(statement[ruleIndex]);

				// Compare rule with token
				const isRuleMatching = verifyToken(rule, token, tag);

				if(rule.level.isAffected) {
					// Pre-calculate level changes
					applyLevelChanges(rule, tag);
				}

				// Handle repetition
				let isRepeating = rule.isRepeating;
				let repeatingIndex = 1;
				let repeatingTokens = [];

				if(isRuleMatching) {
					candidates.statements[tag].tokens.push({...token, level: candidates.statements[tag].level});
				}

				if(isRepeating && isRuleMatching) {
					let nextRule = null;

					// Get next rule
					if(ruleIndex + 1 < statement.length) {
						nextRule = standardizeRule(
							statement[ruleIndex + 1]
						);
					}

					console.log(`NEXT RULE: `);
					console.log(nextRule)

					// Add all tokens to array
					while(isRepeating) {
						const repeatingToken = tokens[tokenIndex + repeatingIndex];
						const isRepeatingRuleMatching = verifyToken(rule, repeatingToken, tag);
						let isRepeatingNextRuleMatching = false;

						console.log(`REPEATING TOKEN: ${tokenIndex + repeatingIndex} [${repeatingToken.detection.tag}]`);

						// Check next token
						if(nextRule) {
							isRepeatingNextRuleMatching = verifyToken(nextRule, repeatingToken, tag );
							console.log(isRepeatingNextRuleMatching)
						}

						if(isRepeatingRuleMatching) {
							console.log('___valid')
							// Current token is valid
							applyLevelChanges(rule, tag);
							repeatingTokens.push({...repeatingToken, level: candidates.statements[tag].level});
						}

						if(isRepeatingNextRuleMatching || !isRepeatingRuleMatching) {
							// Next rule matches token or repeating token invalid
							isRepeating = false;
						}

						// Stop loop if last token
						if(tokenIndex + repeatingIndex  === tokens.length - 1) {
							isRepeating = false;
						}

						repeatingIndex++;
					}
				}

				console.log(`RULE: ${isRuleMatching.toString()}`)

				if(!isRuleMatching) {
					// Remove candidate, rule not fulfilled
					delete candidates.statements[tag];
				} else if(repeatingTokens.length > 0) {
					// Increase skip count
					console.log(repeatingTokens)
					candidates.statements[tag].skip.count += repeatingTokens.length;
					console.log(repeatingTokens.length)

					if(rule.isRecursive && false) {
						console.log('RECURSIVE: ')
						console.log(token);

						_statements({
							tokens: [token, ...repeatingTokens],
							library: { grammar: {
								keys: grammarKeys, values: grammarValues
							} } }
						);
					}

					candidates.statements[tag].tokens = [...candidates.statements[tag].tokens, ...repeatingTokens]
				}

				if(isRuleMatching) {
					console.log('-- valid')
				}

				if(ruleIndex === statement.length - 1) {
					// Found valid statement
					console.log(candidates)
					console.log('FOUND STATEMENT: ')
					console.log(candidates.statements[tag])
					resetCandidates({ values: grammarValues, keys: grammarKeys}, tokenIndex + 1, level);
				}

				if(rule.level.isAffected) {
					// Post-calculate level changes
					applyLevelChanges(rule, tag);
				}
			} else if(skip.count !== skip.index) {
				// Decrease skip index
				candidates.statements[tag].skip.index = ++skip.index;
			}
		});

		// Reset candidates
		if(Object.values(candidates.statements).length === 0) {
			console.log('RESETTING')
			console.log(candidates.startIndex)
			const nextTokenIndex = candidates.startIndex;
			resetCandidates({ values: grammarValues, keys: grammarKeys}, nextTokenIndex + 1, level);
			tokenIndex = nextTokenIndex;
		}

		console.log('-------')

		tokenIndex++;
	}

	return result;
};

module.exports = _statements;