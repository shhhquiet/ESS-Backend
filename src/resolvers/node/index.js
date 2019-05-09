module.exports = {
	__resolveType(obj, ctx, info) {
		console.log(obj)
		return obj.__typename;
	}
};