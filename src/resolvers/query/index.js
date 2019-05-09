const { forwardTo } = require('prisma-binding');
module.exports = {
  users: forwardTo('prisma'),
  employees: forwardTo('prisma'),
  async currentUser(parent, args, { userId, query }, info) {
		if (!userId) return null;
		console.log(query)
		return query.node(
				{ id: userId },
			info
		);
	},
};
