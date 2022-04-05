const { db, commonFunctions } = global;
var jwt = require('jsonwebtoken');

module.exports = function () {
  return async function(req, res, next) {

    if (!req.headers.authorization) {
      return res.http401('Authorization header missing');
    } else {
      try {
        const token = req.headers.authorization.split(' ')[1];

        const decoded = jwt.verify(token, global.kraken.get('app:jwtSecret'));
        if (!decoded) {
          return res.http401('Invalid token');
        }

          const user = await db.Users.findOne({


              _id: decoded._id

          });

        if (!user) {
          return res.http401('Invalid token');

        }
        req.user = user;
        next();
      } catch (error) {
        global.log.error(error);
        return res.http401('Invalid token');
      }
    }

  }
};
