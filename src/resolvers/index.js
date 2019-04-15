const { extractFragmentReplacements } = require('prisma-binding');

const resolvers = {
	Query: require('./Query'),
	Mutation: require('./Mutation'),
	// Subscription: require('./Subscription'),
	Node: require('./Node')
};

module.exports = {
	resolvers,
	fragmentReplacements: extractFragmentReplacements(resolvers)
};
