const { forwardTo } = require('prisma-binding');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
	async employeeSignup(parent, { data }, { query, mutation, res }, info) {
		console.log(data);
		data.email = data.email.toLowerCase();
		if (!/^(?=.*\d).{8,}$/.test(data.password))
			throw new Error('Password must be 8 characters with at least 1 number!');

		const password = await bcrypt.hash(data.password, 10);

		const user = await mutation.createEmployee(
			{
				data: {
					...data,
					password,
					startDate: new Date(),
					role: { set: data.role },
					currentEmployee: true
				}
			},
			info
		);

		const token = await jwt.sign({ userId: user.id, role: user.role }, process.env.APP_SECRET);
		res.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 10, // 1 year cookie
			domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'WILL_NEED_TO_CHANGE'
		});

		return user;
	},
	async employeeSignin(parent, { email, password }, { query, res }, info) {
		try {
			const user = await query.employee({ where: { email } });
			// if (!user) throw new Error(`No such user found for email ${email}`);

			const valid = await bcrypt.compare(password, user.password);

			// if (!valid) throw new Error('Invalid Password!');

			const token = await jwt.sign({ userId: user.id, role: user.role }, process.env.APP_SECRET);

			res.cookie('token', token, {
				httpOnly: true,
				maxAge: 1000 * 60 * 60 * 24 * 10, // 1 year long cookie bc why not. FIGHT ME
				domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'WILL_NEED_TO_CHANGE'
			});

			return user;
		} catch (e) {
			console.log(e);
		}
	},
	async createLesson(parent, args, { userId, mutation }, info) {
		if (!userId) throw new Error('hey staaahp');
		// instructor can create lessons for their schedule
		const lesson = await mutation.createLesson({
			...args.data,
			instructor: { connect: { id: userId } }
		});

		return lesson;
	},
	async createMessage(parent, args, {userId, mutation}, info) {
		if (!userId) throw new Error('hey staaahp');

		const message = await mutation.createMessage({
			data: {
			...args,
			author: {connect: {id: userId}}
			}
		}, info)
		
		return message;
	},
	async createClass(parent, args, { userId, mutation }, info) {
		// for instructors to make a class listing
		if (!userId) throw new Error("c'mon maaaannnn");

		const newClass = await mutation.createClass(
			{
				...args.classInfo,
				instructor: { connect: { id: userid } }
			},
			info
		);

		return newClass;
	},
	async createAgeGroup(parent, args, { userId, mutation }, info) {
		// maybe limit this to certain employee roles? i'm not sure how you guys wanna handle that
		const newAgeGroup = await mutation.createAgeGroup({ data: { ...args.groupDetails } });

		return newAgeGroup;
	}
};
