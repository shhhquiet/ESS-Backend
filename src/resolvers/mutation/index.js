const { forwardTo } = require('prisma-binding');
const { randomBytes } = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = {
	async signup(parent, args, { query, mutation, res }, info) {
		args.email = args.email.toLowerCase();
		if (!/^(?=.*\d).{8,}$/.test(args.password)) {
			throw new Error('Password must be 8 characters with at least 1 number!');
		}

		const password = await bcrypt.hash(args.password, 10);
		const user = await mutation.createUser(
			{
				data: {
					...args,
					password
					// permissions: 'FREE', // default permission for user is FREE tier
					// img: {
					// 	create: {
					// 		img_url:
					// 			'https://res.cloudinary.com/dcwn6afsq/image/upload/v1552598409/up4/autftv4fj3l7qlkkt56j.jpg', // default avatar img if none provided
					// 		default: true
					// 	}
					// }
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
	async signin(parent, { email, password }, { query, res }, info) {
		const user = await query.user({ where: { email } });

		if (!user) throw new Error(`No such user found for email ${email}`);

		const valid = await bcrypt.compare(password, user.password);

		if (!valid) throw new Error('Invalid Password!');

		const token = await jwt.sign({ userId: user.id }, process.env.APP_SECRET);

		res.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year long cookie bc why not. FIGHT ME
			domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'WILL_NEED_TO_CHANGE'
		});

		return user;
	},
	signout(parent, args, { res }, info) {
		res.clearCookie('token', {
			httpOnly: true,
			domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'WILL_NEED_TO_CHANGE'
		});

		return { message: 'Goodbye!' };
	},
	async requestReset(parent, { email }, { query, mutation }, info) {
		const user = await query.user({ where: { email } });
		if (!user) {
			throw new Error(`No such user found for email ${email}`);
		}
		// get a random string of numbers/letters then make it hex
		const random = await randomBytes(20);

		const resetToken = random.toString('hex');
		const resetTokenExpiry = Date.now() + 3600000; // 1 hr
		// const res = mutation.updateUser({
		// 	where: { email },
		// 	data: { resetToken, resetTokenExpiry }
		// });
		// // console.log(res, resetToken); // check things are set correctly
		// const mailRes = await transport.sendMail({
		// 	from: 'support@up4.life',
		// 	to: user.email,
		// 	subject: 'Your Password Reset Token',
		// 	html: formatEmail(`Your Password Reset Token is here!
		//   \n\n
		//   <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`)
		// });

		return { message: 'Thanks!' };
	},
	async resetPassword(parent, args, { query, mutation, res }, info) {
		const { password, confirmPassword, resetToken } = args;
		if (password !== confirmPassword) throw new Error('Passwords must match!');

		const [user] = await query.users({
			where: {
				resetToken: resetToken,
				resetTokenExpiry_gte: Date.now() - 3600000 // make sure token is within 1hr limit
			}
		});
		if (!user) throw new Error('This token is either invalid or expired');

		const updatedPass = await bcrypt.hash(password, 10);
		// removed token and expiry fields from user once updated
		const updatedUser = await mutation.updateUser({
			where: { email: user.email },
			data: {
				password: updatedPass,
				resetToken: null,
				resetTokenExpiry: null
			}
		});
		const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);

		res.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365,
			domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'WILL_NEED_TO_CHANGE'
		});

		return updatedUser;
	},
	async internalPasswordReset(parent, args, { user, res, mutation }, info) {
		const { newPassword1, newPassword2, oldPassword } = args;
		if (!user) throw new Error('You must be logged in!');

		if (newPassword1 !== newPassword2) throw new Error('New passwords must match!');

		// compare oldpassword to password from user
		const samePassword = await bcrypt.compare(oldPassword, user.password);
		if (!samePassword) throw new Error('Incorrect password, please try again.');
		const newPassword = await bcrypt.hash(newPassword1, 10);

		// update password
		const updatedUser = await mutation.updateUser({
			where: { id: user.id },
			data: {
				password: newPassword
			}
		});
		const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);

		res.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365,
			domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'WILL_NEED_TO_CHANGE'
		});

		return updatedUser;
	}
};
