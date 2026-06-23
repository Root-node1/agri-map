const express = require("express");
const router = express.Router();
const { authMiddleware, authorize } = require("../middleware/auth");

router.get("/", authMiddleware, (req, res) => {
  res.json({ message: "Loans route" });
});

module.exports = router;
