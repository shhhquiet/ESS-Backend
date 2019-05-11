module.exports = {
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
	},
	async instructorLessons(parent, args, { userId, query }, info) {
		if (!userId) throw new Error('uh oh');

		const lessons = await query.lessons({ where: { instructor: { id: userId } } }, info);

		return lessons;
	},
	async instructorClasses(parent, args, { userId, query }, info) {
		if (!userId) throw new Error('uh oh');

		const classes = await query.classes({ where: { instructor: { id: userId } } }, info);

		return classes;
	}
};
