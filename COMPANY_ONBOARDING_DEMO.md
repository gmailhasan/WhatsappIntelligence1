# Company Onboarding Process - Complete Demo

## How Company-A Would Be Onboarded

### Step 1: Platform Admin Creates Company

```javascript
// API Call to create Company-A
POST /api/admin/companies
{
  "name": "Company-A Medical Services",
  "domain": "company-a-medical.com",
  "status": "trial"
}

// Response:
{
  "id": 2,
  "name": "Company-A Medical Services", 
  "domain": "company-a-medical.com",
  "status": "trial",
  "createdAt": "2025-07-28T05:30:00Z"
}
```

### Step 2: Create Company Admin User

```javascript
// Create admin user for Company-A
POST /api/admin/users
{
  "companyId": 2,
  "name": "John Smith",
  "email": "admin@company-a-medical.com",
  "username": "johnsmith",
  "password": "secure123",
  "role": "company_admin"
}
```

### Step 3: Company Admin Login & Setup

```javascript
// Company admin logs in
POST /api/auth/login
{
  "username": "johnsmith",
  "password": "secure123"
}

// Gets JWT token with company context:
{
  "token": "jwt_token_here",
  "user": {
    "id": 15,
    "companyId": 2,
    "role": "company_admin",
    "name": "John Smith"
  }
}
```

### Step 4: Company WhatsApp Setup

```javascript
// Company admin configures WhatsApp API
PUT /api/companies/settings
Authorization: Bearer jwt_token_here
{
  "whatsappPhoneNumberId": "987654321098765",
  "whatsappAccessToken": "EAACompanyATokenXXXXX",
  "whatsappVerifyToken": "companya_verify_123"
}
```

### Step 5: Company Adds Their Website Content

```javascript
// Add company website for AI knowledge base
POST /api/websites
Authorization: Bearer jwt_token_here
{
  "url": "https://company-a-medical.com",
  "crawlDepth": 2
}

// System automatically crawls company-specific content
```

### Step 6: Company Creates Templates

```javascript
// Create company-specific template
POST /api/templates
Authorization: Bearer jwt_token_here
{
  "name": "Appointment Confirmation",
  "content": "Hi {{patientName}}, your appointment with Dr. {{doctorName}} is confirmed for {{date}} at {{time}}. Our clinic: {{clinicAddress}}",
  "category": "appointment",
  "variables": {
    "patientName": "Patient Name",
    "doctorName": "Doctor Name", 
    "date": "Appointment Date",
    "time": "Appointment Time",
    "clinicAddress": "Clinic Address"
  },
  "enableAI": true
}
```

### Step 7: Company Invites Team Members

```javascript
// Company admin invites team members
POST /api/companies/invite
Authorization: Bearer jwt_token_here
{
  "email": "nurse1@company-a-medical.com",
  "role": "agent",
  "name": "Sarah Johnson"
}

// Invitation email sent with signup link
```

### Step 8: Company Runs Campaigns

```javascript
// Create campaign for appointment reminders
POST /api/campaigns
Authorization: Bearer jwt_token_here
{
  "name": "Daily Appointment Reminders",
  "templateId": 5,
  "phoneNumbers": ["+1555123001", "+1555123002", "+1555123003"]
}

// Messages sent with Company-A's WhatsApp credentials
```

## Data Isolation in Action

### Company-A sees only their data:
- Templates: Only Company-A templates
- Campaigns: Only Company-A campaigns  
- Conversations: Only Company-A customer conversations
- Websites: Only Company-A website content
- Analytics: Only Company-A performance metrics

### Company-B (separate company) sees:
- Completely different set of templates
- Their own campaigns and conversations
- Their own website content
- Independent analytics

## Multi-Tenant Features

### Company Dashboard Customization:
```javascript
// Company-specific dashboard
GET /api/dashboard
Authorization: Bearer company_a_token

Response:
{
  "company": "Company-A Medical Services",
  "stats": {
    "totalMessages": 1250,        // Only Company-A's messages
    "activeCampaigns": 3,         // Only Company-A's campaigns
    "aiResponses": 890,           // Only Company-A's AI responses
    "responseRate": 78            // Only Company-A's metrics
  },
  "recentCampaigns": [...],       // Company-A campaigns only
  "activeConversations": [...]    // Company-A conversations only
}
```

### Company-Specific AI Responses:
```javascript
// When Company-A customer asks a question:
Customer: "What are your clinic hours?"

// AI searches only Company-A's website content
// Responds with Company-A's specific information
AI: "Our clinic hours are Monday-Friday 8 AM to 6 PM, Saturday 9 AM to 2 PM. We're located at 123 Medical Plaza, Suite 456."
```

## Role-Based Access Within Company

### Company Admin (John Smith):
- ✅ Manage all company settings
- ✅ Invite/remove team members
- ✅ Configure WhatsApp API
- ✅ View all campaigns and conversations
- ✅ Access company analytics

### Manager (Sarah Johnson):
- ✅ Create and manage campaigns
- ✅ Create templates
- ✅ View team conversations
- ❌ Cannot modify company settings
- ❌ Cannot invite new team members

### Agent (Nurse Staff):
- ✅ View and respond to conversations
- ✅ Send individual messages
- ❌ Cannot create campaigns
- ❌ Cannot access company settings
- ❌ Cannot view analytics

## Benefits for Company-A

### Complete Independence:
- Own WhatsApp Business API credentials
- Custom AI knowledge base with their content
- Branded experience with their company name
- Independent billing and usage metrics
- Full control over team access

### Scalability:
- Add unlimited team members
- Create unlimited campaigns
- Scale WhatsApp messaging capacity
- Expand AI knowledge base

### Security:
- Complete data isolation from other companies
- Role-based access control within company
- Audit logs for all company activities
- Secure API credential storage

This multi-tenant architecture ensures Company-A operates completely independently while sharing the same powerful platform infrastructure with other companies.