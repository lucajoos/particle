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
	}
}

module.exports = r;