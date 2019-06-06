const { prisma } = require('../index');
const ageGroups = require('./seedClasses');

const seed = async () => {
	Promise.all(
		ageGroups.map(async ageGroup => {
			try {
				const seed = await prisma.mutation.createClass({
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
