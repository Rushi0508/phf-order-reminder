const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");

// Get todos by date
router.get("/todos", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    const todos = await Todo.find({ date }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Error fetching todos" });
  }
});

// Create new todo
router.post("/todos", async (req, res) => {
  try {
    const { text, createdBy, date } = req.body;
    if (!text || !createdBy || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const todo = new Todo({
      text,
      createdBy,
      date,
    });

    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ error: "Error creating todo" });
  }
});

// Update todo
router.put("/todo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;

    const todo = await Todo.findByIdAndUpdate(id, { $set: update }, { new: true });

    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: "Error updating todo" });
  }
});

// Delete todo
router.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findByIdAndDelete(id);

    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting todo" });
  }
});

module.exports = router;
