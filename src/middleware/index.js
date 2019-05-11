const jwt = require('jsonwebtoken');
const { prisma } = require('../db');

const userObject = `{
  id
  firstName
  lastName
  email
}`;

module.exports = {
	isAuth: async function(req, res, next) {
		const { token } = req.cookies;

		if (token) {
			try {
				const { userId } = jwt.verify(token, process.env.APP_SECRET);
				req.userId = userId;
			} catch (e) {
				next(e);
			}
		}
		next();
	},

	populateUser: async function(req, res, next) {
		const id = req.userId;
		if (!id) return next();

		const user = await prisma.query.node({ where: { id } }, userObject);
		req.user = user;

		next();
	},

	errorHandler: function(err, req, res, next) {
		if (res.headersSent) return next(err);

		console.log(err);

		status = err.status || 500;
		res.status(status).json(err);
	}
};
