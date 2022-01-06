module.exports = [ {
	tokens: [ {
		tag: /punctuation/,
		data: /@/
	} ]
}, {
	tokens: [ {
		tag: /text/,
		data: /^[^\s]+$/
	} ]
}, {
	level: {
		id: 'root',
	},
	tokens: [{
		tag: /bracketsOpened/
	}]
}, {
	isRecursive: true,
	isRepeating: true,
	isWildcard: true,
	isOptional: true,
}, {
	level: {
		match: 'root'
	},
	tokens: [{
		tag: /bracketsClosed/
	}]
}];