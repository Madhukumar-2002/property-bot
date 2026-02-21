# WhatsApp Auto-Reply Bot Deployment TODO

## Deployment Steps

### Step 1: Security Enhancement ✅
- [x] Move WhatsApp credentials to environment variables
- [x] Update application.properties to use placeholder values
- [x] Create application-prod.properties for production

### Step 2: Git Setup ✅
- [x] Check git status
- [x] Initialize git if needed
- [x] Add all files to staging
- [x] Commit with message "Added auto reply - WhatsApp webhook with environment variables"

### Step 3: GitHub Integration ✅
- [x] Check remote repository configuration
- [x] Add GitHub remote if not present
- [x] Push to GitHub (branch: blackboxai/add-whatsapp-auto-reply)


### Step 4: Railway Deployment 🚂
- [ ] Go to Railway dashboard: https://railway.app/dashboard
- [ ] Create new project or select existing project
- [ ] Deploy from GitHub repo: Madhukumar-2002/property-bot
- [ ] Select branch: blackboxai/add-whatsapp-auto-reply
- [ ] Add environment variables in Railway Variables:
  - `WHATSAPP_TOKEN` = EAAMTyMyMqdYBQ0xZC7NwXeHCknrQgf3FN43tBlo68QzpImDRZCMBDo1pji7XvpsZAsmSUqKXo5fyIFADsK5BzA9z6V7My7ZCaZAwuCxqAqu7pIHoyy09KN2Ue228laG0fMRuVgzZBZADVnDtx2D0HkXgsTtZA5YQH9aHDfIiWMZAzBxi5OPAB5JvFOV5TBcmiyoA4AMUvyMK6NXGunZAiQn8bFZCL9AaCVJjEVPnVuaXVCvHbzuN7ZBFDcwTXr5y4fpZAE7h8VqZA0vhaCfamlzHmLnQZCwlZAymRZCsIeEmhdhb7IQZDZD
  - `WHATSAPP_PHONE_ID` = 884949134712820
- [ ] Deploy and verify logs show successful startup

### Step 5: Meta Webhook Configuration 🔗
- [ ] Go to Meta Developer Dashboard: https://developers.facebook.com/
- [ ] Select your WhatsApp app
- [ ] Go to WhatsApp > Configuration
- [ ] Set webhook URL: `https://your-railway-app-url/webhook`
- [ ] Set verify token: `my_verify_token`
- [ ] Subscribe to messages webhook field
- [ ] Verify webhook connection

### Step 6: Testing ✅
- [ ] Send test message "Hi" to your WhatsApp number
- [ ] Verify "AI Reply: Hi" response received instantly
- [ ] Check Railway logs for incoming webhook data


## Environment Variables Required
- `WHATSAPP_TOKEN` - Meta WhatsApp API access token
- `WHATSAPP_PHONE_ID` - WhatsApp phone number ID

## Important Credentials (Save Securely!)
```
Token: EAAMTyMyMqdYBQ0xZC7NwXeHCknrQgf3FN43tBlo68QzpImDRZCMBDo1pji7XvpsZAsmSUqKXo5fyIFADsK5BzA9z6V7My7ZCaZAwuCxqAqu7pIHoyy09KN2Ue228laG0fMRuVgzZBZADVnDtx2D0HkXgsTtZA5YQH9aHDfIiWMZAzBxi5OPAB5JvFOV5TBcmiyoA4AMUvyMK6NXGunZAiQn8bFZCL9AaCVJjEVPnVuaXVCvHbzuN7ZBFDcwTXr5y4fpZAE7h8VqZA0vhaCfamlzHmLnQZCwlZAymRZCsIeEmhdhb7IQZDZD
Phone ID: 884949134712820
Verify Token: my_verify_token
```

## Deployment Status
✅ **Code committed and pushed to GitHub**
🚂 **Ready for Railway deployment**

## Notes
- Webhook verification token: `my_verify_token`
- Webhook endpoints: `GET /webhook` (verification), `POST /webhook` (messages)
- Server port: 8080 (Railway will auto-map)
- Flow: User → WhatsApp → Meta → Railway → Your Bot → Reply → User (24/7 automatic)
