require('../db/mongoose');
const User = require('../models/user');

const updateAgeAndCount = async (id, age) => {
  await User.findByIdAndUpdate(id, { age });
  return await User.countDocuments({ age });
};
updateAgeAndCount('60e08e9d6e60b055e4a55a01', 1)
  .then((result) => console.log(result))
  .catch((error) => console.log(error));
