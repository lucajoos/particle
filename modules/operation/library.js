module.exports = ({ tabLength }) => {
	return {
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
	}
}