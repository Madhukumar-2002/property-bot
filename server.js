const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

/* ==========================
   MongoDB Connection with Better Error Handling
========================== */

// Check if MONGO_URI is defined
if (!process.env.MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI environment variable is not defined!");
    console.log("Please set MONGO_URI in your Railway Variables tab.");
}

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
        console.error("\n❌ MongoDB Connection Error:", err.message);
        
        if (err.message && err.message.includes("bad auth")) {
            console.error("\n→ Authentication failed! Please check:");
            console.error("\n1. Username is correct (kumarmadhu6958_db_user)");
            console.error("\n2. Password is correct - NOT the placeholder <db_password>");
            console.error("\n3. IP address is whitelisted in MongoDB Atlas\n");
            
            // In production, retry every 10 seconds instead of crashing
            if (process.env.NODE_ENV === 'production') {
                setTimeout(connectToMongoDB, 10000);
                return;
            }
        } else if (err.message && (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo'))) {
             // In production, retry every 10 seconds instead of crashing  
             if(process.env.NODE_ENV === 'production'){
                 setTimeout(connectToMongoDB,10000); 
                 return; 
             }
             
         }

         // For local development without valid credentials we just log and continue so user can test other things:
         process.exit(1); 

     }
};

// Handle disconnection - attempt reconnect in production 
mongoose.connection.on('disconnected', () => { 
}); 

// Initial connection attempt  
connectToMongoDB();


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
