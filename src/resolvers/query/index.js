const { forwardTo } = require('prisma-binding');

const EmployeeQueries = require('./employee');
const ClientQueries = require('./client');

module.exports = {
	users: forwardTo('prisma'),
	employees: forwardTo('prisma'),
	lessons: forwardTo('prisma'),
	classes: forwardTo('prisma'),

	...EmployeeQueries,
	...ClientQueries,

	async currentUser(parent, args, { userId, query }, info) {
		if (!userId) return null;
		console.log(query);

		return query.node({ id: userId }, info);
	}
};
