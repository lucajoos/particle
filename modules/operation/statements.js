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
		// Get each statement from library
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
			// Set level id if there is one specified
			candidates.statements[tag].level.ids[rule.level.id] = token.detection.level.current;
		}

		if(tag.length > 0) {
			if(!rule.isWildcard) {
				// Check each token in rule separately
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
			// Recursively call own function again
			result = statements({
				tokens: [...tokens, {
					detection: {
						use: null,
						tag: 'end',
						priority: -1,
						match: '',
						level: {
							current: 0,
							calculated: 0
						}
					},
					data: '',
					index: -1
				} ],
				library
			});

			// Remove 'end' token from result
			if(result[result.length - 1].tokens.slice(-1)[0].detection.tag === 'end') {
				result[result.length - 1].tokens.splice(-1);

				if(result[result.length - 1].tokens.length === 0) {
					result.splice(result.length - 1);
				}
			}
		} else {
			// Return given tokens
			result = [{
				tag: 'plain',
				tokens
			}];
		}

		return result;
	}

	// Initiate candidates
	resetCandidates({ index: tokenIndex });

	// Loop through all tokens
	while(tokenIndex < tokens.length) {
		const token = tokens[tokenIndex];

		Object.values(candidates.statements).forEach(({ tag, statement, repeat, skip }) => {
			// Calculate individual rule index
			let ruleIndex = repeat.isRepeating ? repeat.ruleIndex : tokenIndex - candidates.index - repeat.count + skip;

			// If rule exists & there are no skipped tokens
			if(statement[ruleIndex] && skip === 0) {
				let rule = standardizeRule(statement[ruleIndex]);
				const nextRule = standardizeRule(statement[ruleIndex + 1]);
				let isValid = verifyToken({ rule, token, tag });
				const isNextRuleValid = verifyToken({ rule: nextRule, token, tag});
				let isNextValid = false;

				if(
					rule.isOptional && (
						!isValid ||
						(
							rule.isWildcard && isNextRuleValid
						)
					)
				) {
					// Current token invalid or the rule is a wildcard
					// Always prioritize next rule if 'isWildcard' is true
					// Try verifying next rule
					rule = nextRule;
					ruleIndex++;
					isValid = isNextRuleValid;
					candidates.statements[tag].skip++;
					candidates.statements[tag].tokens.push([]);
				}

				if(rule.isRepeating && isValid) {
					// Start repetition
					candidates.statements[tag].repeat.tokens.push(token);
					candidates.statements[tag].repeat.isRepeating = true;
					candidates.statements[tag].repeat.ruleIndex = ruleIndex;

					if(!candidates.statements[tag].repeat.isFirst) {
						// Only increase count if there are several repeating tokens
						candidates.statements[tag].repeat.count++;
					} else {
						candidates.statements[tag].repeat.isFirst = false;
					}

					if(
						ruleIndex + 1 < statement.length &&
						tokenIndex + 1 < tokens.length
					) {
						// If there is a next token & rule
						// Verify next rule & token
						isNextValid = verifyToken({ rule: nextRule, token: tokens[tokenIndex + 1], tag});
					}

					// Check if next rule is valid or if it is the last not artificial token
					if(
						isNextValid ||
						tokenIndex + 1 === tokens.length - 1
					) {
						// Stop repetition
						candidates.statements[tag].repeat.isRepeating = false;
						candidates.statements[tag].repeat.isFirst = true;

						// Push repeating tokens to candidate
						candidates.statements[tag].tokens = candidates.statements[tag].tokens.concat(
							resolveTokens({
								rule,
								tokens: candidates.statements[tag].repeat.tokens
							})
						);

						candidates.statements[tag].repeat.tokens = [];
					}
				} else if(isValid) {
					// Regular match
					// Push tokens to candidate
					candidates.statements[tag].tokens = candidates.statements[tag].tokens.concat(
						resolveTokens({
							rule,
							tokens: [token]
						})
					);
				} else {
					// Rule is invalid
					// Remove candidate
					delete candidates.statements[tag];
				}
			} else {
				// If skip > 0, decrease skip
				candidates.statements[tag].skip--;
			}

			if(
				ruleIndex === statement.length - 1 &&
				candidates.statements[tag] &&
				!candidates.statements[tag].repeat.isRepeating
			) {
				// All rules have been verified
				// Statement found
				if(unusedTokens.length > 0) {
					result.push({
						tag: 'plain',
						tokens: unusedTokens
					});

					unusedTokens = [];
				}

				// Push candidate to result & reset candidates
				result.push(candidates.statements[tag]);
				resetCandidates({ index: tokenIndex + 1 });
			}
		});

		if(Object.values(candidates.statements).length === 0) {
			// No candidates left
			// All statements were invalid
			// Do a reset
			const index = candidates.index;
			unusedTokens.push(tokens[index]);
			resetCandidates({ index: index + 1 });

			// Jump to last verified token
			tokenIndex = index;
		}

		tokenIndex++;
	}

	if(unusedTokens.length > 0) {
		// Push remaining tokens to result
		result.push({
			tag: 'plain',
			tokens: unusedTokens
		});
	}

	return result;
};

module.exports = statements;