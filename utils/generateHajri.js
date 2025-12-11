const { Member } = require("../models/Member");

async function generateHajriNumber() {
  const count = await Member.countDocuments({ role: "KISHOR" });
  return `${String(count + 1).padStart(6, "0")}`;
}

module.exports = generateHajriNumber;