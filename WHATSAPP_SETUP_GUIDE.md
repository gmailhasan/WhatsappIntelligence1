# WhatsApp Business API Setup Guide

## Step-by-Step Setup Process

### 1. Create Facebook Developer Account
1. Go to https://developers.facebook.com/
2. Click "Get Started" and create a developer account
3. Complete the registration process

### 2. Create a New App
1. In Facebook Developer Console, click "Create App"
2. Select "Business" as the app type
3. Fill in app details:
   - App Name: "Your Business WhatsApp"
   - App Contact Email: your email
   - Business Manager Account: (optional)

### 3. Add WhatsApp Product
1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. This will add WhatsApp to your app

### 4. Configure WhatsApp Settings
1. Go to WhatsApp → Getting Started
2. Note down your:
   - **Phone Number ID** (looks like: 123456789012345)
   - **WhatsApp Business Account ID**
3. Generate an access token (temporary for testing)

### 5. Set Up Webhook
1. In WhatsApp → Configuration
2. Set Webhook URL: `https://your-domain.replit.app/api/whatsapp/webhook`
3. Set Verify Token: create a random string (e.g., "myverifytoken123")
4. Subscribe to webhook fields:
   - messages
   - message_deliveries
   - message_reads

### 6. Add Environment Variables
In your Replit project, add these secrets:
- `WHATSAPP_ACCESS_TOKEN`: Your app access token
- `WHATSAPP_PHONE_NUMBER_ID`: Your phone number ID
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`: Your webhook verify token

### 7. Create Message Templates
1. Go to WhatsApp → Message Templates
2. Create approved templates for marketing messages
3. Note template names and parameters

## Testing Your Setup

### Test Message Sending
```bash
curl -X POST http://localhost:5000/api/campaigns/1/send
```

### Test Webhook
Send a test message to your WhatsApp Business number and check logs.

## Important Notes

- **Development vs Production**: Start with test numbers
- **Rate Limits**: WhatsApp has messaging limits based on your tier
- **Template Approval**: Marketing messages need pre-approved templates
- **Business Verification**: For higher limits, verify your business

## Common Issues

1. **Invalid Phone Number**: Ensure numbers include country code (+1, +44, etc.)
2. **Template Rejection**: Follow WhatsApp's template guidelines
3. **Webhook Verification**: Make sure verify token matches
4. **Access Token Expiry**: Generate permanent tokens for production

## Ready to Go Live?

Once you have the credentials:
1. Add them to your Replit secrets
2. Restart your application
3. Test with a small campaign
4. Monitor logs for delivery confirmation

Your platform will automatically switch from development mode to production mode once the credentials are detected!