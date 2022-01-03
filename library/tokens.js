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
				change: -1
			}
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
	};
}