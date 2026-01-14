import { MailService } from '@sendgrid/mail';

// Initialize SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY not configured - email functionality will be limited to console logging');
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
  
  // Set connection timeout for production
  mailService.setTimeout(15000); // 15 second timeout for all requests
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      // Development fallback - log email details
      console.log(`📧 SendGrid Email (Development Mode):`);
      console.log(`To: ${params.to}`);
      console.log(`From: ${params.from}`);
      console.log(`Subject: ${params.subject}`);
      return true;
    }

    const sendGridMessage: any = {
      to: params.to,
      from: params.from,
      subject: params.subject,
      // Temporarily removed ASM for testing - may be causing suppression issues
      // asm: {
      //   group_id: 1
      // }
    };
    
    if (params.text) sendGridMessage.text = params.text;
    if (params.html) sendGridMessage.html = params.html;
    
    // BULLETPROOF TIMEOUT: Triple-layer timeout protection
    console.log('📧 Attempting to send email via SendGrid with timeout protection...');
    
    // Layer 1: Create fresh SendGrid instance with timeout
    const customMailService = new MailService();
    customMailService.setApiKey(process.env.SENDGRID_API_KEY);
    customMailService.setTimeout(25000); // 25 second HTTP timeout (increased for production)
    
    // Layer 2: Promise-based timeout wrapper
    const sendWithTimeout = () => {
      return new Promise((resolve, reject) => {
        // Set up the timeout first - 30 seconds to allow SendGrid to complete
        const timeoutId = setTimeout(() => {
          console.log('❌ SendGrid timeout after 30 seconds - forcing rejection');
          reject(new Error('SendGrid timeout: Connection took longer than 30 seconds'));
        }, 30000);
        
        // Attempt to send
        customMailService.send(sendGridMessage)
          .then((result) => {
            clearTimeout(timeoutId);
            console.log('✅ SendGrid email sent successfully');
            resolve(result);
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            console.log('❌ SendGrid send failed:', error.message);
            reject(error);
          });
      });
    };
    
    // Layer 3: Execute with timeout protection
    await sendWithTimeout();
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // In production, log the email verification link as fallback
    if (params.subject.includes('Verify Your Paint Forge Account')) {
      const baseUrl = process.env.BASE_URL || 'https://paintsforge.com';
      console.log(`🔗 FALLBACK: Email verification link for ${params.to}:`);
      console.log(`${baseUrl}/api/auth/verify-email?token=<TOKEN_FROM_REGISTRATION>`);
    }
    
    return false;
  }
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  try {
    const baseUrl = process.env.BASE_URL || 'https://paintsforge.com';
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

    const emailParams: EmailParams = {
      to: email,
      from: 'no-reply@paintsforge.com', // Using your verified single sender
      subject: 'Verify Your Paint Forge Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Verify Your Paint Forge Account</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #ff6b35; text-align: center; margin-bottom: 30px;">The Paint Forge</h1>
            
            <h2 style="color: #333;">Welcome! Please verify your email</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Thanks for creating your Paint Forge account! Please click the button below to verify your email address and activate your account.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #ff6b35; color: white; text-decoration: none; padding: 12px 30px; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Or copy this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #ff6b35;">${verificationUrl}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              © 2025 The Paint Forge - This email was sent to ${email}
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
⚒️ WELCOME TO THE PAINT FORGE! ⚔️

Greetings, Battle-Brother!

Your account has been forged in the depths of our digital foundry. To complete your initiation and begin cataloging your paint armory, please verify your email address.

VERIFICATION LINK:
${verificationUrl}

IMPORTANT SECURITY NOTICE:
- This verification link expires in 24 hours
- If you didn't create this account, ignore this email
- Your account remains sealed until verified

-------------------------------------------
The Paint Forge LLC
1234 Miniature Way, Suite 567
Battle Creek, MI 49037, USA
Email: support@paintsforge.com
Phone: (555) 123-PAINT

Privacy Policy: ${baseUrl}/privacy-policy
Terms of Service: ${baseUrl}/terms-of-service
Unsubscribe: <%asm_group_unsubscribe_raw_url%>

© 2025 The Paint Forge LLC - CAN-SPAM Act Compliant
Built for the Emperor's finest painters.
      `
    };

    const success = await sendEmail(emailParams);
    if (success) {
      console.log(`✅ Verification email sent successfully to ${email} via SendGrid`);
    }
    return success;
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Log the verification link as fallback
    console.log(`Email verification link for ${email}: ${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${token}`);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const emailParams: EmailParams = {
      to: email,
      from: 'no-reply@paintsforge.com',
      subject: 'Reset Your Paint Forge Password',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Paint Forge Password</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #1a1a1a; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: #2d2d2d; border-radius: 12px; overflow: hidden; border: 2px solid #dc2626;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #ff6b35 100%); padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
                🛡️ The Paint Forge
              </h1>
              <p style="margin: 10px 0 0 0; color: white; font-size: 16px;">
                Password Reset Request
              </p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px; background: #1a1a1a;">
              
              <h2 style="color: #ff6b35; margin-top: 0; font-size: 24px; text-align: center; margin-bottom: 25px;">
                Reset Your Password
              </h2>
              
              <!-- Alert Box -->
              <div style="background: rgba(220, 38, 38, 0.15); border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <p style="line-height: 1.7; margin: 0; color: #fca5a5; font-size: 15px;">
                  <strong>🔐 Security Alert:</strong> A request to reset your Paint Forge password has been received. If this was you, click the button below to continue. If not, your account remains secure.
                </p>
              </div>
              
              <p style="line-height: 1.7; margin: 25px 0; color: #d1d5db; font-size: 16px;">
                Click the button below to reset your password and regain access to your paint inventory.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${resetUrl}" 
                   style="background: linear-gradient(135deg, #dc2626 0%, #ff6b35 100%); 
                          color: white; 
                          text-decoration: none; 
                          padding: 16px 40px; 
                          border-radius: 8px; 
                          font-weight: bold; 
                          display: inline-block;
                          font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <!-- Fallback Link -->
              <div style="background: #2d2d2d; padding: 20px; border-radius: 6px; border: 1px solid #dc2626; margin: 25px 0;">
                <p style="line-height: 1.6; font-size: 14px; color: #9ca3af; margin: 0 0 10px 0;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="word-break: break-all; font-size: 13px; color: #ff6b35; margin: 0;">
                  ${resetUrl}
                </p>
              </div>
              
              <!-- Security Info -->
              <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid #fbbf24; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <p style="color: #fbbf24; margin: 0 0 10px 0; font-weight: bold; font-size: 16px;">
                  ⏱️ Important Information
                </p>
                <ul style="color: #fcd34d; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>This link expires in 1 hour</li>
                  <li>Only the most recent reset link is valid</li>
                  <li>If you didn't request this, ignore this email</li>
                </ul>
              </div>
              
            </div>
            
            <!-- Footer -->
            <div style="background: #0a0a0a; padding: 25px 30px; border-top: 1px solid #dc2626; text-align: center;">
              <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 15px 0;">
                <strong style="color: #ff6b35;">The Paint Forge</strong><br>
                Your Digital Paint Inventory System
              </p>
              
              <p style="font-size: 12px; color: #555; line-height: 1.5; margin: 0;">
                The Paint Forge LLC • 1234 Miniature Way, Suite 567<br>
                Battle Creek, MI 49037, USA<br>
                support@paintsforge.com • (555) 123-PAINT<br><br>
                This message was sent to ${email}<br>
                <a href="${baseUrl}/privacy-policy" style="color: #ff6b35; text-decoration: none;">Privacy Policy</a> • 
                <a href="${baseUrl}/terms-of-service" style="color: #ff6b35; text-decoration: none;">Terms of Service</a>
              </p>
              <p style="font-size: 11px; color: #444; margin: 15px 0 0 0;">
                © 2025 The Paint Forge LLC. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
🛡️ THE PAINT FORGE - SECURITY PROTOCOL 🔐

⚠️ FORGE ACCESS RECOVERY PROTOCOL INITIATED

Greetings, Battle-Brother!

A request to reset your Paint Forge credentials has been initiated. If this was you, proceed with the protocol below. If not, your account defenses remain intact.

PASSWORD RESET LINK:
${resetUrl}

CRITICAL SECURITY INFORMATION:
- This reset link expires in 1 hour for maximum security
- If you didn't request this reset, ignore this email
- Only the most recent reset request is valid
- Your current password remains secure until reset is completed

-------------------------------------------
The Paint Forge LLC
1234 Miniature Way, Suite 567
Battle Creek, MI 49037, USA
Email: support@paintsforge.com
Phone: (555) 123-PAINT

Privacy Policy: ${baseUrl}/privacy-policy
Terms of Service: ${baseUrl}/terms-of-service
Unsubscribe: <%asm_group_unsubscribe_raw_url%>

© 2025 The Paint Forge LLC - CAN-SPAM Act Compliant
Security protocols by the Emperor's finest.
      `
    };

    const success = await sendEmail(emailParams);
    if (success) {
      console.log(`✅ Password reset email sent successfully to ${email} via SendGrid`);
    }
    return success;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    // Log the reset link as fallback
    console.log(`Password reset link for ${email}: ${process.env.BASE_URL || 'http://localhost:5000'}/reset-password?token=${token}`);
    return false;
  }
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('❌ SendGrid API key not configured');
      return false;
    }

    // Test by sending a simple request to SendGrid API
    // Since SendGrid doesn't have a verify method like nodemailer,
    // we'll just check if the API key is configured
    console.log('✅ SendGrid API key configured');
    return true;
  } catch (error) {
    console.error('SendGrid connection test failed:', error);
    return false;
  }
}

export async function sendTestEmail(email: string, subject: string, htmlContent: string): Promise<boolean> {
  try {
    const emailParams: EmailParams = {
      to: email,
      from: 'no-reply@paintsforge.com',
      subject: subject,
      html: htmlContent
    };

    const success = await sendEmail(emailParams);
    if (success) {
      console.log(`✅ Test email sent successfully via SendGrid to ${email}`);
    }
    return success;
  } catch (error) {
    console.error('❌ SendGrid test email failed:', error);
    return false;
  }
}

export async function sendSupportRequest(
  category: string,
  email: string,
  name: string,
  message: string
): Promise<boolean> {
  try {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const categoryLabels: Record<string, string> = {
      'account-login': 'Account / Login Issue',
      'feature-suggestion': 'Feature Request / Suggestion',
      'bug-report': 'Bug Report',
      'inappropriate-content': 'Report Inappropriate Content',
      'other': 'General Support'
    };
    
    const categoryLabel = categoryLabels[category] || category;

    const emailParams: EmailParams = {
      to: 'paulkocumcmg@gmail.com', // Your monitored email
      from: 'no-reply@paintsforge.com',
      subject: `[Support Request] ${categoryLabel} - from ${name}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paint Forge Support Request</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #1a1a1a; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: #2d2d2d; border-radius: 12px; overflow: hidden; border: 2px solid #ff6b35;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ff6b35 0%, #dc2626 100%); padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: bold;">
                Paint Forge Support Request
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                ${categoryLabel}
              </p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 30px; background: #1a1a1a;">
              
              <!-- Request Details -->
              <div style="background: #2d2d2d; border: 1px solid #ff6b35; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #ff6b35; margin: 0 0 15px 0; font-size: 18px;">Request Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="color: #999; padding: 8px 0; width: 100px;">Name:</td>
                    <td style="color: #fff; padding: 8px 0;">${name}</td>
                  </tr>
                  <tr>
                    <td style="color: #999; padding: 8px 0;">Email:</td>
                    <td style="color: #fff; padding: 8px 0;"><a href="mailto:${email}" style="color: #ff6b35;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #999; padding: 8px 0;">Category:</td>
                    <td style="color: #fff; padding: 8px 0;">${categoryLabel}</td>
                  </tr>
                  <tr>
                    <td style="color: #999; padding: 8px 0;">Date:</td>
                    <td style="color: #fff; padding: 8px 0;">${currentDate}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Message -->
              <div style="background: #2d2d2d; border: 1px solid #444; border-radius: 8px; padding: 20px;">
                <h3 style="color: #ff6b35; margin: 0 0 15px 0; font-size: 18px;">Message</h3>
                <p style="color: #e5e5e5; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              
              <!-- Reply Button -->
              <div style="text-align: center; margin-top: 25px;">
                <a href="mailto:${email}?subject=Re: ${categoryLabel} - Paint Forge Support" 
                   style="background: #ff6b35; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Reply to ${name}
                </a>
              </div>
              
            </div>
            
            <!-- Footer -->
            <div style="background: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333;">
              <p style="font-size: 12px; color: #666; margin: 0;">
                Paint Forge Support System | paintsforge.com
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
PAINT FORGE SUPPORT REQUEST
============================

Category: ${categoryLabel}
Date: ${currentDate}

FROM:
Name: ${name}
Email: ${email}

MESSAGE:
${message}

---
Reply to: ${email}
      `
    };

    const success = await sendEmail(emailParams);
    if (success) {
      console.log(`✅ Support request sent to paulkocumcmg@gmail.com via SendGrid`);
    }
    return success;
  } catch (error) {
    console.error('❌ Failed to send support request via SendGrid:', error);
    return false;
  }
}

export async function sendFeedbackNotification(
  feedbackType: string, 
  message: string, 
  userEmail: string, 
  userName: string
): Promise<boolean> {
  try {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailParams: EmailParams = {
      to: 'support@paintsforge.com',
      from: 'no-reply@paintsforge.com',
      subject: `New ${feedbackType} from ${userName}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Feedback from Paint Forge User</title>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Inter', Arial, sans-serif;">
          <div style="max-width: 650px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 12px; overflow: hidden; border: 2px solid rgba(5, 150, 105, 0.4); box-shadow: 0 0 30px rgba(5, 150, 105, 0.2);">
            
            <!-- Header with Communication Aesthetic -->
            <div style="background: linear-gradient(135deg, #059669 0%, #ff6b35 50%, #2d2d2d 100%); padding: 30px 20px; text-align: center; position: relative; overflow: hidden;">
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"comm\" patternUnits=\"userSpaceOnUse\" width=\"100\" height=\"100\"><circle cx=\"20\" cy=\"20\" r=\"2\" fill=\"%23000\" opacity=\"0.1\"/><circle cx=\"80\" cy=\"80\" r=\"2\" fill=\"%23000\" opacity=\"0.1\"/><rect x=\"45\" y=\"45\" width=\"10\" height=\"10\" fill=\"%23000\" opacity=\"0.05\"/></pattern></defs><rect width=\"100%\" height=\"100%\" fill=\"url(%23comm)\"/></svg>'); opacity: 0.3;"></div>
              <h1 style="margin: 0; color: white; font-size: 28px; font-family: 'Cinzel', serif; font-weight: 600; text-shadow: 2px 2px 6px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5); position: relative; z-index: 1;">
                📡 The Paint Forge 📬
              </h1>
              <p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); position: relative; z-index: 1; font-weight: 500;">
                📨 Incoming Transmission from Battle-Brother
              </p>
            </div>
            
            <!-- Main Content with Glass Morphism -->
            <div style="padding: 40px 30px; background: rgba(15, 15, 15, 0.95); backdrop-filter: blur(10px); position: relative;">
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, rgba(5, 150, 105, 0.03) 0%, rgba(255, 107, 53, 0.03) 100%);"></div>
              
              <div style="position: relative; z-index: 1;">
                <!-- Feedback Type Badge -->
                <div style="text-align: center; margin-bottom: 30px;">
                  <span style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 12px 24px; border-radius: 25px; font-family: 'Cinzel', serif; font-size: 18px; font-weight: 600; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); border: 2px solid rgba(5, 150, 105, 0.5); box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);">
                    📝 ${feedbackType} Report
                  </span>
                </div>
                
                <!-- User Intelligence Report -->
                <div style="background: rgba(45, 45, 45, 0.9); border: 2px solid rgba(5, 150, 105, 0.3); border-radius: 10px; padding: 25px; margin: 25px 0; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
                  <h3 style="color: #10b981; margin: 0 0 20px 0; font-family: 'Cinzel', serif; font-size: 20px; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); display: flex; align-items: center;">
                    👤 Battle-Brother Intelligence
                  </h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="background: rgba(26, 26, 26, 0.8); padding: 15px; border-radius: 6px; border-left: 3px solid #10b981;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Call Sign</p>
                      <p style="margin: 5px 0 0 0; color: #f3f4f6; font-size: 16px; font-weight: 600; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">${userName}</p>
                    </div>
                    <div style="background: rgba(26, 26, 26, 0.8); padding: 15px; border-radius: 6px; border-left: 3px solid #ff6b35;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Comm Frequency</p>
                      <p style="margin: 5px 0 0 0; color: #f3f4f6; font-size: 14px; font-weight: 500; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); word-break: break-all;">${userEmail}</p>
                    </div>
                    <div style="background: rgba(26, 26, 26, 0.8); padding: 15px; border-radius: 6px; border-left: 3px solid #b8860b;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Transmission Time</p>
                      <p style="margin: 5px 0 0 0; color: #f3f4f6; font-size: 14px; font-weight: 500; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">${currentDate}</p>
                    </div>
                    <div style="background: rgba(26, 26, 26, 0.8); padding: 15px; border-radius: 6px; border-left: 3px solid #dc2626;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Report Classification</p>
                      <p style="margin: 5px 0 0 0; color: #f3f4f6; font-size: 14px; font-weight: 600; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">${feedbackType}</p>
                    </div>
                  </div>
                </div>
                
                <!-- Message Content -->
                <div style="margin: 30px 0;">
                  <h3 style="color: #ff6b35; margin: 0 0 20px 0; font-family: 'Cinzel', serif; font-size: 22px; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); display: flex; align-items: center;">
                    📜 Transmission Content
                  </h3>
                  <div style="background: linear-gradient(135deg, rgba(42, 42, 42, 0.9) 0%, rgba(26, 26, 26, 0.9) 100%); padding: 30px; border-radius: 10px; border: 2px solid rgba(255, 107, 53, 0.4); position: relative; box-shadow: inset 0 0 20px rgba(0,0,0,0.3);">
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, rgba(255, 107, 53, 0.05) 0%, rgba(184, 134, 11, 0.05) 100%); border-radius: 8px;"></div>
                    <div style="position: relative; z-index: 1;">
                      <div style="background: rgba(0, 0, 0, 0.4); padding: 4px 12px; border-radius: 15px; display: inline-block; margin-bottom: 15px; border: 1px solid rgba(255, 107, 53, 0.3);">
                        <span style="color: #ff6b35; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">🔐 Encrypted Message</span>
                      </div>
                      <p style="color: #f3f4f6; line-height: 1.8; margin: 0; font-size: 16px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); white-space: pre-wrap; font-family: 'Inter', sans-serif;">${message}</p>
                    </div>
                  </div>
                </div>
                
                <!-- Action Required Section -->
                <div style="background: rgba(184, 134, 11, 0.15); border: 2px solid rgba(184, 134, 11, 0.4); border-radius: 8px; padding: 20px; margin: 25px 0;">
                  <h4 style="color: #fbbf24; margin: 0 0 15px 0; font-family: 'Cinzel', serif; font-size: 18px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); display: flex; align-items: center;">
                    ⚡ Command Directive
                  </h4>
                  <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 6px; border-left: 4px solid #fbbf24;">
                    <p style="color: #fbbf24; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); line-height: 1.6; font-size: 15px;">
                      <strong>Mission Objective:</strong> Respond to Battle-Brother <strong>${userName}</strong> at communication frequency <strong>${userEmail}</strong><br>
                      <strong>Priority Level:</strong> Standard Response Protocol<br>
                      <strong>Time Limit:</strong> Within 24-48 hours for optimal service
                    </p>
                  </div>
                </div>
                
                <!-- Direct Response Link -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="mailto:${userEmail}?subject=Re: ${feedbackType} - Paint Forge Response" 
                     style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); 
                            color: white; 
                            text-decoration: none; 
                            padding: 16px 32px; 
                            border-radius: 8px; 
                            font-weight: 600; 
                            display: inline-block;
                            font-family: 'Cinzel', serif;
                            font-size: 16px;
                            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
                            border: 2px solid rgba(5, 150, 105, 0.5);
                            box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3), inset 0 1px 0 rgba(255,255,255,0.2);
                            transition: all 0.3s ease;">
                    📧 INITIATE RESPONSE PROTOCOL 📧
                  </a>
                </div>
                
                <!-- Divider -->
                <hr style="border: none; border-top: 2px solid rgba(5, 150, 105, 0.3); margin: 30px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.5);">
              </div>
            </div>
            
            <!-- Footer with Required Legal Elements -->
            <div style="background: rgba(10, 10, 10, 0.95); padding: 25px 30px; border-top: 1px solid rgba(5, 150, 105, 0.3); text-align: center;">
              <div style="margin-bottom: 15px;">
                <p style="font-size: 14px; color: #666; line-height: 1.5; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                  <strong style="color: #ff6b35;">The Paint Forge</strong> - Command & Communication Center<br>
                  Facilitating communication between the Forge leadership and Battle-Brothers.
                </p>
              </div>
              
              <div style="border-top: 1px solid rgba(5, 150, 105, 0.2); padding-top: 15px; margin-top: 15px;">
                <p style="font-size: 12px; color: #666; line-height: 1.4; margin: 5px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                  <strong>The Paint Forge LLC</strong><br>
                  1234 Miniature Way, Suite 567<br>
                  Battle Creek, MI 49037, USA<br>
                  Email: support@paintsforge.com | Phone: (555) 123-PAINT<br><br>
                  This internal system notification from ${userEmail}.<br>
                  Internal Admin System | 
                  <a href="${process.env.BASE_URL || 'http://localhost:5000'}/privacy-policy" style="color: #ff6b35; text-decoration: none;">Privacy Policy</a> | 
                  <a href="${process.env.BASE_URL || 'http://localhost:5000'}/terms-of-service" style="color: #ff6b35; text-decoration: none;">Terms of Service</a>
                </p>
                <p style="font-size: 11px; color: #555; margin: 10px 0 0 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                  © 2025 The Paint Forge LLC. All rights reserved. | CAN-SPAM Act Compliant
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
📰 THE PAINT FORGE - FEEDBACK TRANSMISSION 📬

📨 INCOMING TRANSMISSION FROM BATTLE-BROTHER

FEEDBACK REPORT: ${feedbackType}

BATTLE-BROTHER INTELLIGENCE:
- Call Sign: ${userName}
- Comm Frequency: ${userEmail}
- Transmission Time: ${currentDate}
- Classification: ${feedbackType}

TRANSMISSION CONTENT:
${message}

⚡ COMMAND DIRECTIVE:
Mission Objective: Respond to Battle-Brother ${userName} at ${userEmail}
Priority Level: Standard Response Protocol
Time Limit: Within 24-48 hours for optimal service

DIRECT RESPONSE: Reply to ${userEmail}

-------------------------------------------
The Paint Forge LLC - Internal Admin System
1234 Miniature Way, Suite 567
Battle Creek, MI 49037, USA
Email: support@paintsforge.com
Phone: (555) 123-PAINT

Privacy Policy: ${process.env.BASE_URL || 'http://localhost:5000'}/privacy-policy
Terms of Service: ${process.env.BASE_URL || 'http://localhost:5000'}/terms-of-service

This is an automated internal notification.
© 2025 The Paint Forge LLC - CAN-SPAM Act Compliant
      `
    };

    const success = await sendEmail(emailParams);
    if (success) {
      console.log(`✅ Feedback notification sent to support@paintsforge.com via SendGrid`);
    }
    return success;
  } catch (error) {
    console.error('❌ Failed to send feedback notification via SendGrid:', error);
    return false;
  }
}
