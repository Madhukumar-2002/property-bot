const mongoose = require("mongoose");

// MongoDB connection string
const MONGO_URI = "mongodb+srv://kumarmadhu6958_db_user:60XvZ8IcOYYeVqL9@realestate-bot.fcr0mba.mongodb.net/realestate";

console.log("🔄 Testing MongoDB connection...");

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    
    // Test basic operations
    const testSchema = new mongoose.Schema({
      testField: String
    });
    const TestModel = mongoose.model("Test", testSchema);
    
    return TestModel.create({ testField: "test" });
  })
  .then(async (doc) => {
    console.log("✅ Test document created:", doc);
    
    // Clean up test document
    await mongoose.connection.db.collection("tests").drop();
    console.log("✅ Test document deleted");
    
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  })
  .catch((err) => {
    console.log("❌ MongoDB error:", err.message);
    console.log("\nPossible issues:");
    console.log("1. Check if MongoDB Atlas cluster is running");
    console.log("2. Verify IP whitelist includes your current IP (0.0.0.0/0)");
    console.log("3. Verify username and password are correct");
    console.log("4. Check if database name 'realestate' exists");
    process.exit(1);
  });
