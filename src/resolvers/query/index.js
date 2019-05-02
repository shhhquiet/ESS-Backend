const { forwardTo } = require('prisma-binding');
module.exports = {
  users: forwardTo('prisma'),
  employees: forwardTo('prisma'),
  async currentUser(parent, args, { userId, query }, info) {
		if (!userId) return null;
    console.log(userId, query)
		return query.user(
			{
				where: { id: userId },
			},
			info
		);
	},
};
