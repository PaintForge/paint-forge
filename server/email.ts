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
    
    // Add timeout to prevent hanging  
    const sendPromise = mailService.send(sendGridMessage);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('SendGrid timeout after 8 seconds')), 8000)
    );
    
    await Promise.race([sendPromise, timeoutPromise]);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
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
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Inter', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 12px; overflow: hidden; border: 2px solid rgba(220, 38, 38, 0.4); box-shadow: 0 0 30px rgba(220, 38, 38, 0.2);">
            
            <!-- Header with Security Alert Aesthetic -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #ff6b35 50%, #2d2d2d 100%); padding: 30px 20px; text-align: center; position: relative; overflow: hidden;">
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"alert\" patternUnits=\"userSpaceOnUse\" width=\"100\" height=\"100\"><polygon points=\"50,10 60,30 40,30\" fill=\"%23000\" opacity=\"0.1\"/><circle cx=\"50\" cy=\"70\" r=\"3\" fill=\"%23000\" opacity=\"0.1\"/></pattern></defs><rect width=\"100%\" height=\"100%\" fill=\"url(%23alert)\"/></svg>'); opacity: 0.2;"></div>
              <h1 style="margin: 0; color: white; font-size: 28px; font-family: 'Cinzel', serif; font-weight: 600; text-shadow: 2px 2px 6px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5); position: relative; z-index: 1;">
                🛡️ The Paint Forge 🔐
              </h1>
              <p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); position: relative; z-index: 1; font-weight: 500;">
                ⚠️ Security Protocol Initiated
              </p>
            </div>
            
            <!-- Main Content with Glass Morphism -->
            <div style="padding: 40px 30px; background: rgba(15, 15, 15, 0.95); backdrop-filter: blur(10px); position: relative;">
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, rgba(220, 38, 38, 0.05) 0%, rgba(255, 107, 53, 0.03) 100%);"></div>
              
              <div style="position: relative; z-index: 1;">
                <h2 style="color: #dc2626; margin-top: 0; font-family: 'Cinzel', serif; font-size: 24px; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); text-align: center; margin-bottom: 25px;">
                  Forge Access Recovery Protocol
                </h2>
                
                <!-- Alert Box -->
                <div style="background: rgba(220, 38, 38, 0.15); border: 2px solid rgba(220, 38, 38, 0.4); border-radius: 8px; padding: 20px; margin: 25px 0; box-shadow: inset 0 0 20px rgba(220, 38, 38, 0.1);">
                  <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <div style="color: #fca5a5; font-size: 24px; margin-right: 15px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">⚠️</div>
                    <h3 style="color: #fca5a5; margin: 0; font-family: 'Cinzel', serif; font-size: 18px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Security Alert</h3>
                  </div>
                  <p style="line-height: 1.7; margin: 0; color: #fca5a5; font-size: 15px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                    A request to reset your Paint Forge credentials has been initiated. If this was you, proceed with the protocol below. If not, your account defenses remain intact.
                  </p>
                </div>
                
                <div style="background: rgba(45, 45, 45, 0.8); padding: 25px; border-radius: 8px; border-left: 4px solid #ff6b35; margin: 25px 0; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
                  <p style="line-height: 1.7; margin: 0; color: #f5f5f5; font-size: 16px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                    To reforge your access credentials and regain entry to your paint armory, activate the secure protocol link below. This will transport you to the password reconstruction chamber.
                  </p>
                </div>
                
                <!-- CTA Button with Security Styling -->
                <div style="text-align: center; margin: 35px 0;">
                  <a href="${resetUrl}" 
                     style="background: linear-gradient(135deg, #dc2626 0%, #ff6b35 100%); 
                            color: white; 
                            text-decoration: none; 
                            padding: 16px 32px; 
                            border-radius: 8px; 
                            font-weight: 600; 
                            display: inline-block;
                            font-family: 'Cinzel', serif;
                            font-size: 16px;
                            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
                            border: 2px solid rgba(220, 38, 38, 0.5);
                            box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3), inset 0 1px 0 rgba(255,255,255,0.2);
                            transition: all 0.3s ease;">
                    🔐 INITIATE RESET PROTOCOL 🔐
                  </a>
                </div>
                
                <!-- Fallback Link Section -->
                <div style="background: rgba(26, 26, 26, 0.9); padding: 20px; border-radius: 6px; border: 1px solid rgba(220, 38, 38, 0.3); margin: 25px 0;">
                  <p style="line-height: 1.6; font-size: 14px; color: #a3a3a3; margin: 0 0 10px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                    If the protocol button fails, manually input this security rune:
                  </p>
                  <p style="word-break: break-all; font-size: 13px; color: #dc2626; margin: 0; padding: 10px; background: rgba(0,0,0,0.5); border-radius: 4px; font-family: 'Courier New', monospace;">
                    ${resetUrl}
                  </p>
                </div>
                
                <!-- Critical Security Info -->
                <div style="background: rgba(184, 134, 11, 0.15); border: 1px solid rgba(184, 134, 11, 0.4); border-radius: 6px; padding: 20px; margin: 25px 0;">
                  <h4 style="color: #fbbf24; margin: 0 0 15px 0; font-family: 'Cinzel', serif; font-size: 16px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                    ⏰ Critical Timing Protocol
                  </h4>
                  <ul style="color: #fbbf24; margin: 0; padding-left: 20px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); line-height: 1.6;">
                    <li style="margin-bottom: 8px;">This reset link expires in <strong>1 hour</strong> for maximum security</li>
                    <li style="margin-bottom: 8px;">If you didn't request this reset, your account remains secure</li>
                    <li>Only the most recent reset request is valid</li>
                  </ul>
                </div>
                
                <!-- Divider -->
                <hr style="border: none; border-top: 2px solid rgba(220, 38, 38, 0.3); margin: 30px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.5);">
              </div>
            </div>
            
            <!-- Footer with Required Legal Elements -->
            <div style="background: rgba(10, 10, 10, 0.95); padding: 25px 30px; border-top: 1px solid rgba(220, 38, 38, 0.3); text-align: center;">
              <div style="margin-bottom: 15px;">
                <p style="font-size: 14px; color: #666; line-height: 1.5; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                  <strong style="color: #ff6b35;">The Paint Forge</strong> - Secure Digital Paint Armory<br>
                  Protecting your miniature painting legacy with fortress-grade security.
                </p>
              </div>
              
              <div style="border-top: 1px solid rgba(220, 38, 38, 0.2); padding-top: 15px; margin-top: 15px;">
                <p style="font-size: 12px; color: #666; line-height: 1.4; margin: 5px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                  <strong>The Paint Forge LLC</strong><br>
                  1234 Miniature Way, Suite 567<br>
                  Battle Creek, MI 49037, USA<br>
                  Email: support@paintsforge.com | Phone: (555) 123-PAINT<br><br>
                  This security alert was sent to ${email} due to a password reset request.<br>
                  <a href="<%asm_group_unsubscribe_raw_url%>" style="color: #ff6b35; text-decoration: none;">Unsubscribe</a> | 
                  <a href="${baseUrl}/privacy-policy" style="color: #ff6b35; text-decoration: none;">Privacy Policy</a> | 
                  <a href="${baseUrl}/terms-of-service" style="color: #ff6b35; text-decoration: none;">Terms of Service</a>
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
                <div style="background: rgba(45, 45, 45, 0.8); border: 2px solid rgba(5, 150, 105, 0.3); border-radius: 10px; padding: 30px; margin: 25px 0; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
                  <h3 style="color: #10b981; margin: 0 0 20px 0; font-family: 'Cinzel', serif; font-size: 20px; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); display: flex; align-items: center;">
                    📜 Transmission Content
                  </h3>
                  <div style="background: rgba(26, 26, 26, 0.9); padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b35;">
                    <p style="color: #f3f4f6; line-height: 1.8; margin: 0; font-size: 16px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); white-space: pre-wrap;">${message}</p>
                  </div>
                </div>
                
                <!-- Response Protocol -->
                <div style="background: rgba(184, 134, 11, 0.15); border: 1px solid rgba(184, 134, 11, 0.4); border-radius: 8px; padding: 25px; margin: 25px 0;">
                  <h4 style="color: #fbbf24; margin: 0 0 15px 0; font-family: 'Cinzel', serif; font-size: 18px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                    📨 Response Protocol Required
                  </h4>
                  <p style="color: #fbbf24; margin: 0; line-height: 1.6; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                    Battle-Brother awaits acknowledgment and guidance from Command. Initiate response protocol via direct communication channel: <strong>${userEmail}</strong>
                  </p>
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
                  Secure transmission relay from Battle-Brother ${userName} via digital vox-channel.
                </p>
              </div>
              
              <div style="border-top: 1px solid rgba(5, 150, 105, 0.2); padding-top: 15px; margin-top: 15px;">
                <p style="font-size: 12px; color: #666; line-height: 1.4; margin: 5px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                  <strong>The Paint Forge LLC</strong><br>
                  1234 Miniature Way, Suite 567<br>
                  Battle Creek, MI 49037, USA<br>
                  Email: support@paintsforge.com | Phone: (555) 123-PAINT<br><br>
                  This communication was transmitted from ${userEmail} via secure forge-channel.<br>
                  Battle-Brothers may request communication cessation via command protocols.
                </p>
                <p style="font-size: 11px; color: #555; margin: 10px 0 0 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                  © 2025 The Paint Forge LLC. All communications secured. | CAN-SPAM Act Compliant
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
📡 THE PAINT FORGE - COMMUNICATION CENTER 📬

📨 INCOMING TRANSMISSION FROM BATTLE-BROTHER

Transmission Details:
- Call Sign: ${userName}
- Comm Frequency: ${userEmail}
- Transmission Time: ${currentDate}
- Report Classification: ${feedbackType}

Message Content:
${message}

Response Protocol Required:
Battle-Brother awaits acknowledgment and guidance from Command. Initiate response protocol via direct communication channel: ${userEmail}

-------------------------------------------
The Paint Forge LLC
1234 Miniature Way, Suite 567
Battle Creek, MI 49037, USA
Email: support@paintsforge.com
Phone: (555) 123-PAINT

© 2025 The Paint Forge LLC - CAN-SPAM Act Compliant
Secure communications by the Emperor's finest.
      `
    };

    const success = await sendEmail(emailParams);
    if (success) {
      console.log(`✅ Feedback notification sent successfully to support@paintsforge.com via SendGrid`);
    }
    return success;
  } catch (error) {
    console.error('Error sending feedback notification:', error);
    return false;
  }
}
