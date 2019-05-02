const { forwardTo } = require('prisma-binding');
module.exports = {
  instructors: forwardTo('prisma'), 
  users: forwardTo('prisma'),
  staff: forwardTo('prisma')
};
