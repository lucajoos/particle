module.exports = [ {
	is: true,
	tokens: [ {
		detection: {
			tag: /comment/
		}
	} ]
}, {
	is: true,
	isRepeating: true,
	tokens: [ {
		detection: {
			tag: /text|punctuation|tab|comment|identifier/
		}
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