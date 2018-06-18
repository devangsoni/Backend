
/* Requier npm packages */
const jwt = require('jsonwebtoken');

/* Requier config constants */
const config = require('./../config/config.constants');

exports.validateToken = function (req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

  // decode token
  if (token) {
    // verifies secret
    jwt.verify(token, config.secret, function (err, decodedData) {
      if (err) {
        return res.status(403).json({ status: 'Failure', message: 'Invalid Token' });
      } else {
        // if everything is good, save to request for use in other routes        if (decodedData.generatedTime) {
        var currentDate = new Date();
        var generatedDate = new Date(decodedData.generatedTime);
        var minutes = (currentDate.getTime() - generatedDate.getTime()) / (60 * 1000);
        console.log(minutes);
        if (minutes > 15 || (minutes < 0 && minutes > -1395)) {
          return res.status(403).json({ status: 'Fail', message: 'Token is expired, Please login again' });
        } else {
          req.decodedData = decodedData;
          next();
        }
      }
    }
    });
} else {
  // if there is no token
  return res.status(403).json({ status: 'Failure', message: 'Invalid Token' });
}
};

