require('../db/mongoose');
const Task = require('../models/task');

const deleteTaskAndCount = async (id, completed) => {
  const task = await Task.findByIdAndDelete(id);
  const count = await Task.countDocuments({ completed });
  return { task, count };
};

deleteTaskAndCount('60e0be74a7e12b7cd918149c', false)
  .then((result) => console.log(result))
  .catch((error) => console.log(error));
