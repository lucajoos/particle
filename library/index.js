module.exports = options => {
	return {
		tokens: require('./tokens')(options),
		grammar: require('./grammar'),
		ast: require('./ast')
	}
}