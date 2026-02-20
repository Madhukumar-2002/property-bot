# WhatsApp Auto-Reply Bot Deployment TODO

## Deployment Steps

### Step 1: Security Enhancement ✅
- [x] Move WhatsApp credentials to environment variables
- [x] Update application.properties to use placeholder values
- [x] Create application-prod.properties for production

### Step 2: Git Setup
- [ ] Check git status
- [ ] Initialize git if needed
- [ ] Add all files to staging
- [ ] Commit with message "Added auto reply"

### Step 3: GitHub Integration
- [ ] Check remote repository configuration
- [ ] Add GitHub remote if not present
- [ ] Push to GitHub main branch

### Step 4: Railway Deployment
- [ ] Configure environment variables in Railway dashboard
- [ ] Deploy from GitHub
- [ ] Verify deployment logs

### Step 5: Testing
- [ ] Send test message "Hi" to WhatsApp number
- [ ] Verify "AI Reply: Hi" response received

## Environment Variables Required
- `WHATSAPP_TOKEN` - Meta WhatsApp API access token
- `WHATSAPP_PHONE_ID` - WhatsApp phone number ID

## Notes
- Webhook verification token: `my_verify_token`
- Webhook endpoint: `POST /webhook` and `GET /webhook`
- Server port: 8080
