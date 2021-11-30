module.exports = workspace => {
	console.log(workspace)
	let current = workspace.slice(-1);

	if(/[^\w\s]/.test(current)) {
		return {
			type: 'punctuation',
			length: current.length
		}
	} else if(/[\t\r\n]/.test(current)) {
		return {
			type: 'meta',
			length: current.length
		}
	}

	current = workspace.slice(-global.parameters.options.tab)
	console.log(new RegExp('\\s'.repeat(global.parameters.options.tab)))
	if(new RegExp('\\s'.repeat(global.parameters.options.tab)).test(current)) {
		return {
			type: 'tab',
			length: current.length
		}
	}
};