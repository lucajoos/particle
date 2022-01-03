const r = {
	mergeDeep: (...objects) => {
		const isObject = object => object && typeof object === 'object';

		return objects.reduce((a, b) => {
			Object.keys(b).forEach(key => {
				const ak = a[key];
				const bk = b[key];

				if (Array.isArray(ak) && Array.isArray(bk)) {
					a[key] = ak.concat(...bk);
				}
				else if (isObject(ak) && isObject(bk)) {
					a[key] = r.mergeDeep(ak, bk);
				}
				else {
					a[key] = bk;
				}
			});

			return a;
		}, {});
	},

	cloneDeep: object => {
		const isObject = object => object && typeof object === 'object' && !object instanceof RegExp;
		let result = Object.assign({}, object);

		Object.keys(result).forEach(key => {
			const value = result[key];

			if(Array.isArray(value)) {
				result[key] = value.map(current => {
					if(isObject(current)) {
						return r.cloneDeep(current)
					} else {
						return current;
					}
				});
			} else if(isObject(value)) {
				result[key] = r.cloneDeep(value);
			}
		});

		return result;
	}
}

module.exports = r;