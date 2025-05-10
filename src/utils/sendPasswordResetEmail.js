const crypto = require('crypto');
const Token = require('../models/token.model');
const transporter = require('../config/emailConfig');
require('dotenv').config();

async function sendPasswordResetEmail(user) {
  // Generate token
  const tokenString = crypto.randomBytes(32).toString('hex');

  // Save token in DB
  const token = new Token({
    userId: user._id,
    token: tokenString
  });
  await token.save();

  // Compose email
  const resetLink = `${process.env.BASE_URL}/api/v1/auth/reset-password?token=${tokenString}&id=${user._id}`;

  const mailOptions = {
    from: `"Intellecta" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Reset your password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Intellecta Password</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #0a0a1a;
            color: #ffffff;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #0f123a 0%, #090d2e 100%);
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #2a3177;
            box-shadow: 0 0 30px rgba(56, 128, 255, 0.15);
          }
          .email-header {
            background: linear-gradient(180deg, #1a237e 0%, #141852 100%);
            padding: 30px 20px;
            text-align: center;
            border-bottom: 1px solid #3949ab;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 2px;
            text-shadow: 0 0 15px rgba(56, 182, 255, 0.6);
          }
          .stars {
            background-image: radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0, 0, 0, 0)),
                            radial-gradient(2px 2px at 40px 70px, #ffffff, rgba(0, 0, 0, 0)),
                            radial-gradient(1px 1px at 90px 40px, #ffffff, rgba(0, 0, 0, 0)),
                            radial-gradient(1px 1px at 160px 20px, #ffffff, rgba(0, 0, 0, 0));
            background-repeat: repeat;
            background-position: 0 0;
            height: 15px;
          }
          .email-content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          .email-greeting {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #7e92ff;
          }
          .email-message {
            margin-bottom: 30px;
            font-size: 16px;
            color: #d1d7ff;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .reset-button {
            background: linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%);
            color: #ffffff;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 30px;
            font-weight: bold;
            font-size: 16px;
            letter-spacing: 0.5px;
            display: inline-block;
            border: none;
            box-shadow: 0 5px 15px rgba(61, 81, 181, 0.4);
            transition: all 0.3s ease;
          }
          .reset-button:hover {
            box-shadow: 0 8px 20px rgba(61, 81, 181, 0.6);
            transform: translateY(-2px);
          }
          .backup-link {
            margin-top: 25px;
            font-size: 13px;
            color: #a0b0ff;
          }
          .backup-link a {
            color: #a0b0ff;
            text-decoration: underline;
            word-break: break-all;
          }
          .email-footer {
            background: #080a1e;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #8f97d2;
            border-top: 1px solid #2a3177;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <div class="stars"></div>
            <div class="logo">INTELLECTA</div>
            <div class="stars"></div>
          </div>
          <div class="email-content">
            <div class="email-greeting">Password Reset Request</div>
            <div class="email-message">
              We received a request to reset your password. Click the button below to create a new password.
              If you didn't request this, you can safely ignore this email.
            </div>
            <div class="button-container">
              <a href="${resetLink}" class="reset-button">Reset Password</a>
            </div>
            <div class="backup-link">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetLink}">${resetLink}</a>
            </div>
          </div>
          <div class="email-footer">
            &copy; ${new Date().getFullYear()} Intellecta. All rights reserved.<br>
            This email was sent because someone requested a password reset for your Intellecta account.
          </div>
        </div>
      </body>
      </html>
    `
  };

  // Send email
  await transporter.sendMail(mailOptions);
}

module.exports = sendPasswordResetEmail; 