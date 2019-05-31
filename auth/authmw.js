let jwt = require('jsonwebtoken')
const config = require('../config.js')
const secret = config.secret

let checkToken = (req, res, next) => {

  // Get the token (if any)
  let token = req.headers['access-token'] || req.headers['x-access-token'] || req.headers['authorization'] 
  
  if (token === null || token === undefined ){
      return res.json ({"success":false, "messate":"Auth token not supplied"})
      next()
  }

  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    // Check the token  
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Token is not valid :' + err
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
     // No token ?? 
    return res.json({
      success: false,
      message: 'Auth token not supplied'
    });
  }
};

module.exports = {
  checkToken: checkToken
}