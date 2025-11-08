import Task from "../models/Task.js";

export const createTask = async (req, res) => {
  const { title, description, department, assignee, startDate, dueDate } =
    req.body;
  const beforeImage = req.file?.filename;

  try {
    const task = new Task({
      title,
      description,
      department,
      assignee,
      assignedBy: req.user._id,
      startDate,
      dueDate,
      beforeImage,
    });
    await task.save();
    await task.populate(["assignedBy", "assignee"]);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedBy", "name")
      .populate("assignee", "name");
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
