# Complete Facebook Developer Console Setup for WhatsApp

## Step 1: Create Facebook Developer Account

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com/
   - Click "Get Started" in the top right
   - Log in with your Facebook account (or create one)

2. **Complete Developer Registration**
   - Accept the Developer Terms
   - Verify your account (phone/email if required)
   - You'll see the Developer Dashboard

## Step 2: Create Your WhatsApp Business App

1. **Create New App**
   - Click "Create App" button
   - Select "Business" as the app type
   - Click "Next"

2. **Fill App Details**
   - App Name: "Your Business WhatsApp" (or your business name)
   - App Contact Email: your email address
   - Business Manager Account: Leave blank for now
   - Click "Create App"

## Step 3: Add WhatsApp to Your App

1. **Add WhatsApp Product**
   - In your app dashboard, scroll down to "Add Products to Your App"
   - Find "WhatsApp" and click "Set Up"
   - This adds WhatsApp to your app's products

2. **WhatsApp Setup Page**
   - You'll see the WhatsApp setup page
   - This is where you'll get your credentials

## Step 4: Get Your Phone Number ID

1. **Navigate to Getting Started**
   - In the left sidebar, click "WhatsApp" → "Getting Started"
   - You'll see a phone number listed (usually a test number)

2. **Copy Phone Number ID**
   - Look for "Phone Number ID" (not the phone number itself)
   - It's a long number like: 123456789012345
   - Copy this - this is your `WHATSAPP_PHONE_NUMBER_ID`

## Step 5: Generate Access Token

1. **Generate Token**
   - On the same "Getting Started" page
   - Find "Temporary Access Token" section
   - Click "Generate Access Token"
   - Copy the token (starts with "EAA...")
   - This is your `WHATSAPP_ACCESS_TOKEN`

   **Important**: This is temporary (24 hours). For production, you'll need a permanent token.

## Step 6: Set Up Webhook

1. **Go to Configuration**
   - Click "WhatsApp" → "Configuration" in the sidebar
   - Find "Webhook" section

2. **Configure Webhook**
   - Callback URL: `https://your-app-name.replit.app/api/whatsapp/webhook`
   - Verify Token: Create your own (e.g., "myverifytoken123")
   - This is your `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

3. **Subscribe to Webhook Fields**
   - Check these boxes:
     - ✅ messages
     - ✅ message_deliveries  
     - ✅ message_reads
     - ✅ message_echoes

## Step 7: Test Your Setup

1. **Add Credentials to Replit**
   - In Replit, go to Secrets (lock icon)
   - Add your three credentials:
     - `WHATSAPP_ACCESS_TOKEN`
     - `WHATSAPP_PHONE_NUMBER_ID`
     - `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

2. **Verify Webhook**
   - Back in Facebook Console, click "Verify and Save"
   - Facebook will ping your webhook endpoint
   - Check your Replit logs for "WhatsApp webhook verified"

## Step 8: Create Message Templates

1. **Go to Message Templates**
   - Click "WhatsApp" → "Message Templates"
   - Click "Create Template"

2. **Template Example**
   - Name: "welcome_message"
   - Category: "UTILITY"
   - Language: "English (US)"
   - Template: "Hello {{1}}! Welcome to our service."
   - Submit for approval

## Step 9: Test Real Messaging

1. **Send Test Message**
   - Use your platform to create a campaign
   - Add your own phone number (with country code)
   - Send a test message

2. **Check Delivery**
   - Message should appear in your WhatsApp
   - Reply to test the AI response system

## Common Issues & Solutions

**Webhook Verification Failed**
- Check your verify token matches exactly
- Ensure your Replit app is running
- Verify the webhook URL is correct

**Access Token Expired**
- Generate a new temporary token
- For production, create a permanent token

**Phone Number Not Working**
- Include country code (+1, +44, etc.)
- Remove spaces and special characters
- Use format: +1234567890

**Template Rejected**
- Follow WhatsApp's template guidelines
- Avoid promotional language
- Keep templates simple and clear

## Next Steps for Production

1. **Get Business Verified**
   - Complete Facebook Business Verification
   - Increases messaging limits significantly

2. **Create Permanent Access Token**
   - Generate long-lived tokens for production
   - Set up proper token refresh system

3. **Scale Your Templates**
   - Create templates for different use cases
   - Get them approved by WhatsApp team

Your WhatsApp Business API is now ready to send real messages to customers!