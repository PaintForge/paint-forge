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

© 2025 The Paint Forge LLC
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
