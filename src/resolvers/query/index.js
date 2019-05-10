const { forwardTo } = require('prisma-binding');
module.exports = {
	users: forwardTo('prisma'),
	employees: forwardTo('prisma'),
	lessons: forwardTo('prisma'),
	classes: forwardTo('prisma'),
	async currentUser(parent, args, { userId, query }, info) {
		if (!userId) return null;
		console.log(query);
		return query.node({ id: userId }, info);
	},
	async fullSchedule(parent, args, { user, query }, info) {
		// that'll be there to block the route when we wanna block it
		// if (!user.role === 'ADMIN') throw new Error('You must be an admin to access this data');
		try {
			const lessons = await query.lessons();
			const classes = await query.classes();

			return { lessons, classes };
		} catch (e) {
			throw new Error(`Oops something bad happened: ${e}`);
		}
	}
};
