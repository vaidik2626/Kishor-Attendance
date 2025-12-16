const Counter = require("../models/Counter");

async function generateHajriNumber() {
  // Atomically increment the counter for hajriNumber
  const counter = await Counter.findByIdAndUpdate(
    { _id: "hajriNumber" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return String(counter.seq).padStart(3, "0");
}

module.exports = generateHajriNumber;