const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  // get token from the header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  // verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    // take the request object and assign a value to the user

    req.user = decoded.user; // decoded.user will have the user from the PAYLOAD (FROM THE DATABASE)
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
