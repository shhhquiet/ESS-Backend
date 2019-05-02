const { forwardTo } = require('prisma-binding');
module.exports = {
  instructors: forwardTo('prisma') 
};
