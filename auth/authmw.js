/*
  JWT token check module
  This module exports a function used to check the JWT token before every
  route or group of routes.
  It reads the same configuration files as the main server, checks for the
  token existence, strips it down, verifies it against the jwt secret (ie
  checks it's digital signature) and returns:
    false + error message if cannot login
    true + token data if can
*/

// Require jwt and secret
let jwt = require('jsonwebtoken')
const config = require('../config.js')
const secret = config.secret

let checkToken = (req, res, next) => {

  // Get the token (if any)
  let token = req.headers['access-token'] || req.headers['x-access-token'] || req.headers['authorization'] 
  // Token exists ?
  if (token === null || token === undefined ){
      return res.json ({"success":false, "messate":"Auth token not supplied"})
      next()
  }
  // Strip unnecessary parts
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    // Check the token's signature against secret
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        // Invalid token
        return res.status(403).json({
          success: false,
          message: 'Token is not valid :' + err
        });
      } else {
        // Authentication succeded, return decoded token params
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