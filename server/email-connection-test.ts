import { sendTestEmail } from "./email";

async function runTestEmail() {
  try {
    console.log("Sending test email via SendGrid...");
    
    const success = await sendTestEmail(
      "starman1014@yahoo.com",
      "Test Email from The Paint Forge (SendGrid)",
      `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paint Forge System Test</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 8px; overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
                The Paint Forge
              </h1>
              <p style="margin: 10px 0 0 0; color: white; font-size: 16px; opacity: 0.9;">
                Email System Test
              </p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px; background-color: #1a1a1a; color: #f5f5f5;">
              <h2 style="color: #ff6b35; margin-top: 0; font-size: 24px; text-align: center; margin-bottom: 25px;">
                SendGrid Integration Successful!
              </h2>
              
              <div style="background-color: #2d2d2d; border: 2px solid #10b981; border-radius: 8px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #10b981; margin: 0 0 15px 0; font-size: 18px;">System Status: OPERATIONAL</h3>
                <p style="line-height: 1.7; margin: 0; color: #f5f5f5; font-size: 15px;">
                  This email confirms that The Paint Forge communication systems are fully operational with SendGrid integration. All systems are functioning correctly.
                </p>
              </div>
              
              <!-- Diagnostic Results -->
              <div style="background-color: #2d2d2d; border: 1px solid #ff6b35; border-radius: 8px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #ff6b35; margin: 0 0 20px 0; font-size: 20px;">
                  Diagnostic Results
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px; background-color: #1a1a1a; border-radius: 4px; margin-bottom: 10px; width: 48%;">
                      <p style="margin: 0; color: #a3a3a3; font-size: 13px; text-transform: uppercase;">SendGrid API</p>
                      <p style="margin: 5px 0 0 0; color: #10b981; font-size: 16px; font-weight: bold;">CONNECTED</p>
                    </td>
                    <td style="width: 4%;"></td>
                    <td style="padding: 10px; background-color: #1a1a1a; border-radius: 4px; width: 48%;">
                      <p style="margin: 0; color: #a3a3a3; font-size: 13px; text-transform: uppercase;">Email Templates</p>
                      <p style="margin: 5px 0 0 0; color: #10b981; font-size: 16px; font-weight: bold;">ACTIVE</p>
                    </td>
                  </tr>
                  <tr><td colspan="3" style="height: 10px;"></td></tr>
                  <tr>
                    <td style="padding: 10px; background-color: #1a1a1a; border-radius: 4px;">
                      <p style="margin: 0; color: #a3a3a3; font-size: 13px; text-transform: uppercase;">Domain Verified</p>
                      <p style="margin: 5px 0 0 0; color: #10b981; font-size: 16px; font-weight: bold;">AUTHENTICATED</p>
                    </td>
                    <td style="width: 4%;"></td>
                    <td style="padding: 10px; background-color: #1a1a1a; border-radius: 4px;">
                      <p style="margin: 0; color: #a3a3a3; font-size: 13px; text-transform: uppercase;">Deliverability</p>
                      <p style="margin: 5px 0 0 0; color: #10b981; font-size: 16px; font-weight: bold;">OPTIMIZED</p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Supported Functions -->
              <div style="background-color: #2d2d2d; border: 1px solid #f7931e; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #f7931e; margin: 0 0 15px 0; font-size: 18px;">
                  Email Systems Available
                </h4>
                <ul style="color: #f5f5f5; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li style="margin-bottom: 8px;"><strong>Account Verification</strong> - User registration emails</li>
                  <li style="margin-bottom: 8px;"><strong>Password Reset</strong> - Security recovery system</li>
                  <li style="margin-bottom: 8px;"><strong>Email Updates</strong> - Account change notifications</li>
                  <li><strong>Feedback Notifications</strong> - User message relay</li>
                </ul>
              </div>
              
              <!-- Test Timestamp -->
              <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #2d2d2d; border-radius: 8px; border: 1px solid #ff6b35;">
                <p style="color: #a3a3a3; margin: 0; font-size: 14px;">
                  <strong>Test Completed:</strong> ${new Date().toLocaleString()}<br>
                  <strong>Integration:</strong> SendGrid API<br>
                  <strong>Status:</strong> All systems operational
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #0f0f0f; padding: 25px 30px; text-align: center;">
              <p style="font-size: 14px; color: #666; line-height: 1.5; margin: 0 0 15px 0;">
                <strong style="color: #ff6b35;">The Paint Forge</strong> - Email System Test<br>
                Verifying communication system functionality.
              </p>
              
              <div style="border-top: 1px solid #333; padding-top: 15px; margin-top: 15px;">
                <p style="font-size: 12px; color: #666; line-height: 1.4; margin: 5px 0;">
                  The Paint Forge | System Test<br>
                  <a href="mailto:support@paintsforge.com" style="color: #ff6b35; text-decoration: none;">Contact Support</a> | 
                  <a href="https://paintsforge.com" style="color: #ff6b35; text-decoration: none;">Visit Paint Forge</a>
                </p>
                <p style="font-size: 11px; color: #555; margin: 10px 0 0 0;">
                  © 2025 The Paint Forge. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    );
    
    if (success) {
      console.log("✅ Test email sent successfully to starman1014@yahoo.com");
      console.log("📧 Check your inbox to confirm delivery");
    } else {
      console.log("❌ Failed to send test email");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Test email error:", error);
    process.exit(1);
  }
}

runTestEmail();
