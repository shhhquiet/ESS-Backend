const { prisma } = require('../index');
const ageGroups = require('./seedLessons');

const seed = async () => {
	Promise.all(
		ageGroups.map(async ageGroup => {
			try {
				const seed = await prisma.mutation.createLesson({
					data: {
						...ageGroup
					}
				});
				return seed;
			} catch (err) {
				throw new Error(err.message);
			}
		})
	).catch(e => console.log(e));
};

seed();
