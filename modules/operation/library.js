module.exports = ({ tabLength }) => {
	return {
		tokens: {
			punctuation: [{
				use: /[():!@]$/
			}],

			meta: [{
				use: /[\t\r\n]$/,
			}],

			tab: [{
				use: new RegExp(`^\\s{${tabLength}}$`)
			}],

			comment: [{
				use: /\/\/$/,
				priority: 1
			}],

			identifier: [{
				use: /use$/
			}, {
				use: /import$/
			}]
		}, grammar: {
			expression: [{
				is: true,
				tokens: [{
					detection: {
						tag: /punctuation/
					},

					data: /@/
				}]
			}, {
				is: true,
				isSplitting: true,
				split: ' ',
				tokens: [{
					detection: {
						tag: /text/
					}
				}]
			}, {
				is: true,
				isLookahead: true,
				isOptional: true,
				tokens: [{
					detection: {
						tag: /punctuation/
					},
					data: /\(/
				}]
			}, {
				is: true,
				isRepeating: true,
				isLookahead: true,
				isOptional: true,
				tokens: [{
					detection: {
						tag: /text|punctuation|tab|comment|identifier/
					},

					data: /[^)]/
				}]
			}, {
				is: true,
				isLookahead: true,
				isOptional: true,
				tokens: [{
					detection: {
						tag: /punctuation/
					},
					data: /\)/
				}]
			}],
			break: [{
				is: false,
				isLookbehind: true,
				tokens: [{
					detection: {
						tag: /meta/
					},

					data: /\n/
				}]
			}, {
				is: true,
				tokens: [{
					detection: {
						tag: /meta/
					},

					data: /\r/
				}]
			}, {
				is: true,
				tokens: [{
					detection: {
						tag: /meta/
					},

					data: /\n/
				}]
			}],
			empty: [{
				is: true,
				isLookbehind: true,
				tokens: [{
					detection: {
						tag: /meta/
					},

					data: /\n/
				}]
			}, {
				is: true,
				tokens: [{
					detection: {
						tag: /meta/
					},

					data: /\r/
				}]
			}, {
				is: true,
				tokens: [{
					detection: {
						tag: /meta/
					},

					data: /\n/
				}]
			}],
			section: [{
				is: true,
				tokens: [{
					detection: {
						tag: /text/
					}
				}]
			}, {
				is: true,
				tokens: [{
					detection: {
						tag: /punctuation/
					},
					data: /:/
				}]
			}, {
				is: true,
				isLookahead: true,
				tokens: [{
					detection: {
						tag: /meta/,
					},
					data: /[\r\n]/
				}, {
					detection: {
						tag: /end/
					}
				}]
			}],
			command: [{
				is: true,
				tokens: [{
					detection: {
						tag: /punctuation/
					},

					data: /!/
				}]
			}, {
				is: true,
				tokens: [{
					detection: {
						tag: /identifier/
					},

					data: /[!\s]/g
				}]
			}, {
				is: true,
				isRepeating: true,
				tokens: [{
					detection: {
						tag: /text/
					}
				}, {
					detection: {
						tag: /punctuation/
					},
					data: /,/
				}]
			}, {
				is: true,
				isLookahead: true,
				tokens: [{
					detection: {
						tag: /meta/,
					},
					data: /[\r\n]/
				}, {
					detection: {
						tag: /end/
					}
				}]
			}],
			comment: [{
				is: true,
				tokens: [{
					detection: {
						tag: /comment/
					}
				}]
			}, {
				is: true,
				isRepeating: true,
				tokens: [{
					detection: {
						tag: /text|punctuation|tab|comment|identifier/
					}
				}]
			}, {
				is: true,
				isLookahead: true,
				tokens: [{
					detection: {
						tag: /meta/,
					},
					data: /[\r\n]/
				}, {
					detection: {
						tag: /end/
					}
				}]
			}]
		}
	}
}