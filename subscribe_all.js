const axios = require('axios');

// Replace these with your actual values
const PHONE_NUMBER_ID = 'YOUR_PHONE_NUMBER_ID';
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';

const subscribedFields = [
  "account_alerts",
  "account_review_update",
  "account_settings_update",
  "account_update",
  "automatic_events",
  "business_capability_update",
  "business_status_update",
  "calls",
  "flows",
  "group_lifecycle_update",
  "group_participants_update",
  "group_settings_update",
  "group_status_update",
  "history",
  "message_echoes",
  "message_template_components_update",
  "message_template_quality_update",
  "message_template_status_update",
  "messaging_handovers",
  "partner_solutions",
  "messages",
  "payment_configuration_update",
  "phone_number_name_update",
  "phone_number_quality_update",
  "security",
  "smb_app_state_sync",
  "smb_message_echoes",
  "template_category_update",
  "template_correct_category_detection",
  "tracking_events",
  "user_preferences"
];

async function subscribeAll() {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v24.0/${PHONE_NUMBER_ID}/subscribed_apps`,
      { subscribed_fields: subscribedFields },
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
    );
    console.log('All fields subscribed successfully:', response.data);
  } catch (error) {
    console.error('Subscription error:', error.response ? error.response.data : error.message);
  }
}

subscribeAll();
