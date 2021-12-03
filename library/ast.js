module.exports = {
	dimensions: {
		brackets: 0
	},

	rules: [{
		use: {
			statements: {
				expression: {},
				unused: {
					tokens: [{
						detection: 'punctuation',
						data: /\(/
					}]
				}
			},
		},

		set: {
			brackets: {
				change: 1
			}
		}
	}, {
		use: {
			dimensions: {
				brackets: {
					greater: 0
				}
			}
		},

		set: {
			brackets: {
				change: -1
			}
		}
	}]
}