const { mergeDeep, cloneDeep } = require('../helpers');
const _ = require('lodash')

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

// Global helper functions
const standardizeRule = (rule=DEFAULT_RULE) => {
    rule = mergeDeep(DEFAULT_RULE, rule);

    rule.tokens.map(ruleToken => {
        return mergeDeep(DEFAULT_RULE_TOKEN, ruleToken);
    });

    return rule;
};

const resolveTokens = ({ tokens, rule, library }) => {
    let result;

    if(rule.isRecursive && false) {
        result = statements({
            tokens,
            library
        });
    } else {
        result = {
            tag: 'plain',
            tokens
        };
    }

    return result;
}

const resetCandidates = ({ index, level, candidates, library: { grammar: { keys, values }} }) => {
    candidates = _.cloneDeep(candidates);

    values.forEach((statement, statementIndex) => {
        candidates.statements[
            keys[statementIndex]
            ] = {
            tag: keys[statementIndex],
            tokens: [],
            level: {
                current: level,
                ids: {}
            },
            repeating: {
                is: false,
                tokens: [],
                totalCount: 0,
                ruleIndex: 0
            },
            statement
        };
    })

    candidates.index = index;
    return candidates;
};

const verifyToken = ({ rule = DEFAULT_RULE, token, tag = '', candidates}) => {
    let isRuleMatching = false;
    if(tag.length > 0) {
        // Verify
        if(!rule.isWildcard) {
            // Check each token in rule
            rule.tokens.forEach(ruleToken => {
                console.log(ruleToken)
                if(
                    ruleToken.tag.test(token.detection.tag) &&
                    ruleToken.data.test(token.data) &&
                    (
                        typeof rule.level.match === 'number' ? (
                            rule.level.match === candidates.statements[tag].level.current
                        ) : (
                            typeof rule.level.match === 'string' ? (
                                candidates.statements[tag].level.ids[rule.level.match] === candidates.statements[tag].level.current
                            ) : true
                        )
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

const calculateLevelChanges = ({rule = DEFAULT_RULE, tag = '', candidates}) => {
    candidates = _.cloneDeep(candidates);

    if(tag.length > 0) {
        let level = candidates.statements[tag].level.current

        // Save pre-calculated changes
        if(rule.level.id && rule.level.isAffected) {
            candidates.statements[tag].level.ids[rule.level.id] = level;
        }

        level += rule.level.change;
        level = rule.level.set ? rule.level.set : level;

        // Save post-calculated changes
        if(rule.level.id && !rule.level.isAffected) {
            candidates.statements[tag].level.ids[rule.level.id] = level;
        }

        // Save mutated level
        candidates.statements[tag].level.current = level;
    }

    return candidates;
};

const statements = ({ tokens, library }) => {
    console.log(JSON.parse(JSON.stringify({ hello: /bruh/ })))
    const { grammar: { values: grammarValues, keys: grammarKeys} } = library;

    console.log('\n\n/////////////////////')
    let result = [];
    let unusedTokens = [];
    let tokenIndex = 0;
    let level = 0;

    // Candidates object
    let candidates = {
        statements: {},
        index: 0
    };

    candidates = resetCandidates({ index: tokenIndex, level, candidates, library });

    // Loop through all tokens
    while(tokenIndex < tokens.length) {
        const token = tokens[tokenIndex];
        console.log(`\n\n######## TOKEN: ${tokenIndex} [${token.detection.tag}] #########`)

        // Loop through all statements
        Object.values(candidates.statements).forEach(({ tag, statement, repeating }, statementIndex) => {
            // TODO: calculate isRepeating index
            let ruleIndex = -1;

            if(repeating.is) {
                ruleIndex = repeating.ruleIndex;
            } else {
                ruleIndex = tokenIndex - candidates.index - repeating.totalCount;
            }

            if(statement[ruleIndex] && ruleIndex > -1) {
                console.log(`STATEMENT: ${statementIndex}; RULE: ${ruleIndex}`);
                const rule = standardizeRule(statement[ruleIndex]);

                // Compare rule with token
                const isRuleMatching = verifyToken({rule, token, tag, candidates});
                let isNextRuleMatching = false;

                if(rule.isRepeating && ruleIndex + 1 < statement.length && tokenIndex + 1 < tokens.length) {
                    console.log('CHECK NEXT RULE')
                    // Check next rule
                    const nextRule = standardizeRule(statement[ruleIndex + 1]);

                    let nextCandidates = cloneDeep(candidates);

                    if(rule.level.isAffected) {
                        nextCandidates = calculateLevelChanges({rule: nextRule, tag, candidates: nextCandidates});
                        console.log(nextCandidates.statements[tag])
                    }

                    isNextRuleMatching = verifyToken({rule: nextRule, token, tag, candidates: nextCandidates});
                    candidates.statements[tag].repeating.is = true;
                    candidates.statements[tag].repeating.ruleIndex = ruleIndex;
                }

                if(isNextRuleMatching) {
                    console.log('----NEXT RULE MATCHING')

                    repeating.is = false;
                    candidates.statements[tag].tokens.push(
                        resolveTokens({
                            tokens: candidates.statements[tag].repeating.tokens,
                            rule,
                            library: { grammar: { keys: grammarKeys, values: grammarValues }}
                        })
                    );
                    candidates.statements[tag].repeating.tokens = [];
                } else if(isRuleMatching) {
                    console.log(rule.level)
                    if(rule.level.isAffected) {
                        candidates = calculateLevelChanges({rule, tag, candidates});
                    }

                    if(rule.isRepeating) {
                        console.log('...repeating...')
                        candidates.statements[tag].repeating.totalCount++;
                        // Push token to repeating tokens
                        candidates.statements[tag].repeating.tokens.push({...token, level: candidates.statements[tag].level.current});
                    } else {
                        candidates.statements[tag].tokens.push(
                            resolveTokens({
                                tokens: [{...token, level: candidates.statements[tag].level.current}],
                                rule,
                                library: { grammar: { keys: grammarKeys, values: grammarValues }}
                            })
                        );
                    }

                    if(!rule.level.isAffected) {
                        candidates = calculateLevelChanges({rule, tag, candidates});
                    }
                    console.log(candidates.statements[tag])

                    console.log('--valid');
                } else {
                    // Remove candidate, rule not fulfilled
                    delete candidates.statements[tag];
                    console.log('--invalid');
                }

                if(
                    ruleIndex === statement.length - 1 && candidates.statements[tag]
                ) {
                    // Found valid statement
                    console.log('FOUND STATEMENT: ')
                    console.log(candidates.statements[tag])
                    if(unusedTokens.length > 0) {
                        result.push({
                            tag: 'plain',
                            tokens: unusedTokens
                        });
                    }
                    result.push(candidates.statements[tag])
                    resetCandidates({ index: tokenIndex + 1, level, candidates, library });
                    level = candidates.statements[tag].level.current;
                }
            }
        });

        // Reset candidates
        if(Object.values(candidates.statements).length === 0) {
            console.log('RESETTING')

            const index = candidates.index;

            if(tokenIndex === index) {
                unusedTokens.push(token);
            }

            resetCandidates({ index: tokenIndex + 1, level, candidates, library });
            //tokenIndex = index;
        }

        tokenIndex++;
    }

    if(unusedTokens.length > 0) {
        result.push({
            tag: 'plain',
            tokens: unusedTokens
        });
    }

    console.log('/////////////////////\n\n')
    return result;
};

module.exports = statements;