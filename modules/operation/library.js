module.exports = ({ tabLength }) => {
	return {
		tokens: {
			punctuation: [{
				use: /[^\w\s]$/,
				await: /[\r\n]/,
				priority: 0,
			}],

			meta: [{
				use: /[\t\r\n]$/,
				priority: 0
			}],

			tab: [{
				use: new RegExp(`^\\s{${tabLength}}$`),
				priority: 0
			}],

			comment: [{
				use: /\/\/$/,
				priority: 1
			}],

			identifier: [{
				use: /!use$/,
				priority: 1
			}, {
				use: /!import$/,
				priority: 1
			}]
		}, grammar: {
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
				tokens: [{
					detection: {
						tag: /meta/,
					},
					data: /\r/
				}, {
					detection: {
						tag: /end/
					}
				}]
			}]
		}
	}
}