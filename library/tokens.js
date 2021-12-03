module.exports = ({ tabLength }) => {
	return {
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
	};
}