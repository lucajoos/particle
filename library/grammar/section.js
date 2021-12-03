module.exports = [ {
	is: true,
	tokens: [ {
		detection: {
			tag: /text/
		}
	} ]
}, {
	is: true,
	tokens: [ {
		detection: {
			tag: /punctuation/
		},
		data: /:/
	} ]
}, {
	is: true,
	isLookahead: true,
	tokens: [ {
		detection: {
			tag: /meta/,
		},
		data: /[\r\n]/
	}, {
		detection: {
			tag: /end/
		}
	} ]
} ];