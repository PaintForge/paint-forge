import { sendTestEmail } from "./email";

async function runTestEmail() {
  try {
    console.log("Sending test email via IONOS...");
    
    const success = await sendTestEmail(
      "starman1014@yahoo.com",
      "Test Email from The Paint Forge (IONOS)",
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1c1917 0%, #292524 100%);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
            🔨 The Paint Forge
          </h1>
          <p style="color: #fed7aa; margin: 10px 0 0 0; font-size: 16px;">
            Email System Test
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px; background: #1c1917; color: #e7e5e4;">
          <h2 style="color: #ea580c; margin-top: 0;">IONOS Email Integration Test</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            This is a test email to verify that The Paint Forge email system is working correctly with your IONOS email service.
          </p>
          
          <div style="background: #292524; padding: 20px; border-radius: 8px; border-left: 4px solid #ea580c; margin: 20px 0;">
            <h3 style="color: #ea580c; margin-top: 0;">Test Details:</h3>
            <ul style="color: #d6d3d1; margin: 10px 0;">
              <li>✅ IONOS SMTP integration configured</li>
              <li>✅ No-reply email system working</li>
              <li>✅ HTML email templates working</li>
              <li>✅ Professional email styling</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            If you received this email, your IONOS email system is working perfectly for:
          </p>
          
          <ul style="color: #d6d3d1; font-size: 16px; line-height: 1.6;">
            <li>Account verification emails</li>
            <li>Password reset notifications</li>
            <li>Email change confirmations</li>
            <li>User feedback notifications</li>
          </ul>
          
          <div style="text-align: center; margin-top: 40px;">
            <p style="color: #a8a29e; font-size: 14px;">
              Sent from The Paint Forge Email System via IONOS<br>
              ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #0c0a09; padding: 20px; text-align: center; border-top: 2px solid #ea580c;">
          <p style="color: #78716c; font-size: 14px; margin: 0;">
            © 2025 The Paint Forge. All rights reserved.
          </p>
        </div>
      </div>
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