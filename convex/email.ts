import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";
import { api } from "./_generated/api";

// Email templates and service for deal assignment notifications

export const sendDealAssignmentEmail = action({
  args: {
    dealId: v.id("deals"),
    partnerEmail: v.string(),
    partnerName: v.string(),
    partnerCompanyName: v.string(),
    assignedBy: v.string(),
    assignmentNotes: v.optional(v.string()),
    dealDetails: v.object({
      customerName: v.string(),
      opportunityAmount: v.number(),
      expectedCloseDate: v.number(),
      cameraCount: v.optional(v.number()),
      interestedUsecases: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
      commissionRate: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    const appUrl = process.env.VITE_APP_URL || "https://partner.visionify.ai";
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY environment variable is not set");
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    if (!args.partnerEmail) {
      console.error("Partner email is empty:", args.partnerEmail);
      throw new Error("Partner email is required");
    }

    const resend = new Resend(resendApiKey);
    
    // Calculate commission
    const commissionRate = args.dealDetails.commissionRate || 20;
    const commission = (args.dealDetails.opportunityAmount * commissionRate) / 100;
    
    // Format expected close date
    const expectedCloseDate = new Date(args.dealDetails.expectedCloseDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create use cases list
    const useCasesList = args.dealDetails.interestedUsecases
      ? args.dealDetails.interestedUsecases.map(useCase => `<li style="margin: 4px 0; color: #374151;">${useCase}</li>`).join('')
      : '<li style="margin: 4px 0; color: #374151;">No specific use cases mentioned</li>';

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Deal Assignment - Visionify</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
      
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
            🎯 New Deal Assignment
          </h1>
          <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 16px;">
            Visionify Partner Portal
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          
          <p style="font-size: 18px; color: #1f2937; margin: 0 0 24px 0;">
            Hi <strong>${args.partnerName}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #4b5563; margin: 0 0 24px 0; line-height: 1.6;">
            Great news! <strong>${args.assignedBy}</strong> has assigned you a new deal opportunity. Here are the details:
          </p>
          
          <!-- Deal Details Card -->
          <div style="background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0;">
            
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
              📊 Deal Details
            </h3>
            
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="font-weight: 600; color: #374151;">Customer:</span>
                <span style="color: #1f2937;">${args.dealDetails.customerName}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="font-weight: 600; color: #374151;">Potential Value:</span>
                <span style="color: #059669; font-weight: 700; font-size: 18px;">$${args.dealDetails.opportunityAmount.toLocaleString()}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="font-weight: 600; color: #374151;">Your Commission (${commissionRate}%):</span>
                <span style="color: #7c3aed; font-weight: 700; font-size: 18px;">$${commission.toLocaleString()}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="font-weight: 600; color: #374151;">Expected Close:</span>
                <span style="color: #1f2937;">${expectedCloseDate}</span>
              </div>
              
              ${args.dealDetails.cameraCount ? `
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="font-weight: 600; color: #374151;">Camera Count:</span>
                <span style="color: #1f2937;">${args.dealDetails.cameraCount} cameras</span>
              </div>
              ` : ''}
            </div>
            
          </div>
          
          <!-- Use Cases -->
          <div style="margin: 24px 0;">
            <h4 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
              🎯 Interested Use Cases:
            </h4>
            <ul style="margin: 0; padding-left: 20px;">
              ${useCasesList}
            </ul>
          </div>
          
          ${args.dealDetails.notes ? `
          <!-- Deal Notes -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
            <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
              📝 Deal Notes:
            </h4>
            <p style="color: #92400e; margin: 0; line-height: 1.6;">
              ${args.dealDetails.notes}
            </p>
          </div>
          ` : ''}
          
          ${args.assignmentNotes ? `
          <!-- Assignment Notes -->
          <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0;">
            <h4 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
              💬 Assignment Notes:
            </h4>
            <p style="color: #1e40af; margin: 0; line-height: 1.6;">
              ${args.assignmentNotes}
            </p>
          </div>
          ` : ''}
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${appUrl}/deal-registration" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: #ffffff; 
                      text-decoration: none; 
                      padding: 14px 28px; 
                      border-radius: 6px; 
                      font-weight: 600; 
                      font-size: 16px; 
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
              View Deal in Partner Portal
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0 0; text-align: center;">
            Best of luck with this opportunity! If you have any questions, please don't hesitate to reach out.
          </p>
          
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            This email was sent by Visionify Partner Portal<br>
            <a href="https://partner.visionify.ai" style="color: #667eea; text-decoration: none;">Visit Partner Portal</a>
          </p>
        </div>
        
      </div>
    </body>
    </html>
    `;
    
    // Plain text version
    const textContent = `
New Deal Assignment - Visionify

Hi ${args.partnerName},

Great news! ${args.assignedBy} has assigned you a new deal opportunity.

Deal Details:
- Customer: ${args.dealDetails.customerName}
- Potential Value: $${args.dealDetails.opportunityAmount.toLocaleString()}
- Potential Commission (${commissionRate}%): $${commission.toLocaleString()}
- Expected Close Date: ${expectedCloseDate}
${args.dealDetails.cameraCount ? `- Camera Count: ${args.dealDetails.cameraCount} cameras` : ''}

Interested Use Cases:
${args.dealDetails.interestedUsecases && args.dealDetails.interestedUsecases.length > 0 
  ? args.dealDetails.interestedUsecases.map(useCase => `- ${useCase}`).join('\n')
  : '- No specific use cases mentioned'
}

${args.dealDetails.notes ? `Deal Notes:\n${args.dealDetails.notes}\n\n` : ''}
${args.assignmentNotes ? `Assignment Notes:\n${args.assignmentNotes}\n\n` : ''}

View this deal in your partner portal: https://partner.visionify.ai/deal-registration

Best of luck with this opportunity!

--
Visionify Partner Portal
https://partner.visionify.ai
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: 'Visionify Partners <no-reply@visionify.ai>',
        to: args.partnerEmail,
        subject: `New Deal Assignment: ${args.dealDetails.customerName} - $${args.dealDetails.opportunityAmount.toLocaleString()}`,
        html: htmlContent,
        text: textContent,
      });

      if (error) {
        console.error('Resend API error:', error);
        throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
      }

      return { success: true, emailId: data?.id };
      
    } catch (error) {
      console.error('Error sending deal assignment email:', error);
      throw error;
    }
  },
});

// Send partner approval email notification
export const sendPartnerApprovalEmail = action({
  args: {
    partnerEmail: v.string(),
    partnerName: v.string(),
    companyName: v.string(),
    approvedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    const appUrl = process.env.VITE_APP_URL || "https://partner.visionify.ai";
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY environment variable is not set");
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    if (!args.partnerEmail) {
      console.error("Partner email is empty:", args.partnerEmail);
      throw new Error("Partner email is required");
    }

    const resend = new Resend(resendApiKey);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Partner Application Approved - Welcome to Visionify!</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
      
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
          <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
            Welcome to the Visionify Partner Network!
          </h1>
          <p style="color: #d1fae5; margin: 12px 0 0 0; font-size: 18px; font-weight: 500;">
            Your application has been approved
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 24px;">
          
          <p style="font-size: 20px; color: #1f2937; margin: 0 0 24px 0;">
            Congratulations <strong>${args.partnerName}</strong>!
          </p>
          
          <p style="font-size: 16px; color: #4b5563; margin: 0 0 24px 0; line-height: 1.7;">
            We're excited to inform you that your partner application for <strong>${args.companyName}</strong> has been approved by ${args.approvedBy}. Welcome to the Visionify Partner Network!
          </p>
          
          <!-- What's Next Section -->
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #0ea5e9; border-radius: 12px; padding: 24px; margin: 32px 0;">
            <h3 style="color: #0c4a6e; margin: 0 0 20px 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">
              🚀 What's Next?
            </h3>
            
            <div style="space-y: 16px;">
              <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                <div style="background-color: #0ea5e9; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px; flex-shrink: 0;">1</div>
                <div>
                  <strong style="color: #0c4a6e;">Access Your Partner Portal:</strong>
                  <p style="margin: 4px 0 0 0; color: #075985; line-height: 1.5;">Log in to your partner dashboard to explore all available tools and resources.</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                <div style="background-color: #0ea5e9; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px; flex-shrink: 0;">2</div>
                <div>
                  <strong style="color: #0c4a6e;">Register Your First Deal:</strong>
                  <p style="margin: 4px 0 0 0; color: #075985; line-height: 1.5;">Start building your pipeline by registering deals and opportunities.</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                <div style="background-color: #0ea5e9; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px; flex-shrink: 0;">3</div>
                <div>
                  <strong style="color: #0c4a6e;">Generate Quotes:</strong>
                  <p style="margin: 4px 0 0 0; color: #075985; line-height: 1.5;">Create professional quotes for your customers using our quote generator.</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: flex-start;">
                <div style="background-color: #0ea5e9; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px; flex-shrink: 0;">4</div>
                <div>
                  <strong style="color: #0c4a6e;">Access Learning Resources:</strong>
                  <p style="margin: 4px 0 0 0; color: #075985; line-height: 1.5;">Explore training materials, product documentation, and sales resources.</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Benefits Highlight -->
          <div style="background-color: #fef7ff; border: 1px solid #d946ef; border-radius: 12px; padding: 24px; margin: 32px 0;">
            <h3 style="color: #86198f; margin: 0 0 16px 0; font-size: 20px; font-weight: 700; display: flex; align-items: center;">
              ⭐ Partner Benefits
            </h3>
            <ul style="margin: 0; padding-left: 20px; color: #86198f;">
              <li style="margin: 8px 0; line-height: 1.6;">Access to competitive commission rates</li>
              <li style="margin: 8px 0; line-height: 1.6;">Dedicated partner support team</li>
              <li style="margin: 8px 0; line-height: 1.6;">Marketing resources and co-op opportunities</li>
              <li style="margin: 8px 0; line-height: 1.6;">Priority access to new products and features</li>
              <li style="margin: 8px 0; line-height: 1.6;">Training and certification programs</li>
            </ul>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${appUrl}/dashboard" 
               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                      color: #ffffff; 
                      text-decoration: none; 
                      padding: 16px 32px; 
                      border-radius: 8px; 
                      font-weight: 700; 
                      font-size: 18px; 
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
                      transition: all 0.2s ease;">
              🚀 Access Partner Portal
            </a>
          </div>
          
          <!-- Support Section -->
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 32px 0; text-align: center;">
            <h4 style="color: #374151; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
              Need Help Getting Started?
            </h4>
            <p style="color: #6b7280; margin: 0 0 16px 0; font-size: 14px; line-height: 1.6;">
              Our partner success team is here to help you make the most of your partnership with Visionify.
            </p>
            <a href="mailto:partners@visionify.ai" 
               style="color: #667eea; text-decoration: none; font-weight: 600;">
              📧 Contact Partner Support
            </a>
          </div>
          
          <p style="font-size: 16px; color: #4b5563; margin: 32px 0 0 0; text-align: center; line-height: 1.6;">
            We're excited to have you as a partner and look forward to a successful collaboration!
          </p>
          
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
            This email was sent by Visionify Partner Portal<br>
            <a href="${appUrl}" style="color: #667eea; text-decoration: none; font-weight: 600;">Visit Partner Portal</a> | 
            <a href="mailto:partners@visionify.ai" style="color: #667eea; text-decoration: none; font-weight: 600;">Contact Support</a>
          </p>
        </div>
        
      </div>
    </body>
    </html>
    `;
    
    // Plain text version
    const textContent = `
🎉 CONGRATULATIONS! Your Partner Application Has Been Approved

Hi ${args.partnerName},

Great news! Your partner application for ${args.companyName} has been approved by ${args.approvedBy}. Welcome to the Visionify Partner Network!

What's Next:

1. Access Your Partner Portal
   Log in to your partner dashboard to explore all available tools and resources.
   
2. Register Your First Deal
   Start building your pipeline by registering deals and opportunities.
   
3. Generate Quotes
   Create professional quotes for your customers using our quote generator.
   
4. Access Learning Resources
   Explore training materials, product documentation, and sales resources.

Partner Benefits:
• Access to competitive commission rates
• Dedicated partner support team
• Marketing resources and co-op opportunities
• Priority access to new products and features
• Training and certification programs

Access Your Partner Portal: ${appUrl}/dashboard

Need Help Getting Started?
Our partner success team is here to help you make the most of your partnership with Visionify.
Contact us at: partners@visionify.ai

We're excited to have you as a partner and look forward to a successful collaboration!

--
Visionify Partner Portal
${appUrl}
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: 'Visionify Partners <no-reply@visionify.ai>',
        to: args.partnerEmail,
        subject: '🎉 Welcome to Visionify Partners - Your Application is Approved!',
        html: htmlContent,
        text: textContent,
      });

      if (error) {
        console.error('Resend API error:', error);
        throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
      }

      return { success: true, emailId: data?.id };
      
    } catch (error) {
      console.error('Error sending partner approval email:', error);
      throw error;
    }
  },
});

export const testEmailSetup = action({
  args: {
    testEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    const appUrl = process.env.VITE_APP_URL || "https://partner.visionify.ai";
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not found in environment");
    }
    
    const resend = new Resend(resendApiKey);
    
    try {
      const { data, error } = await resend.emails.send({
        from: 'Visionify Partners <no-reply@visionify.ai>',
        to: args.testEmail,
        subject: 'Test Email from Visionify - Environment Setup Check',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #667eea;">Test Email</h2>
            <p>This is a test email to verify the Resend integration is working correctly.</p>
            <p>If you receive this, the email setup is working!</p>
            <p>App URL: ${appUrl}</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          </div>
        `,
        text: `Test Email - Resend integration is working! App URL: ${appUrl}. Timestamp: ${new Date().toISOString()}`,
      });

      if (error) {
        console.error('Test email error:', error);
        throw new Error(`Test email failed: ${JSON.stringify(error)}`);
      }

      return { success: true, emailId: data?.id, message: "Test email sent successfully!" };
      
    } catch (error) {
      console.error('Test email exception:', error);
      throw new Error(`Test email exception: ${error.message}`);
    }
  },
});

// Test partner approval email
export const testPartnerApprovalEmail = action({
  args: {
    testEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Use the sendPartnerApprovalEmail action with test data
    return await ctx.runAction(api.email.sendPartnerApprovalEmail, {
      partnerEmail: args.testEmail,
      partnerName: "John Smith",
      companyName: "Test Company Inc.",
      approvedBy: "Admin User",
    });
  },
});