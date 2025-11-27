const mongoose = require('mongoose');

const saintSchema = new mongoose.Schema({
  tag: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
});

const Saint = mongoose.model('Saint', saintSchema);

module.exports = Saint;
