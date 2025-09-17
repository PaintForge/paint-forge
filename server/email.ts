import { MailService } from '@sendgrid/mail';

// Initialize SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY not configured - email functionality will be limited to console logging');
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

async function sendEmail(params: EmailParams): Promise<boolean> {
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
    
    await mailService.send(sendGridMessage);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

    const emailParams: EmailParams = {
      to: email,
      from: 'no-reply@paintsforge.com',
      subject: 'Verify Your Paint Forge Account',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Paint Forge Account</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 8px; overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
                The Paint Forge
              </h1>
              <p style="margin: 10px 0 0 0; color: white; font-size: 16px; opacity: 0.9;">
                Account Verification Required
              </p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px; background-color: #1a1a1a; color: #f5f5f5;">
              <h2 style="color: #ff6b35; margin-top: 0; font-size: 24px; text-align: center; margin-bottom: 25px;">
                Welcome to The Paint Forge!
              </h2>
              
              <div style="background-color: #2d2d2d; border: 2px solid #10b981; border-radius: 8px; padding: 25px; margin: 25px 0;">
                <p style="line-height: 1.7; margin: 0; color: #f5f5f5; font-size: 16px;">
                  Your account has been created successfully. To complete your registration and begin cataloging your paint collection, please verify your email address by clicking the button below.
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${verificationUrl}" 
                   style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); 
                          color: white; 
                          text-decoration: none; 
                          padding: 16px 32px; 
                          border-radius: 8px; 
                          font-weight: 600; 
                          display: inline-block;
                          font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              
              <!-- Fallback Link -->
              <div style="background-color: #2d2d2d; padding: 20px; border-radius: 6px; border: 1px solid #ff6b35; margin: 25px 0;">
                <p style="line-height: 1.6; font-size: 14px; color: #a3a3a3; margin: 0 0 10px 0;">
                  If the button doesn't work, copy this link into your browser:
                </p>
                <p style="word-break: break-all; font-size: 13px; color: #ff6b35; margin: 0; padding: 10px; background-color: #1a1a1a; border-radius: 4px; font-family: monospace;">
                  ${verificationUrl}
                </p>
              </div>
              
              <!-- Security Notice -->
              <div style="background-color: #2d2d2d; border: 1px solid #f7931e; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <p style="font-size: 13px; color: #f7931e; line-height: 1.5; margin: 0;">
                  <strong>Security Notice:</strong> This verification link expires in 24 hours. If you did not create this account, please ignore this email.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #0f0f0f; padding: 25px 30px; text-align: center;">
              <p style="font-size: 14px; color: #666; line-height: 1.5; margin: 0 0 15px 0;">
                <strong style="color: #ff6b35;">The Paint Forge</strong> - Your Digital Paint Collection<br>
                Managing your miniature painting hobby with precision.
              </p>
              
              <div style="border-top: 1px solid #333; padding-top: 15px; margin-top: 15px;">
                <p style="font-size: 12px; color: #666; line-height: 1.4; margin: 5px 0;">
                  <strong>The Paint Forge</strong><br>
                  Email: support@paintsforge.com<br><br>
                  This email was sent to ${email} because you created an account.<br>
                  <a href="${baseUrl}/privacy-policy" style="color: #ff6b35; text-decoration: none;">Privacy Policy</a> | 
                  <a href="${baseUrl}/terms-of-service" style="color: #ff6b35; text-decoration: none;">Terms of Service</a>
                </p>
                <p style="font-size: 11px; color: #555; margin: 10px 0 0 0;">
                  © 2025 The Paint Forge. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
WELCOME TO THE PAINT FORGE!

Your account has been created successfully. To complete your registration and begin cataloging your paint collection, please verify your email address.

VERIFICATION LINK:
${verificationUrl}

IMPORTANT SECURITY NOTICE:
- This verification link expires in 24 hours
- If you didn't create this account, ignore this email
- Your account remains inactive until verified

-------------------------------------------
The Paint Forge
Email: support@paintsforge.com

Privacy Policy: ${baseUrl}/privacy-policy
Terms of Service: ${baseUrl}/terms-of-service

© 2025 The Paint Forge. All rights reserved.
      `
    };

    const success = await sendEmail(emailParams);
    if (success) {
      console.log(`✅ Verification email sent successfully to ${email} via SendGrid`);
    }
    return success;
  } catch (error) {
    console.error('Error sending verification email:', error);
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
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 8px; overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #ff6b35 100%); padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
                The Paint Forge
              </h1>
              <p style="margin: 10px 0 0 0; color: white; font-size: 16px; opacity: 0.9;">
                Password Reset Request
              </p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px; background-color: #1a1a1a; color: #f5f5f5;">
              <h2 style="color: #dc2626; margin-top: 0; font-size: 24px; text-align: center; margin-bottom: 25px;">
                Password Reset Request
              </h2>
              
              <!-- Alert Box -->
              <div style="background-color: #2d2d2d; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px;">Security Alert</h3>
                <p style="line-height: 1.7; margin: 0; color: #f5f5f5; font-size: 15px;">
                  A request to reset your Paint Forge password has been received. If this was you, click the button below to reset your password. If not, your account remains secure.
                </p>
              </div>
              
              <div style="background-color: #2d2d2d; padding: 25px; border-radius: 8px; border-left: 4px solid #ff6b35; margin: 25px 0;">
                <p style="line-height: 1.7; margin: 0; color: #f5f5f5; font-size: 16px;">
                  To reset your password and regain access to your paint collection, click the secure link below. This will take you to the password reset page.
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${resetUrl}" 
                   style="background: linear-gradient(135deg, #dc2626 0%, #ff6b35 100%); 
                          color: white; 
                          text-decoration: none; 
                          padding: 16px 32px; 
                          border-radius: 8px; 
                          font-weight: 600; 
                          display: inline-block;
                          font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <!-- Fallback Link -->
              <div style="background-color: #2d2d2d; padding: 20px; border-radius: 6px; border: 1px solid #dc2626; margin: 25px 0;">
                <p style="line-height: 1.6; font-size: 14px; color: #a3a3a3; margin: 0 0 10px 0;">
                  If the button doesn't work, copy this link into your browser:
                </p>
                <p style="word-break: break-all; font-size: 13px; color: #dc2626; margin: 0; padding: 10px; background-color: #1a1a1a; border-radius: 4px; font-family: monospace;">
                  ${resetUrl}
                </p>
              </div>
              
              <!-- Security Info -->
              <div style="background-color: #2d2d2d; border: 1px solid #f7931e; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #f7931e; margin: 0 0 15px 0; font-size: 16px;">
                  Important Security Information
                </h4>
                <ul style="color: #f7931e; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">This reset link expires in <strong>1 hour</strong> for security</li>
                  <li style="margin-bottom: 8px;">If you didn't request this reset, your account is still secure</li>
                  <li>Only the most recent reset request is valid</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #0f0f0f; padding: 25px 30px; text-align: center;">
              <p style="font-size: 14px; color: #666; line-height: 1.5; margin: 0 0 15px 0;">
                <strong style="color: #ff6b35;">The Paint Forge</strong> - Secure Paint Collection Management<br>
                Protecting your miniature painting data with advanced security.
              </p>
              
              <div style="border-top: 1px solid #333; padding-top: 15px; margin-top: 15px;">
                <p style="font-size: 12px; color: #666; line-height: 1.4; margin: 5px 0;">
                  <strong>The Paint Forge</strong><br>
                  Email: support@paintsforge.com<br><br>
                  This security alert was sent to ${email} due to a password reset request.<br>
                  <a href="${baseUrl}/privacy-policy" style="color: #ff6b35; text-decoration: none;">Privacy Policy</a> | 
                  <a href="${baseUrl}/terms-of-service" style="color: #ff6b35; text-decoration: none;">Terms of Service</a>
                </p>
                <p style="font-size: 11px; color: #555; margin: 10px 0 0 0;">
                  © 2025 The Paint Forge. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
THE PAINT FORGE - PASSWORD RESET

SECURITY ALERT: Password Reset Request

A request to reset your Paint Forge password has been received. If this was you, use the link below to reset your password. If not, your account remains secure.

PASSWORD RESET LINK:
${resetUrl}

CRITICAL SECURITY INFORMATION:
- This reset link expires in 1 hour for maximum security
- If you didn't request this reset, ignore this email
- Only the most recent reset request is valid
- Your current password remains secure until reset is completed

-------------------------------------------
The Paint Forge
Email: support@paintsforge.com

Privacy Policy: ${baseUrl}/privacy-policy
Terms of Service: ${baseUrl}/terms-of-service

© 2025 The Paint Forge. All rights reserved.
      `
    };

    const success = await sendEmail(emailParams);
    if (success) {
      console.log(`✅ Password reset email sent successfully to ${email} via SendGrid`);
    }
    return success;
  } catch (error) {
    console.error('Error sending password reset email:', error);
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
      subject: `New ${feedbackType} from Paint Forge User`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Feedback from Paint Forge User</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 8px; overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #ff6b35 100%); padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
                The Paint Forge
              </h1>
              <p style="margin: 10px 0 0 0; color: white; font-size: 16px; opacity: 0.9;">
                New User Feedback Received
              </p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px; background-color: #1a1a1a; color: #f5f5f5;">
              <h2 style="color: #10b981; margin-top: 0; font-size: 24px; text-align: center; margin-bottom: 25px;">
                ${feedbackType} Submission
              </h2>
              
              <div style="background-color: #2d2d2d; border: 2px solid #10b981; border-radius: 8px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #10b981; margin: 0 0 15px 0; font-size: 18px;">Feedback Details</h3>
                <table style="width: 100%; border-collapse: collapse; color: #f5f5f5;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #333; font-weight: bold; width: 120px;">Type:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #333;">${feedbackType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #333; font-weight: bold;">User:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #333;">${userName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #333; font-weight: bold;">Email:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #333;">${userEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-weight: bold;">Date:</td>
                    <td style="padding: 10px 0;">${currentDate}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background-color: #2d2d2d; padding: 25px; border-radius: 8px; border-left: 4px solid #ff6b35; margin: 25px 0;">
                <h4 style="color: #ff6b35; margin: 0 0 15px 0; font-size: 16px;">Message Content</h4>
                <div style="background-color: #1a1a1a; padding: 20px; border-radius: 4px; line-height: 1.6;">
                  <p style="margin: 0; color: #f5f5f5; white-space: pre-wrap;">${message}</p>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #0f0f0f; padding: 25px 30px; text-align: center;">
              <p style="font-size: 14px; color: #666; line-height: 1.5; margin: 0;">
                <strong style="color: #ff6b35;">The Paint Forge</strong> - User Feedback System<br>
                Automatically generated notification from paintsforge.com
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
THE PAINT FORGE - NEW USER FEEDBACK

${feedbackType.toUpperCase()} SUBMISSION

User Details:
- Name: ${userName}
- Email: ${userEmail}
- Date: ${currentDate}
- Type: ${feedbackType}

Message:
${message}

-------------------------------------------
The Paint Forge - User Feedback System
Automatically generated from paintsforge.com
      `
    };

    const success = await sendEmail(emailParams);
    if (success) {
      console.log(`✅ Feedback notification sent successfully via SendGrid`);
    }
    return success;
  } catch (error) {
    console.error('❌ SendGrid feedback notification failed:', error);
    return false;
  }
}
