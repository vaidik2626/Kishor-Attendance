const express = require("express");
const router = express.Router();
const { createEventResponse } = require("../controllers/eventResponseController");

// Submit an event response
// Be tolerant to clients that send JSON without the JSON content-type
router.post("/", express.text({ type: "*/*" }), (req, res, next) => {
	if (typeof req.body === "string") {
		try {
			req.body = JSON.parse(req.body);
		} catch (_) {
			// keep as string; controller will handle
		}
	}
	next();
}, createEventResponse);

module.exports = router;
