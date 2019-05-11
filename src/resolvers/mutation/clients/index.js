const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = {
	async clientSignup(parent, args, { mutation, res }, info) {
		args.email = args.email.toLowerCase();
		if (!/^(?=.*\d).{8,}$/.test(args.password))
			throw new Error('Password must be 8 characters with at least 1 number!');

		const password = await bcrypt.hash(args.password, 10);
		const user = await mutation.createClient(
			{
				data: {
					...args,
					password
				}
			},
			info
		);

		const token = await jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		res.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
			domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'WILL_NEED_TO_CHANGE'
		});

		return user;
	},
	async clientSignin(parent, { email, password }, { query, res }, info) {
		const user = await query.client({ where: { email } });
		if (!user) throw new Error(`No such user found for email ${email}`);

		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) throw new Error('Invalid Password!');

		const token = await jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		res.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year long cookie bc why not. FIGHT ME
			domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'WILL_NEED_TO_CHANGE'
		});

		return user;
	},
	async bookLesson(parent, { studentId, lessonId }, { userId, mutation }, info) {
		// have student book lesson
		if (!userId) throw new Error("c'mon maaaannnn");

		const updatedLesson = mutation.updateLesson({
			where: { id: lessonId },
			data: { client: { connect: { id: studentId } } }
		});

		return updatedLesson;
	},
	async bookClass(parent, { studentId, classId }, { mutation }, info) {
		// require userId as an argument since loggedIn user booking class may not be the student
		const classBooked = await mutation.updateClass(
			{
				data: { students: { connect: { id: studentId } } },
				where: { id: classId }
			},
			info
		);

		return classBooked;
	},
	async createStudent(parent, { studentInfo }, { userId, mutation }, info) {
		if (!userId) throw new Error("c'mon maaaannnn");

		const updatedClient = await mutation.updateClient({
			where: { id: userId },
			data: { students: { create: { ...studentInfo } } }
		});

		return updatedClient;
	},
	async addMedical(parent, { medicalInfo }, { userId, mutation }, info) {
		if (!userId) throw new Error("c'mon maaaannnn");

		const updatedStudent = await mutation.updateStudent({
			where: { id: userId },
			data: { medical: { create: { ...medicalInfo } } }
		});

		return updatedStudent;
	}
};
