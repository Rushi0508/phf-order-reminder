const express = require("express");
const router = express.Router();
const Metadata = require("../models/Metadata");

// Get deadline
router.get("/deadline", async (req, res) => {
  try {
    const metadata = await Metadata.findOne();
    res.json({ deadline: metadata?.deadline || "18:00" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Set deadline
router.post("/deadline", async (req, res) => {
  try {
    const { deadline } = req.body;
    let metadata = await Metadata.findOne();

    if (metadata) {
      metadata.deadline = deadline;
      await metadata.save();
    } else {
      metadata = new Metadata({ deadline });
      await metadata.save();
    }

    res.json({ deadline: metadata.deadline });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
