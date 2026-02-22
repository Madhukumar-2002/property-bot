const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

/* ==========================
   MongoDB Connection
========================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Mongo Error", err));


/* ==========================
   Health Check Route
========================== */
app.get("/", (req, res) => {
    res.send("🚀 Property Bot Server Running Successfully!");
});


/* ==========================
   PORT FIX (VERY IMPORTANT)
========================== */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
