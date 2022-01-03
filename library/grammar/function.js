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
		change: 1,
		id: 'root',
		isAffected: false
	},
	tokens: [{
		tag: /punctuation/,
		data: /\(/
	}]
}, {
	isRecursive: true,
	isRepeating: true,
	isWildcard: true
}, {
	level: {
		change: -1,
		match: 0,
		isAffected: false
	},
	tokens: [{
		tag: /punctuation/,
		data: /\)/
	}]
}];