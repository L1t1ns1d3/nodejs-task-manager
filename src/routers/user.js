const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();

// User signup
router.post('/users', async (req, res) => {
  const data = req.body;
  const user = new User(data);
  try {
    const token = await user.generateAuthToken();
    await user.save();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// User Login
router.post('/users/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    /*
      you can define your own methods into the userSchema
      by adding it to the statices prototype for the Model
      to use it for the whole Model collections

      if u wanna create a method for a specific user
      like generating web token, you have to add it
      to its own user by adding it to the methods attribute
      of the userModel.
    */
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Logout from indvidual session
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// Logout from all the sessions
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    req.status(500).send(e);
  }
});

// Read User Profile.
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

// Update user profile
router.patch('/users/me', auth, async (req, res) => {
  const dataToChange = req.body;
  const fieldUpdates = Object.keys(dataToChange);
  const allowedFieldUpdates = ['name', 'email', 'password'];
  const isValidOperation = fieldUpdates.every((field) =>
    allowedFieldUpdates.includes(field)
  );

  if (!isValidOperation)
    return res.status(400).send({ error: 'Invalid field to update!' });

  try {
    /*
      the following code is removed becuase:
      findByIdAndUpdate() method bypassed the mongoose middleware
      becuase it is not supported by the middleware queries!

      // const user = await User.findByIdAndUpdate(_id, dataToChange, {
    //   new: true,
    //   runValidators: true,
    // });
    */
    const user = req.user;
    fieldUpdates.forEach((field) => (user[field] = dataToChange[field]));
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete user by id
router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
