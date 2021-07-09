const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      default: 0,
      // custom validator
      validate(value) {
        if (value < 0) throw new Error('Age must be positive number!');
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error('Email is invalid!');
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (value.toLowerCase().includes('password'))
          throw new Error('Password cannot contain "password" keyword');
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Adding virtual property which is a relationship between two entities
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner',
});

// custom method on all user collections
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Unable to login!');
  const isMatchedPassword = await bcrypt.compare(password, user.password);
  if (!isMatchedPassword) throw new Error('Unable to login!');
  return user;
};

// generate jwt for every user [custom method for a specific user.]
userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ _id: this._id.toString() }, 'test', {
    expiresIn: '7 days',
  });
  // this.tokens = this.tokens.concat({ token });
  this.tokens.push({ token });
  await this.save();
  return token;
};

// override the user object to only return some data.
userSchema.methods.toJSON = function () {
  // getting the raw data.
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  return user;
};

// Hash the plain text password before saving using pre hook middleware.
userSchema.pre('save', async function (next) {
  // check if the user password is being modified [create/update user].
  if (this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 8);
  // calling next method to move the control execution from the middleware.
  next();
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  await Task.deleteMany({ owner: this._id });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
