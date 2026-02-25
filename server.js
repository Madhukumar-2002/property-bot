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

// ================= EXOTEL CONFIGURATION =================
// Default values from Exotel Dashboard - can be overridden in Railway Variables
const EXOTEL_SID = process.env.EXOTEL_SID || "propertysolutionsbot1";
const EXOTEL_API_KEY = process.env.EXOTEL_API_KEY || "306a874ce5f368be87ac85da895e3e27c59b642db4c6abde";
const EXOTEL_API_TOKEN = process.env.EXOTEL_API_TOKEN || "490e332016c4f97cced11b12d4c3235da57d22b6af27e890";
const EXOTEL_NUMBER = process.env.EXOTEL_NUMBER || "08047280067";
// Agent number - set in Railway Variables or use default
const AGENT_NUMBER = process.env.AGENT_NUMBER || "9876543210";

console.log("📞 Exotel SID:", EXOTEL_SID);
console.log("📞 Exotel Number:", EXOTEL_NUMBER);
console.log("📞 Agent Number:", AGENT_NUMBER || "NOT SET - Please set AGENT_NUMBER in Railway");

// Function to connect user to agent via Exotel Click-to-Call
const connectToAgent = async (userPhone) => {
    if (!AGENT_NUMBER) {
        console.error("❌ AGENT_NUMBER not configured!");
        return { success: false, error: "Agent number not configured" };
    }

    try {
        console.log(`📞 Initiating click-to-call: User ${userPhone} -> Agent ${AGENT_NUMBER}`);
        
        const auth = Buffer.from(`${EXOTEL_API_KEY}:${EXOTEL_API_TOKEN}`).toString('base64');
        
        const response = await axios.post(
            `https://api.exotel.com/v1/Accounts/${EXOTEL_SID}/Calls/connect.json`,
            {
                From: userPhone,
                To: AGENT_NUMBER,
                CallerId: EXOTEL_NUMBER,
                TimeOut: 30,
                Priority: "high"
            },
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );
        
        console.log("✅ Call initiated successfully:", response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("❌ Error connecting to agent:", error.response?.data || error.message);
        return { success: false, error: error.message };
    }
};

// ================= VAPI.AI AI AGENT CONFIGURATION =================
const connectToAIAgent = async (userPhone) => {
    try {
        // Convert to E.164 format (+91 for India)
        const formattedPhone = "+91" + userPhone.replace(/^91/, "");
        console.log(`🤖 Calling AI Agent for ${formattedPhone}`);

        const response = await axios.post(
            "https://api.vapi.ai/call",
            {
                assistantId: process.env.VAPI_ASSISTANT_ID,
                phoneNumber: "+12408506128",
                customer: {
                    number: formattedPhone
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ AI Call Started:", response.data);
        return { success: true };
    } catch (error) {
        console.error("❌ AI Call Error:", error.response?.data || error.message);
        return { success: false };
    }
};

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
            console.error("\n1. Username is correct");
            console.error("\n2. Password is correct");
            console.error("\n3. IP address is whitelisted in MongoDB Atlas\n");
        }
        
        // In production, retry every 10 seconds instead of crashing - KEEP SERVER RUNNING
        if (process.env.NODE_ENV === 'production') {
            console.log("🔄 Retrying MongoDB connection in 10 seconds...");
            setTimeout(connectToMongoDB, 10000);
            return;
        }

        // For local development without valid credentials we just log and continue:
        console.log("⚠️ Continuing without MongoDB connection...");
     }
};

// Handle disconnection - attempt reconnect in production 
mongoose.connection.on('disconnected', () => { 
    console.log("⚠️ MongoDB disconnected - attempting reconnect...");
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
app.post("/webhook", async (req, res) => {
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
                    const text = message.text?.body.toLowerCase().trim();

                    console.log("💬 Message from:", from);
                    console.log("📝 Message:", text);

                    // ✅ STEP 1 — PROPERTY FLOW WELCOME MESSAGE
                    const welcomeMessage = 
                        "🏠 *Welcome to Property Solutions Bot!* \n\n" +
                        "I can help you with:\n\n" +
                        "1️⃣ Buy Property\n" +
                        "2️⃣ Rent Property\n" +
                        "3️⃣ Sell Property\n" +
                        "4️⃣ Talk to Agent\n\n" +
                        "👉 Please reply with a number (1-4)";

                    // 🚀 STEP 2 — CHAT FLOW LOGIC
                    let replyMessage;
                    
                    if (text === "1") {
                        replyMessage = "🏡 Great! You want to BUY property.\n\nPlease tell me:\nCity + Budget";
                    }
                    else if (text === "2") {
                        replyMessage = "🏠 You want RENT property.\n\nSend:\nCity + Monthly Rent Budget";
                    }
                    else if (text === "3") {
                        replyMessage = "📢 You want to SELL property.\n\nSend:\nLocation + Property Type";
                    }
                    else if (text === "4") {
                        // 🚀 TALK TO AGENT - Connect to AI Agent via Vapi.ai
                        console.log(`🤖 User requested AI agent. Phone: ${from}`);

                        const callResult = await connectToAIAgent(from);

                        if (callResult.success) {
                            replyMessage = "🤖 Our AI property expert is calling you now. Please answer the call.";
                        } else {
                            replyMessage = "⚠️ Unable to connect AI agent. Please try again later.";
                        }
                    }
                    else {
                        // Default welcome message for new users or invalid input
                        replyMessage = welcomeMessage;
                    }

                    // Send the appropriate reply
                    sendWhatsAppMessage(from, replyMessage);
                }
            }
        }
        
        res.status(200).send("OK");
    } else {
        res.status(404).send("Not Found");
    }
});


// ================= EXOTEL VOICE BOT (FIXED) =================

app.post("/exotel-voice", async (req, res) => {
  const caller = req.body.From || req.body.CallerID || "Unknown";
  
  console.log("📞 Incoming Voice Call From:", caller);

  // ✅ FIXED: Proper XML response with correct content-type
  // Increased timeout to 10 seconds for better voice recording
  const responseXML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="female" language="en-IN">
        Hello! Welcome to Property Solutions.
        Please tell me your property requirement after the beep.
        For buying property say buy. For renting property say rent.
    </Say>
    <Record timeout="10" maxLength="30" />
</Response>`;

  res.set("Content-Type", "text/xml");
  res.send(responseXML);
});

// ================= VOICE PROCESSING API =================

app.post("/process-voice", async (req, res) => {
  console.log("🎤 Voice Recording URL:", req.body.RecordingUrl);
  console.log("🎤 Call Duration:", req.body.Duration);

  // Thank the caller after recording
  const responseXML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="female" language="en-IN">
        Thank you. Our property expert will contact you shortly.
        Have a great day! Good bye.
    </Say>
</Response>`;

  res.set("Content-Type", "text/xml");
  res.send(responseXML);
});

/* ==========================
   PORT FIX (VERY IMPORTANT)
========================== */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 WhatsApp Webhook: /webhook`);
    console.log(`📞 Exotel Voice: /exotel-voice`);
});
