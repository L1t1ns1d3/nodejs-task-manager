const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = new express.Router();

// Create tasks endpoint
router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Read all tasks endpoint
// /tasks?completed=true||false
// /tasks?limit=1&skip=2
// /tasks?sortBy=completed_desc
router.get('/tasks', auth, async (req, res) => {
  // const _id = req.user._id;
  const match = {};
  const sort = {};
  if (req.query.completed) match.completed = req.query.completed === 'true';
  if (req.query.sortBy) {
    const queryParts = req.query.sortBy.split('_');
    sort[queryParts[0]] = queryParts[1] === 'desc' ? -1 : 1;
  }
  try {
    // const tasks = await Task.find({ owner: _id });
    // if (!req.user.tasks) return res.status(404).send();
    await req.user
      .populate({
        path: 'tasks',
        // for filtering by a key.
        match,
        // for pagination and sorting
        options: {
          limit: +req.query.limit,
          skip: +req.query.skip,
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send();
  }
});

// Read task by id endpoint
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

// Update task by id
router.patch('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  const dataToChange = req.body;
  const fieldUpdates = Object.keys(dataToChange);
  const allowedFieldsUpdates = ['description', 'completed'];
  const isValidOperation = fieldUpdates.every((field) =>
    allowedFieldsUpdates.includes(field)
  );

  if (!isValidOperation)
    return res.status(400).send({ error: 'Invalid field to update' });

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) return res.status(404).send();
    fieldUpdates.forEach((field) => (task[field] = dataToChange[field]));
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete task by id
router.delete('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    // const task = await Task.findByIdAndDelete(_id);
    // if (!task) return res.status(404).send();
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
