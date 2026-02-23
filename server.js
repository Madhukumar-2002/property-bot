const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

// WhatsApp Message Sending Function
const sendWhatsAppMessage = async (to, text) => {
    try {
        await axios.post(
            `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: to,
                text: { body: text },
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("✅ Reply sent!");
    } catch (error) {
        console.error("❌ Error sending reply:", error.response?.data || error.message);
    }
};

// WhatsApp Webhook Verify Token - READ FROM ENVIRONMENT VARIABLE
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
console.log("🔐 VERIFY_TOKEN loaded from env:", VERIFY_TOKEN);

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
   WhatsApp Webhook Routes
========================== */

// GET webhook - for Meta verification
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("📥 Webhook verification request:");
    console.log("  - Mode:", mode);
    console.log("  - Token from Meta:", token);
    console.log("  - Our VERIFY_TOKEN:", VERIFY_TOKEN);
    console.log("  - Match:", token === VERIFY_TOKEN);

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ Webhook Verified Successfully!");
        res.status(200).send(challenge);
    } else {
        console.log("❌ Webhook Verification Failed!");
        res.status(403).send("Verification failed");
    }
});

// POST webhook - for receiving WhatsApp messages
app.post("/webhook", (req, res) => {
    const body = req.body;
    
    console.log("📩 Webhook Received:", JSON.stringify(body, null, 2));
    
    // Check if this is a WhatsApp message
    if (body.object === "whatsapp_business_account") {
        const entries = body.entry || [];
        
        for (const entry of entries) {
            const changes = entry.changes || [];
            for (const change of changes) {
                const messages = change.value?.messages || [];
                for (const message of messages) {
                    const from = message.from;
                    const text = message.text?.body;

                    console.log("💬 Message from:", from);
                    console.log("📝 Message:", text);

                    // AUTO REPLY
                    sendWhatsAppMessage(from, "Hello 👋 Property Bot here! How can I help you?");
                }
            }
        }
        
        res.status(200).send("OK");
    } else {
        res.status(404).send("Not Found");
    }
});


/* ==========================
   PORT FIX (VERY IMPORTANT)
========================== */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
