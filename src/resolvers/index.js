const { extractFragmentReplacements } = require('prisma-binding');

const resolvers = {
	Query: require('./query'),
	Mutation: require('./mutation'),
	User: require('./node'),
	Customer: require('./node'),
	Instruction: require('./node'),
	Staff: require('./node')
};

module.exports = {
	resolvers,
	fragmentReplacements: extractFragmentReplacements(resolvers)
};
