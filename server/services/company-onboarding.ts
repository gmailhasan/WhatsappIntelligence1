import { storage } from '../storage';
import { insertCompanySchema, insertUserSchema, type Company, type User } from '@shared/schema';
import { z } from 'zod';

export interface OnboardingRequest {
  companyName: string;
  adminName: string;
  adminEmail: string;
  domain?: string;
  whatsappPhoneNumberId?: string;
  whatsappAccessToken?: string;
  whatsappVerifyToken?: string;
}

export interface OnboardingResponse {
  company: Company;
  adminUser: User;
  loginCredentials: {
    username: string;
    temporaryPassword: string;
  };
}

export class CompanyOnboardingService {
  async onboardNewCompany(request: OnboardingRequest): Promise<OnboardingResponse> {
    try {
      // Step 1: Create company record
      const companyData = insertCompanySchema.parse({
        name: request.companyName,
        domain: request.domain || this.generateDomain(request.companyName),
        whatsappPhoneNumberId: request.whatsappPhoneNumberId,
        whatsappAccessToken: request.whatsappAccessToken,
        whatsappVerifyToken: request.whatsappVerifyToken,
        status: "trial"
      });

      const company = await storage.createCompany(companyData);

      // Step 2: Create company admin user
      const username = this.generateUsername(request.adminEmail);
      const temporaryPassword = this.generatePassword();
      
      const userData = insertUserSchema.parse({
        companyId: company.id,
        name: request.adminName,
        email: request.adminEmail,
        username: username,
        password: temporaryPassword, // In production, this should be hashed
        role: "company_admin",
        status: "active"
      });

      const adminUser = await storage.createUser(userData);

      // Step 3: Set up default templates (optional)
      await this.createDefaultTemplates(company.id);

      // Step 4: Send welcome email (mock)
      await this.sendWelcomeEmail(request.adminEmail, username, temporaryPassword);

      return {
        company,
        adminUser,
        loginCredentials: {
          username,
          temporaryPassword
        }
      };
    } catch (error) {
      console.error('Error onboarding company:', error);
      throw new Error('Failed to onboard company');
    }
  }

  async inviteTeamMember(companyId: number, inviteData: {
    name: string;
    email: string;
    role: string;
  }): Promise<User> {
    const username = this.generateUsername(inviteData.email);
    const temporaryPassword = this.generatePassword();

    const userData = insertUserSchema.parse({
      companyId,
      name: inviteData.name,
      email: inviteData.email,
      username,
      password: temporaryPassword,
      role: inviteData.role,
      status: "active"
    });

    const user = await storage.createUser(userData);
    
    // Send invitation email (mock)
    await this.sendInvitationEmail(inviteData.email, username, temporaryPassword);

    return user;
  }

  async updateCompanyWhatsAppSettings(companyId: number, settings: {
    whatsappPhoneNumberId?: string;
    whatsappAccessToken?: string;
    whatsappVerifyToken?: string;
  }): Promise<Company> {
    return await storage.updateCompany(companyId, settings);
  }

  private generateDomain(companyName: string): string {
    return companyName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50);
  }

  private generateUsername(email: string): string {
    const localPart = email.split('@')[0];
    const timestamp = Date.now().toString().slice(-4);
    return `${localPart}${timestamp}`;
  }

  private generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private async createDefaultTemplates(companyId: number): Promise<void> {
    const defaultTemplates = [
      {
        companyId,
        name: "Welcome Message",
        category: "greeting",
        content: "Hi {{customerName}}! Welcome to our service. How can we help you today?",
        variables: { customerName: "Customer Name" },
        enableAI: true
      },
      {
        companyId,
        name: "Order Confirmation",
        category: "transactional", 
        content: "Hi {{customerName}}! Your order #{{orderNumber}} has been confirmed. Thank you for your business!",
        variables: { 
          customerName: "Customer Name",
          orderNumber: "Order Number"
        },
        enableAI: true
      }
    ];

    for (const template of defaultTemplates) {
      await storage.createTemplate(template);
    }
  }

  private async sendWelcomeEmail(email: string, username: string, password: string): Promise<void> {
    // Mock email sending
    console.log(`Welcome email sent to ${email}`);
    console.log(`Login credentials: ${username} / ${password}`);
    
    // In production, integrate with email service like SendGrid, AWS SES, etc.
  }

  private async sendInvitationEmail(email: string, username: string, password: string): Promise<void> {
    // Mock email sending
    console.log(`Invitation email sent to ${email}`);
    console.log(`Login credentials: ${username} / ${password}`);
  }
}

export const companyOnboardingService = new CompanyOnboardingService();