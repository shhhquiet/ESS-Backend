const { extractFragmentReplacements } = require('prisma-binding');

const resolvers = {
	Query: require('./query'),
	Mutation: require('./mutation'),
	Node: require('./node')
};

module.exports = {
	resolvers,
	fragmentReplacements: extractFragmentReplacements(resolvers)
};
