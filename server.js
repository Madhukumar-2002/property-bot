// ================= CRITICAL: JSON PARSING MUST BE FIRST =================
const express = require("express");
const app = express();

app.use(express.json());   // ⭐ VERY IMPORTANT - Must be before any route handlers
app.use(express.urlencoded({ extended: true }));

// ================= OTHER IMPORTS =================
const axios = require("axios");
const mongoose = require("mongoose");
const ExcelJS = require("exceljs");
const User = require("./models/User");


// ================= CONFIG =================
const ACCESS_TOKEN = "EAAMTyMyMqdYBQ5YtoRNdfNAXu2oNZC5U4KEMnuWtqFpreD9l6x8XEsthw5K4F6aZASWWQd8V68ZB85D38xQ4O4a1PrihJLi0wqOYptZBTWb7jJZB3g0MuEqWQMsb95CZCpCVLvhjZB3Ddtdyw4rh3BzOAiZBLVpMqbf5tg4vqkZA9XTkbD6tXDUEp3kHVZAneHDnZBTF4u27qS4t79w7mrxTpfMaCpyplHlZBgCFpkjUK7CyfZAgoeEZBIDV6ZAHJF8ZC8LTHSrDWNRH3CmsnFwTCwZAbjGvaoHGUFO5MzGqfFvs1pgZDZD";
const PHONE_NUMBER_ID = "884949134712820";
const VERIFY_TOKEN = "property_bot_secure_123";


// Demo Exotel
const EXOTEL_CALLER_ID = "08047280067";
const EXOTEL_PASSTHRU_URL = "https://YOUR-NGROK.ngrok-free.app/exotel-webhook";
const DEMO_MODE = true;

// ================= IN-MEMORY USER STORE =================
// Temporary solution - stores user sessions in memory (resets on server restart)
// TODO: Re-enable MongoDB persistence once connection is fixed
const userSessions = new Map();

// ================= MONGODB =================
mongoose
  .connect(
    "mongodb+srv://kumarmadhu6958_db_user:60XvZ8IcOYYeVqL9@realestate-bot.fcr0mba.mongodb.net/realestate"
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err.message));

// ================= HEALTH CHECK =================
app.get("/", (req, res) => res.send("✅ Property Bot Server is running"));
app.get("/health", (req, res) => res.status(200).json({ status: "UP" }));

// ================= VERIFY WEBHOOK =================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully!");
    return res.status(200).send(challenge);
  } else {
    console.log("❌ TOKEN ERROR:", token);
    return res.status(403).send("TOKEN ERROR");
  }
});


// ================= SAFE SAVE FUNCTION =================
async function safeSave(user) {
  if (user && typeof user.save === "function") {
    try {
      await user.save();
    } catch (err) {
      console.log("⚠️ user.save error:", err.message);
    }
  }
}

// ================= SEND WHATSAPP MESSAGE =================
async function sendMessage(to, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
      { messaging_product: "whatsapp", to, type: "text", text: { body: text } },
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.log("❌ WhatsApp error:", err.response?.data || err.message);
  }
}

// ================= SEND CALL BUTTON =================
async function sendCallButton(to) {
  try {
    await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: "Need to talk to our property agent?" },
          action: {
            buttons: [
              { type: "reply", reply: { id: "call_agent", title: "📞 Call Agent" } },
            ],
          },
        },
      },
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.log("❌ WhatsApp error:", err.response?.data || err.message);
  }
}

// ================= TRIGGER VOICE CALL =================
function triggerVoiceCall(toNumber) {
  let formattedNumber = toNumber.replace(/^\+/, "");
  if (!formattedNumber.startsWith("91") && formattedNumber.length === 10)
    formattedNumber = "91" + formattedNumber;

  if (DEMO_MODE) {
    console.log(`📞 [DEMO] Would initiate call to ${formattedNumber} from ${EXOTEL_CALLER_ID}`);
    axios
      .post(EXOTEL_PASSTHRU_URL, { From: formattedNumber, Status: "demo" })
      .then(() => console.log("✅ Demo webhook triggered"))
      .catch((err) => console.error("❌ Demo webhook error", err.message));
    return;
  }

  console.log(`📞 Initiating real Exotel call to ${formattedNumber}`);
  // Real Exotel API logic can go here
}

// ================= RECEIVE WHATSAPP MESSAGES =================
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value) return res.sendStatus(200);

    const message = value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message.text?.body?.trim() || "";
    const buttonId = message.interactive?.button_reply?.id;

    console.log("✅ Incoming message from:", from, "Text:", text, "Button:", buttonId);

    // ===== IN-MEMORY USER SESSION =====
    // Using Map instead of MongoDB to avoid connection issues
    let userData = userSessions.get(from);
    if (!userData) {
      userData = { step: "WELCOME" };
    }

    let reply = "";
    let sendButton = false;

    // ===== CALL AGENT BUTTON =====
    if (buttonId === "call_agent") {
      userData.step = "END";
      userData.called = true;
      userSessions.set(from, userData);
      await sendMessage(from, "✅ Our property expert will call you shortly!");
      triggerVoiceCall(from);
      return res.sendStatus(200);
    }

    // ===== GLOBAL COMMANDS =====
    if (["hi", "menu", "restart"].includes(text.toLowerCase())) {
      userData.step = "ASK_INTENT";
      reply = `👋 Welcome to Property Solutions 🏠\n\nWhat are you looking for?\n1️⃣ Buy Property\n2️⃣ Rent Property\n\nReply with 1 or 2`;
      userSessions.set(from, userData);
      await sendMessage(from, reply);
      await sendCallButton(from);
      return res.sendStatus(200);
    }

    // ===== STEP LOGIC =====
    switch (userData.step) {
      case "WELCOME":
        reply = `👋 Welcome to Property Solutions 🏠\n\n1️⃣ Buy Property\n2️⃣ Rent Property`;
        userData.step = "ASK_INTENT";
        sendButton = true;
        break;

      case "ASK_INTENT":
        if (text === "1") { userData.intent = "BUY"; userData.step = "ASK_BUDGET"; reply = "Great 👍 What is your budget? (Example: 40 lakhs)"; }
        else if (text === "2") { userData.intent = "RENT"; userData.step = "ASK_BUDGET"; reply = "Nice 🙂 What is your monthly rent budget?"; }
        else reply = "❗ Please reply with 1 or 2.";
        break;

      case "ASK_BUDGET":
        userData.budget = text;
        userData.step = "ASK_LOCATION";
        reply = `📍 Which area in Bangalore?\n1️⃣ Whitefield\n2️⃣ Electronic City\n3️⃣ Marathahalli\n4️⃣ Indiranagar\n5️⃣ Other`;
        break;

      case "ASK_LOCATION":
        const locations = { "1": "Whitefield", "2": "Electronic City", "3": "Marathahalli", "4": "Indiranagar", "5": "Other" };
        userData.location = locations[text] || "Other";
        userData.step = "ASK_NAME";
        reply = "👤 May I know your name?";
        break;

      case "ASK_NAME":
        userData.name = text;
        userData.step = "ASK_CITY";
        reply = "🌆 Which city are you currently living in?";
        break;

      case "ASK_CITY":
        userData.city = text;
        userData.step = "END";
        reply = `✅ Details saved!\nName: ${userData.name}\nCity: ${userData.city}\nIntent: ${userData.intent}\nBudget: ${userData.budget}\nLocation: ${userData.location}\n\nOur team will contact you soon 🙏\n\n👉 Type *hi* to start a new request`;
        break;

      case "END":
        reply = `ℹ️ Your request is already submitted.\n\n👉 Type *hi* to start a new request`;
        break;

      default:
        reply = "👋 Welcome! Type 'hi' to start.";
        userData.step = "WELCOME";
    }

    // Save user data to in-memory store
    userSessions.set(from, userData);
    
    await sendMessage(from, reply);
    if (sendButton) await sendCallButton(from);

    return res.sendStatus(200);

  } catch (err) {
    console.log("❌ Fatal /webhook error:", err.message || err);
    return res.sendStatus(200); // always respond 200 to WhatsApp
  }
});

// ================= EXPORT TO EXCEL =================
app.get("/export-excel", async (req, res) => {
  try {
    const users = await User.find({});
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Leads");

    sheet.columns = [
      { header: "Phone", key: "phone" },
      { header: "Name", key: "name" },
      { header: "City", key: "city" },
      { header: "Intent", key: "intent" },
      { header: "Budget", key: "budget" },
      { header: "Location", key: "location" },
    ];

    users.forEach((u) => sheet.addRow(u));
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=leads.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.log("❌ Excel export error:", err.message);
    res.sendStatus(500);
  }
});

// ================= NGROK STATUS ENDPOINT =================
// Alternative to ngrok's broken Inspect page (glyphicons 404 error)
app.get("/ngrok-status", async (req, res) => {
  try {
    const ngrokApiUrl = "http://127.0.0.1:4040/api/requests/http";
    const response = await axios.get(ngrokApiUrl, { timeout: 5000 });
    const requests = response.data.requests || [];
    
    // Format the data for display
    const formattedRequests = requests.slice(0, 20).map(req => ({
      method: req.request.method,
      path: req.request.url,
      status: req.response.status_code,
      timestamp: new Date(req.request.timestamp).toLocaleString(),
      duration: req.duration ? `${req.duration}ms` : 'N/A'
    }));
    
    res.json({
      status: "success",
      totalRequests: requests.length,
      recentRequests: formattedRequests
    });
  } catch (err) {
    // If ngrok is not running or API is unavailable
    res.json({
      status: "unavailable",
      message: "ngrok is not running or the API is not accessible",
      alternative: "Use http://127.0.0.1:4040/api/requests/http directly",
      error: err.message
    });
  }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
