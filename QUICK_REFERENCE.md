# Quick Reference: WhatsApp Setup

## 🚀 Step-by-Step Checklist

### Phase 1: Facebook Developer Setup
- [ ] Go to https://developers.facebook.com/
- [ ] Create developer account (use existing Facebook account)
- [ ] Create new app → Business type
- [ ] App name: "Your Business WhatsApp"
- [ ] Add WhatsApp product to your app

### Phase 2: Get Credentials
- [ ] **Phone Number ID**: WhatsApp → Getting Started → copy the ID number
- [ ] **Access Token**: Same page → Generate Token → copy token
- [ ] **Verify Token**: WhatsApp → Configuration → create your own (e.g., "mytoken123")

### Phase 3: Configure Webhook
- [ ] Webhook URL: `https://your-app-name.replit.app/api/whatsapp/webhook`
- [ ] Verify Token: (the one you created above)
- [ ] Subscribe to: messages, message_deliveries, message_reads, message_echoes
- [ ] Click "Verify and Save"

### Phase 4: Add to Replit
- [ ] Open Replit project
- [ ] Go to Secrets (lock icon)
- [ ] Add three secrets:
  - `WHATSAPP_ACCESS_TOKEN`
  - `WHATSAPP_PHONE_NUMBER_ID`
  - `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

### Phase 5: Test
- [ ] Create a campaign with your phone number
- [ ] Send test message
- [ ] Check your WhatsApp for the message
- [ ] Reply to test AI responses

## 📋 What You'll Copy

```
WHATSAPP_ACCESS_TOKEN = "EAABsBCS5pwcBOxxxxxxxxxxxxxxxxxxxxxx"
WHATSAPP_PHONE_NUMBER_ID = "123456789012345"
WHATSAPP_WEBHOOK_VERIFY_TOKEN = "myverifytoken123"
```

## 🔧 Your Webhook URL
Replace `your-app-name` with your actual Replit app name:
```
https://your-app-name.replit.app/api/whatsapp/webhook
```

## ⚡ Quick Test Commands
After setup, test with:
```bash
# Create campaign
curl -X POST https://your-app.replit.app/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","templateId":1,"phoneNumbers":["+1234567890"]}'

# Send messages
curl -X POST https://your-app.replit.app/api/campaigns/1/send
```

## 🆘 Common Issues

**Webhook verification fails**: Check verify token matches exactly
**Token expired**: Generate new temporary token (24hr limit)
**Phone format**: Use +1234567890 (country code + number)
**Template approval**: Start with simple utility templates

## 📞 Support
If you get stuck:
1. Check Facebook Developer Console logs
2. Check your Replit app logs
3. Verify all three credentials are correct
4. Make sure your Replit app is running