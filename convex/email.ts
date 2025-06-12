import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

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
    const useCasesList = args.dealDetails.interestedUsecases && args.dealDetails.interestedUsecases.length > 0
      ? args.dealDetails.interestedUsecases.map(useCase => `<li style="margin-bottom: 4px;">${useCase}</li>`).join('')
      : '<li style="color: #6b7280;">No specific use cases mentioned</li>';
    
    // Email HTML template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Deal Assignment - Visionify</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">New Deal Assignment</h1>
          <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 16px;">You've been assigned a new opportunity</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 32px 24px;">
          
          <!-- Greeting -->
          <p style="font-size: 16px; color: #374151; margin: 0 0 24px 0;">
            Hi ${args.partnerName},
          </p>
          
          <p style="font-size: 16px; color: #374151; margin: 0 0 24px 0;">
            Great news! ${args.assignedBy} has assigned you a new deal opportunity. Here are all the details:
          </p>
          
          <!-- Deal Summary Card -->
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #667eea;">
            <h2 style="color: #111827; font-size: 20px; margin: 0 0 16px 0; font-weight: 600;">
              ${args.dealDetails.customerName}
            </h2>
            
            <div style="display: grid; gap: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 500; min-width: 150px;">Potential Deal Size:</span>
                <span style="color: #111827; font-weight: 600; font-size: 18px; margin-left: 20px;">$${args.dealDetails.opportunityAmount.toLocaleString()}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 500; min-width: 150px;">Commission (${commissionRate}%):</span>
                <span style="color: #059669; font-weight: 600; font-size: 18px; margin-left: 20px;">$${commission.toLocaleString()}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 500; min-width: 150px;">Expected Close Date:</span>
                <span style="color: #111827; font-weight: 600; margin-left: 20px;">${expectedCloseDate}</span>
              </div>
              
              ${args.dealDetails.cameraCount ? `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 500; min-width: 150px;">Camera Count:</span>
                <span style="color: #111827; font-weight: 600; margin-left: 20px;">${args.dealDetails.cameraCount} cameras</span>
              </div>
              ` : ''}
            </div>
          </div>
          
          <!-- Use Cases -->
          <div style="margin-bottom: 24px;">
            <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">Interested Use Cases:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              ${useCasesList}
            </ul>
          </div>
          
          <!-- Deal Notes -->
          ${args.dealDetails.notes ? `
          <div style="margin-bottom: 24px;">
            <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">Deal Notes:</h3>
            <p style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 0; color: #374151; border-left: 3px solid #d1d5db;">
              ${args.dealDetails.notes}
            </p>
          </div>
          ` : ''}
          
          <!-- Assignment Notes -->
          ${args.assignmentNotes ? `
          <div style="margin-bottom: 24px;">
            <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">Assignment Notes:</h3>
            <p style="background-color: #fef3c7; padding: 16px; border-radius: 6px; margin: 0; color: #92400e; border-left: 3px solid #f59e0b;">
              ${args.assignmentNotes}
            </p>
          </div>
          ` : ''}
          
          <!-- Call to Action -->
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
        from: 'Visionify Partners <no-reply@partner.visionify.ai>',
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
      throw new Error(`Failed to send deal assignment email: ${error.message}`);
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
        from: 'Visionify Partners <no-reply@partner.visionify.ai>',
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