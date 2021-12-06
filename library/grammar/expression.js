module.exports = [ {
	is: true,
	tokens: [ {
		detection: {
			tag: /punctuation/
		},

		data: /@/
	} ]
}, {
	is: true,
	isSplitting: true,
	split: ' ',
	tokens: [ {
		detection: {
			tag: /text/
		}
	} ]
}, {
	is: true,
	isLookahead: true,
	isOptional: true,
	level: {
		isAffected: false,
		change: 1
	},
	tokens: [ {
		detection: {
			tag: /punctuation/
		},
		data: /\(/
	} ]
}, {
	is: true,
	isRepeating: true,
	isLookahead: true,
	isOptional: true,
	tokens: [ {
		detection: {
			tag: /text|punctuation|tab|comment|identifier/
		},

		data: /[^)]/
	} ]
}, {
	is: true,
	isLookahead: true,
	isOptional: true,

	level: {
		change: -1
	},

	tokens: [ {
		detection: {
			tag: /punctuation/
		},
		data: /\)/
	} ]
} ];