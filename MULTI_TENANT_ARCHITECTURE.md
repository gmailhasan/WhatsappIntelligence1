# Multi-Tenant Platform Architecture

## Overview

This document outlines how to onboard multiple companies (tenants) on the WhatsApp AI Campaign Manager platform, ensuring complete data isolation and customized experiences for each company.

## Current Single-Tenant vs Multi-Tenant

### Current (Single-Tenant):
- All data belongs to one user (userId: 1)
- Single dashboard for one company
- No user authentication
- Shared resources

### Multi-Tenant Design:
- Multiple companies with separate data
- Company-specific dashboards and settings
- User authentication and authorization
- Complete data isolation

## Multi-Tenant Database Schema

### New Tables Added:
- **Companies**: Store company information and settings
- **Users**: User accounts linked to companies
- **User Sessions**: Authentication sessions
- **Company Settings**: WhatsApp API credentials per company

### Modified Tables:
- All existing tables now reference companyId instead of userId
- Data is isolated by company

## Company Onboarding Process

### 1. Company Registration
```
Company A wants to join the platform:
1. Admin creates company account
2. Company gets unique subdomain: companya.platform.com
3. Company admin user is created
4. Company can invite team members
```

### 2. WhatsApp Integration Setup
```
Each company configures their own:
- WhatsApp Business API credentials
- Phone numbers
- Webhook endpoints (company-specific)
- Message templates
```

### 3. AI Knowledge Base Setup
```
Each company manages their own:
- Website crawling (their business websites)
- AI knowledge base (company-specific content)
- Custom AI responses and tone
```

### 4. Team Management
```
Company admin can:
- Invite team members
- Set user roles (admin, manager, agent)
- Control access permissions
```

## Data Isolation Strategy

### Company-Level Isolation:
- Each company's data is completely separate
- Queries filtered by companyId
- No cross-company data access

### User-Level Access:
- Users belong to one company
- Role-based permissions within company
- Session management per company

## Technical Implementation

### Database Changes:
```sql
-- New company table
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  whatsapp_phone_number_id TEXT,
  whatsapp_access_token TEXT,
  whatsapp_verify_token TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Modified existing tables
ALTER TABLE websites ADD COLUMN company_id INTEGER REFERENCES companies(id);
ALTER TABLE templates ADD COLUMN company_id INTEGER REFERENCES companies(id);
-- ... and so on for all tables
```

### API Changes:
```javascript
// Before: hardcoded userId = 1
const userId = 1;

// After: get from authenticated user's company
const companyId = req.user.companyId;
const campaigns = await storage.getCampaignsByCompanyId(companyId);
```

### Authentication Flow:
```
1. User logs in with email/password
2. System identifies their company
3. All API calls filtered by company
4. Dashboard shows only company data
```

## Company Onboarding Steps

### Step 1: Admin Setup
1. Platform admin creates new company record
2. Generates company admin credentials
3. Sets up company subdomain/domain
4. Configures initial settings

### Step 2: Company Admin Onboarding
1. Company admin logs in for first time
2. Completes company profile setup
3. Configures WhatsApp Business API
4. Sets up webhook endpoints
5. Uploads initial website content

### Step 3: Team Onboarding
1. Company admin invites team members
2. Team members receive invitation emails
3. They create accounts and join company
4. Admin assigns roles and permissions

### Step 4: System Configuration
1. Configure AI knowledge base with company websites
2. Create initial message templates
3. Set up first campaigns
4. Test WhatsApp integration

## Company Management Features

### Company Dashboard:
- Company-specific analytics
- Team member management
- WhatsApp API status
- Billing information

### User Roles:
- **Super Admin**: Platform management
- **Company Admin**: Full company control
- **Manager**: Campaign management
- **Agent**: View and respond to conversations

### Settings Management:
- WhatsApp API credentials
- AI configuration
- Branding customization
- Notification preferences

## Benefits for Companies

### Complete Independence:
- Own WhatsApp Business accounts
- Custom AI knowledge base
- Branded experience
- Independent billing

### Scalability:
- Add unlimited team members
- Manage multiple campaigns
- Scale WhatsApp messaging
- Grow knowledge base

### Security:
- Complete data isolation
- Role-based access control
- Audit logs per company
- Secure API credentials

## Implementation Priority

### Phase 1 (Core Multi-Tenancy):
1. Add company and user tables
2. Implement authentication
3. Modify all existing APIs
4. Add company data isolation

### Phase 2 (Advanced Features):
1. Company onboarding workflow
2. Team member management
3. Role-based permissions
4. Company settings

### Phase 3 (Enterprise Features):
1. Custom branding
2. Advanced analytics
3. API rate limiting per company
4. Custom integrations

This architecture ensures each company has a completely independent experience while sharing the same powerful platform infrastructure.