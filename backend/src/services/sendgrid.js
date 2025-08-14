import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (!process.env.SENDGRID_API_KEY) {
  console.warn('⚠️ SENDGRID_API_KEY not found in environment variables');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} resetUrl - Password reset URL
 * @param {string} userName - User's name (optional)
 * @returns {Promise<Object>} - SendGrid response
 */
export const sendPasswordResetEmail = async (email, resetUrl, userName = 'User') => {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SendGrid API key not configured');
  }

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #667eea;">
          <h2 style="color: #333; margin-top: 0;">Hello ${userName},</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
          </p>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            To reset your password, click the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold; 
                      font-size: 16px;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          
          <p style="color: #667eea; word-break: break-all; font-size: 14px; background: #f1f3f4; padding: 10px; border-radius: 5px;">
            ${resetUrl}
          </p>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            This link will expire in 1 hour for security reasons.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>
      </div>
    `,
    text: `
      Password Reset Request
      
      Hello ${userName},
      
      We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
      
      To reset your password, visit this link:
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request a password reset, please ignore this email or contact support if you have concerns.
    `
  };

  try {
    const response = await sgMail.send(msg);
    console.log('Password reset email sent successfully');
    return { success: true, response };
  } catch (error) {
    console.error('SendGrid email error:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send welcome email
 * @param {string} email - User's email address
 * @param {string} userName - User's name
 * @returns {Promise<Object>} - SendGrid response
 */
export const sendWelcomeEmail = async (email, userName) => {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SendGrid API key not configured');
  }

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
    subject: 'Welcome to Resume ATS!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Resume ATS!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #667eea;">
          <h2 style="color: #333; margin-top: 0;">Hello ${userName},</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Welcome to Resume ATS! Your account has been successfully created.
          </p>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            You can now start using our AI-powered resume analysis and job matching features.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold; 
                      font-size: 16px;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Get Started
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            Thank you for choosing Resume ATS!
          </p>
        </div>
      </div>
    `,
    text: `
      Welcome to Resume ATS!
      
      Hello ${userName},
      
      Welcome to Resume ATS! Your account has been successfully created.
      
      You can now start using our AI-powered resume analysis and job matching features.
      
      Visit our dashboard to get started: ${process.env.FRONTEND_URL}/dashboard
      
      Thank you for choosing Resume ATS!
    `
  };

  try {
    const response = await sgMail.send(msg);
    console.log('Welcome email sent successfully');
    return { success: true, response };
  } catch (error) {
    console.error('SendGrid welcome email error:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    throw new Error('Failed to send welcome email');
  }
};

export default {
  sendPasswordResetEmail,
  sendWelcomeEmail
};
