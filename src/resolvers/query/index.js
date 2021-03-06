const { forwardTo } = require('prisma-binding');

const EmployeeQueries = require('./employee');
const ClientQueries = require('./client');

module.exports = {
	users: forwardTo('prisma'),
	employees: forwardTo('prisma'),
	lessons: forwardTo('prisma'),
	classes: forwardTo('prisma'),
	messages: forwardTo('prisma'),
	
	...EmployeeQueries,
	...ClientQueries,

	async currentUser(parent, args, { userId, user, query }, info) {
		if (!userId) return null;

		return query.node({ id: userId }, info);
	}
};
