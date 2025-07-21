import nodemailer from 'nodemailer';

// Create transporter for IONOS SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.ionos.com', // IONOS SMTP server
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.IONOS_EMAIL_USER,
      pass: process.env.IONOS_EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  try {
    // Check if email credentials are configured
    if (!process.env.IONOS_EMAIL_USER || !process.env.IONOS_EMAIL_PASSWORD) {
      console.log(`Email verification link for ${email}: ${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${token}`);
      return true; // Return true for development
    }

    const transporter = createTransporter();
    const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: `"The Paint Forge" <${process.env.IONOS_EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Paint Forge Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #f5f5f5; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 20px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">The Paint Forge</h1>
            <p style="margin: 10px 0 0 0; color: white; opacity: 0.9;">Verify Your Account</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #ff6b35; margin-top: 0;">Welcome to The Paint Forge!</h2>
            
            <p style="line-height: 1.6; margin-bottom: 20px;">
              Thank you for creating your account. To complete your registration and start managing your paint inventory, please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 12px 30px; 
                        border-radius: 6px; 
                        font-weight: bold; 
                        display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="line-height: 1.6; font-size: 14px; color: #a3a3a3;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; font-size: 14px; color: #ff6b35; margin-bottom: 20px;">
              ${verificationUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #666; line-height: 1.4;">
              This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.
            </p>
          </div>
        </div>
      `,
      text: `
Welcome to The Paint Forge!

Thank you for creating your account. To complete your registration, please verify your email address by visiting this link:

${verificationUrl}

This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.

The Paint Forge Team
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Log the verification link as fallback
    console.log(`Email verification link for ${email}: ${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${token}`);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  try {
    // Check if email credentials are configured
    if (!process.env.IONOS_EMAIL_USER || !process.env.IONOS_EMAIL_PASSWORD) {
      console.log(`Password reset link for ${email}: ${process.env.BASE_URL || 'http://localhost:5000'}/reset-password?token=${token}`);
      return true; // Return true for development
    }

    const transporter = createTransporter();
    const resetUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"The Paint Forge" <${process.env.IONOS_EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Paint Forge Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #f5f5f5; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 20px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">The Paint Forge</h1>
            <p style="margin: 10px 0 0 0; color: white; opacity: 0.9;">Password Reset Request</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #ff6b35; margin-top: 0;">Reset Your Password</h2>
            
            <p style="line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your Paint Forge account password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 12px 30px; 
                        border-radius: 6px; 
                        font-weight: bold; 
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="line-height: 1.6; font-size: 14px; color: #a3a3a3;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; font-size: 14px; color: #ff6b35; margin-bottom: 20px;">
              ${resetUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #666; line-height: 1.4;">
              This password reset link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.
            </p>
          </div>
        </div>
      `,
      text: `
Reset Your Paint Forge Password

We received a request to reset your Paint Forge account password. Visit this link to create a new password:

${resetUrl}

This password reset link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.

The Paint Forge Team
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    // Log the reset link as fallback
    console.log(`Password reset link for ${email}: ${process.env.BASE_URL || 'http://localhost:5000'}/reset-password?token=${token}`);
    return false;
  }
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    if (!process.env.IONOS_EMAIL_USER || !process.env.IONOS_EMAIL_PASSWORD) {
      return false;
    }

    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('IONOS email connection test failed:', error);
    return false;
  }
}

export async function sendTestEmail(email: string, subject: string, htmlContent: string): Promise<boolean> {
  try {
    // Check if email credentials are configured
    if (!process.env.IONOS_EMAIL_USER || !process.env.IONOS_EMAIL_PASSWORD) {
      console.log(`Test email would be sent to: ${email}`);
      console.log(`Subject: ${subject}`);
      return true; // Return true for development
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"The Paint Forge" <${process.env.IONOS_EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Test email sent successfully via IONOS to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ IONOS email sending failed:', error);
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
    // Check if email credentials are configured
    if (!process.env.IONOS_EMAIL_USER || !process.env.IONOS_EMAIL_PASSWORD) {
      console.log(`Feedback notification for support@paintsforge.com:`);
      console.log(`Type: ${feedbackType}`);
      console.log(`From: ${userName} (${userEmail})`);
      console.log(`Message: ${message}`);
      return true; // Return true for development
    }

    const transporter = createTransporter();
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: `"The Paint Forge" <${process.env.IONOS_EMAIL_USER}>`,
      to: 'support@paintsforge.com',
      subject: `New ${feedbackType} from ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #f5f5f5; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 20px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">The Paint Forge</h1>
            <p style="margin: 10px 0 0 0; color: white; opacity: 0.9;">New User Feedback</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #ff6b35; margin-top: 0;">${feedbackType}</h2>
            
            <div style="background-color: #333; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #fff; margin-top: 0; font-size: 16px;">User Information</h3>
              <p style="margin: 5px 0; color: #a3a3a3;"><strong>Name:</strong> ${userName}</p>
              <p style="margin: 5px 0; color: #a3a3a3;"><strong>Email:</strong> ${userEmail}</p>
              <p style="margin: 5px 0; color: #a3a3a3;"><strong>Date:</strong> ${currentDate}</p>
              <p style="margin: 5px 0; color: #a3a3a3;"><strong>Type:</strong> ${feedbackType}</p>
            </div>
            
            <h3 style="color: #fff; margin-top: 30px;">Message</h3>
            <div style="background-color: #2a2a2a; padding: 20px; border-radius: 6px; border-left: 4px solid #ff6b35;">
              <p style="color: #fff; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #666; line-height: 1.4; text-align: center;">
              This feedback was submitted through The Paint Forge feedback form.<br>
              Please respond to the user at ${userEmail}
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Feedback notification sent to support@paintsforge.com`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send feedback notification:', error);
    return false;
  }
}