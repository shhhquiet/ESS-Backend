const jwt = require('jsonwebtoken');
const { prisma } = require('../db');

const userObject = `{
  __typename
  ...on Employee {
    id
    firstName
    lastName
    imageURL
    role
    lessonSinglePrice
    lessonDoublePrice
    classes {
      id
      day
      time
      ageGroup {
        id
        minAge
        name
      }
      level
      price
      duration
      students {
        id
        firstName
        lastName
      }
    }
    lessons {
      id
      duration
      type
      day
      time
      open
      client {
        id
        firstName
        lastName
      }
    }
  }
  ...on Client {
    id
    firstName
    lastName
    email
    stripeId
    students {
      id
      firstName
      skill
      ageGroup {
        id
        name
        minAge
      }
      medical {
        id
        description
      }
    }
  }
}`;

module.exports = {
	isAuth: async function(req, res, next) {
		const { token } = req.cookies;

		if (token) {
			try {
				const { userId, role } = jwt.verify(token, process.env.APP_SECRET);
				req.userId = userId;
				req.role = role;
			} catch (e) {
				next(e);
			}
		}
		next();
	},

	populateUser: async function(req, res, next) {
		const id = req.userId;
		if (!id) return next();

		try {
			const user = await prisma.query.node({ id }, userObject);
			
			req.user = user;
		} catch (e) {
			console.log(e);
		}

		next();
	},

	errorHandler: function(err, req, res, next) {
		if (res.headersSent) return next(err);

		console.log(err);

		status = err.status || 500;
		res.status(status).json(err);
	}
};
