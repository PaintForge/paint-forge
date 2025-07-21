import nodemailer from 'nodemailer';

async function testConnection() {
  console.log("Testing IONOS email connection...");
  
  if (!process.env.IONOS_EMAIL_USER || !process.env.IONOS_EMAIL_PASSWORD) {
    console.log("❌ Missing IONOS email credentials");
    return;
  }
  
  console.log(`📧 Using email: ${process.env.IONOS_EMAIL_USER}`);
  console.log(`🔑 Password length: ${process.env.IONOS_EMAIL_PASSWORD.length} characters`);
  
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ionos.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.IONOS_EMAIL_USER,
        pass: process.env.IONOS_EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    console.log("🔍 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection successful!");
    
  } catch (error: any) {
    console.log("❌ SMTP connection failed:");
    console.log("Error code:", error.code);
    console.log("Response:", error.response);
    
    if (error.code === 'EAUTH') {
      console.log("\n🔧 **IONOS Authentication Issue**");
      console.log("The error suggests authentication problems. Here's what to check:");
      console.log("1. Verify your IONOS email credentials are correct");
      console.log("2. Check if the email account exists and is active");
      console.log("3. Ensure SMTP access is enabled for your IONOS email");
      console.log("4. Try logging into webmail to verify the password works");
    }
  }
  
  process.exit(0);
}

testConnection();