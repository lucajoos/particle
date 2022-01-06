module.exports = ({ tabLength }) => {
	return {
		punctuation: [{
			use: /[:!@]$/
		}],

		bracketsOpened: [{
			use: /\($/,
			level: {
				change: 1
			}
		}],

		bracketsClosed: [{
			use: /\)$/,
			level: {
				change: -1,
				isPreCalculated: false
			}
		}],

		meta: [{
			use: /[\r\n]$/,
			level: {
				set: 0
			}
		}],

		tab: [{
			use: new RegExp(`^\\s{${tabLength}}$`),
			level: {
				change: 1
			}
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
	};
}