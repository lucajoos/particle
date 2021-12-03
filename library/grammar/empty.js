module.exports = [ {
	is: true,
	isLookbehind: true,
	tokens: [ {
		detection: {
			tag: /meta/
		},

		data: /\n/
	} ]
}, {
	is: true,
	tokens: [ {
		detection: {
			tag: /meta/
		},

		data: /\r/
	} ]
}, {
	is: true,
	tokens: [ {
		detection: {
			tag: /meta/
		},

		data: /\n/
	} ]
} ];