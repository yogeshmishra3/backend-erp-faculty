// backend/utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (userId , role) => {
  return jwt.sign({ userId , role }, process.env.JWT_SECRET, {
    expiresIn: '1h', // Token expiration time (you can adjust this)
  });
};

module.exports = generateToken;
