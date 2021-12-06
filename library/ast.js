module.exports = {
	dimensions: {
		brackets: 0
	},

	do: [{
		use: {
			statements: {
				expression: [],
				unused: [{
					detection: {
						tag: /punctuation/
					},
					data: /\(/
				}]
			},
		},

		set: {
			brackets: {
				change: 1
			}
		}
	}, {
		use: {
			statements: {
				unused: [{
					detection: {
						tag: /punctuation/
					},
					data: /\)/
				}]
			},

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