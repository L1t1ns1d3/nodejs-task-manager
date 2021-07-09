const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    // TODO: handling the length issue.
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, 'test');
    // get the user that has the id and STILL has the token in its token list
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });
    if (!user) throw new Error();

    // pass the actual user to the route handler.
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate!' });
  }
};

module.exports = auth;
