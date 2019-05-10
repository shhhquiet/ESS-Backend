const EmployeeMutations = require('./employees');
const ClientMutations = require('./clients');
const AuthMutations = require('./auth');

module.exports = {
	...AuthMutations,
	...EmployeeMutations,
	...ClientMutations
};
