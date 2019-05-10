const { randomBytes } = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = {
	signout(parent, args, { res }, info) {
		res.clearCookie('token', {
			httpOnly: true,
			domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'WILL_NEED_TO_CHANGE'
		});

		return { message: 'Goodbye!' };
	},
	async requestReset(parent, { email, role }, { query, mutation }, info) {
		// request reset based on either employee or client role
		const user =
			role !== 'client'
				? await query.employees({ where: { email } })
				: await query.client({ where: { email } });

		if (!user) throw new Error(`No such user found for email ${email}`);
		// get a random string of numbers/letters then make it hex
		const random = await randomBytes(20);
		const resetToken = random.toString('hex');
		const resetTokenExpiry = Date.now() + 3600000; // 1 hr

		const res =
			role !== 'client'
				? await mutation.updateEmployee({
						where: { email },
						data: { resetToken, resetTokenExpiry }
				  })
				: await mutation.updateClient({
						where: { email },
						data: { resetToken, resetTokenExpiry }
				  });

		console.log(res, resetToken); // check things are set correctly
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
		const { password, confirmPassword, resetToken, role } = args;
		if (password !== confirmPassword) throw new Error('Passwords must match!');

		const [user] =
			role !== 'client'
				? await query.employees({
						where: {
							resetToken: resetToken,
							resetTokenExpiry_gte: Date.now() - 3600000 // make sure token is within 1hr limit
						}
				  })
				: await query.client({
						where: { resetToken, resetTokenExpiry_gte: Date.now() - 360000 }
				  });
		if (!user) throw new Error('This token is either invalid or expired');

		const updatedPass = await bcrypt.hash(password, 10);
		// removed token and expiry fields from either employee or client once updated
		const updatedUser =
			role !== 'client'
				? await mutation.updateEmployee({
						where: { email: user.email },
						data: {
							password: updatedPass,
							resetToken: null,
							resetTokenExpiry: null
						}
				  })
				: await mutation.updateClient({
						where: { email: user.email },
						data: { password: updatedPass, resetToken: null, resetTokenExpiry: null }
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
		const { newPassword1, newPassword2, oldPassword, role } = args;
		if (!user) throw new Error('You must be logged in!');

		if (newPassword1 !== newPassword2) throw new Error('New passwords must match!');

		// compare old password to password from user
		const samePassword = await bcrypt.compare(oldPassword, user.password);
		if (!samePassword) throw new Error('Incorrect password, please try again.');

		const newPassword = await bcrypt.hash(newPassword1, 10);
		// update password dependent on if role provided is client or not
		const updatedUser =
			role !== 'Client'
				? await mutation.updateEmployee({ where: { id: user.id }, data: { password: newPassword } })
				: await mutation.updateClient({
						where: { id: user.id },
						data: { password: newPassword }
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
