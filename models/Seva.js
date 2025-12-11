const mongoose = require('mongoose');

const sevaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

const Seva = mongoose.model('Seva', sevaSchema);
module.exports = Seva;
