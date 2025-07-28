# Complete Company Onboarding Process

## How Company-A Would Be Onboarded

Here's exactly how a new company (Company-A) would be onboarded to your WhatsApp AI Campaign Manager platform:

### Current Single-Tenant vs Multi-Tenant Design

**Current System (Single Company):**
- All data belongs to one company
- Single dashboard
- One set of WhatsApp credentials
- Shared AI knowledge base

**Multi-Tenant System (Multiple Companies):**
- Each company has completely separate data
- Company-specific dashboards
- Individual WhatsApp Business API credentials
- Isolated AI knowledge bases

## Step-by-Step Onboarding Process

### Step 1: Platform Admin Onboards Company-A

```javascript
// Platform admin creates Company-A
POST /api/admin/companies/onboard
{
  "companyName": "Company-A Medical Services",
  "adminName": "Dr. John Smith", 
  "adminEmail": "admin@company-a-medical.com",
  "domain": "company-a-medical"
}

// System Response:
{
  "company": {
    "id": 2,
    "name": "Company-A Medical Services",
    "domain": "company-a-medical",
    "status": "trial"
  },
  "adminUser": {
    "id": 15,
    "companyId": 2,
    "name": "Dr. John Smith",
    "email": "admin@company-a-medical.com",
    "role": "company_admin"
  },
  "loginCredentials": {
    "username": "admin9876",
    "temporaryPassword": "TempPass123"
  }
}
```

### Step 2: Company Admin Sets Up WhatsApp Integration

```javascript
// Company admin logs in and configures WhatsApp
PUT /api/companies/2/whatsapp
Authorization: Bearer company_a_admin_token
{
  "whatsappPhoneNumberId": "987654321098765",
  "whatsappAccessToken": "EAACompanyATokenXXXXX", 
  "whatsappVerifyToken": "companya_verify_123"
}
```

### Step 3: Company Adds Their Website Content

```javascript
// Add Company-A's website for AI knowledge base
POST /api/websites
Authorization: Bearer company_a_admin_token
{
  "url": "https://company-a-medical.com",
  "crawlDepth": 2
}

// System crawls only Company-A's website content
// Creates company-specific AI knowledge base
```

### Step 4: Company Creates Templates

```javascript
// Create Company-A specific template
POST /api/templates
Authorization: Bearer company_a_admin_token
{
  "name": "Appointment Confirmation",
  "content": "Hi {{patientName}}, your appointment with Dr. {{doctorName}} is confirmed for {{date}} at {{time}} at Company-A Medical Center.",
  "category": "appointment",
  "variables": {
    "patientName": "Patient Name",
    "doctorName": "Doctor Name",
    "date": "Date",
    "time": "Time"
  },
  "enableAI": true
}
```

### Step 5: Company Invites Team Members

```javascript
// Company admin invites team members
POST /api/companies/2/invite
Authorization: Bearer company_a_admin_token
{
  "name": "Nurse Sarah Johnson",
  "email": "sarah@company-a-medical.com", 
  "role": "agent"
}

// New team member gets invitation email with login credentials
```

### Step 6: Company Runs Independent Campaigns

```javascript
// Create Company-A campaign
POST /api/campaigns
Authorization: Bearer company_a_admin_token
{
  "name": "Daily Appointment Reminders",
  "templateId": 3,
  "phoneNumbers": ["+1555001001", "+1555001002", "+1555001003"]
}

// Messages sent using Company-A's WhatsApp credentials
// Customers receive messages from Company-A's WhatsApp Business number
```

## Data Isolation Example

### Company-A Dashboard (companyId: 2)
```javascript
GET /api/dashboard
Authorization: Bearer company_a_token

Response:
{
  "companyName": "Company-A Medical Services",
  "stats": {
    "totalMessages": 450,      // Only Company-A's messages
    "activeCampaigns": 3,      // Only Company-A's campaigns  
    "aiResponses": 320,        // Only Company-A's AI responses
    "responseRate": 85         // Only Company-A's metrics
  },
  "templates": [...],          // Only Company-A's templates
  "campaigns": [...],          // Only Company-A's campaigns
  "conversations": [...]       // Only Company-A's conversations
}
```

### Company-B Dashboard (companyId: 3) - Completely Separate
```javascript
GET /api/dashboard
Authorization: Bearer company_b_token

Response:
{
  "companyName": "Company-B Retail Store",
  "stats": {
    "totalMessages": 1250,     // Only Company-B's messages
    "activeCampaigns": 5,      // Only Company-B's campaigns
    "aiResponses": 890,        // Only Company-B's AI responses  
    "responseRate": 72         // Only Company-B's metrics
  },
  "templates": [...],          // Only Company-B's templates
  "campaigns": [...],          // Only Company-B's campaigns
  "conversations": [...]       // Only Company-B's conversations
}
```

## AI Knowledge Base Isolation

### Company-A Customer Question:
```
Customer: "What are your clinic hours?"

// AI searches only Company-A's website content
// Responds with Company-A specific information

AI Response: "Our clinic hours are Monday-Friday 8 AM to 6 PM, 
Saturday 9 AM to 2 PM. We're located at 123 Medical Plaza, 
Company-A Medical Center. You can reach us at (555) 001-CARE."
```

### Company-B Customer Question:
```
Customer: "What are your store hours?"

// AI searches only Company-B's website content  
// Responds with Company-B specific information

AI Response: "Our store is open Monday-Saturday 10 AM to 9 PM,
Sunday 12 PM to 6 PM. Visit us at 456 Shopping Center,
Company-B Retail Store. Call us at (555) 002-SHOP."
```

## Benefits for Each Company

### Complete Independence:
- **Own WhatsApp Business Account**: Each company uses their own phone number and API credentials
- **Custom AI Knowledge Base**: AI learns only from each company's website content
- **Separate Billing**: Each company pays for their own usage
- **Independent Team Management**: Companies manage their own users and permissions

### Scalability:
- **Unlimited Team Members**: Add as many users as needed per company
- **Multiple Campaigns**: Run simultaneous campaigns independently
- **Custom Templates**: Create company-specific message templates
- **Role-Based Access**: Different permission levels within each company

### Security:
- **Complete Data Isolation**: Company-A cannot see Company-B's data
- **Individual Authentication**: Each company has separate login system
- **Company-Specific Settings**: WhatsApp credentials stored separately
- **Audit Trails**: Track all activities per company

## Technical Implementation

The system ensures complete isolation by:

1. **Database Level**: All queries filtered by companyId
2. **API Level**: All endpoints check company authentication
3. **AI Level**: Knowledge base searches limited to company content
4. **WhatsApp Level**: Each company uses their own API credentials

This architecture allows unlimited companies to use the platform while maintaining complete independence and security.