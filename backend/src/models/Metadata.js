const mongoose = require("mongoose");

const metadataSchema = new mongoose.Schema({
  deadline: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Metadata", metadataSchema);
