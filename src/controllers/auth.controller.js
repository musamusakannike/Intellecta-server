const User = require("../models/user.model");
const Token = require("../models/token.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const sendPasswordResetEmail = require("../utils/sendPasswordResetEmail");

const register = async (req, res) => {
  try {
    const { username, fullname, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "error", message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      fullname,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    await sendVerificationEmail(savedUser);

    res
      .status(201)
      .json({ status: "success", message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const userWithoutPassword = {
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      isVerified: user.isVerified,
      profileImage: user.profileImage || "",
      isPremium: user.isPremium,
      joinedDate: user.createdAt,
      role: user.role,
    };

    res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

const verifyEmail = async (req, res) => {
  const { token, id } = req.query;
  try {
    const verificationToken = await Token.findOne({ userId: id, token });
    if (!verificationToken) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Email Verification Failed</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
              }
              .container {
                text-align: center;
                padding: 2rem;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              h1 { color: #dc3545; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Verification Failed</h1>
              <p>Invalid or expired verification token.</p>
            </div>
          </body>
        </html>
      `);
    }

    await User.updateOne({ _id: id }, { isVerified: true });
    await Token.deleteOne({ _id: verificationToken._id });

    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Verified Successfully</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 { color: #28a745; }
            .checkmark {
              color: #28a745;
              font-size: 48px;
              margin-bottom: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">✓</div>
            <h1>Email Verified Successfully!</h1>
            <p>Your email has been verified. You can now log in to your account.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.log(error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Server Error</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 { color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Server Error</h1>
            <p>An unexpected error occurred. Please try again later.</p>
          </div>
        </body>
      </html>
    `);
  }
};

const requestVerifyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: "error", message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ status: "error", message: "User already verified" });
    }

    await sendVerificationEmail(user);

    res
      .status(200)
      .json({ status: "success", message: "Verification email sent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    await sendPasswordResetEmail(user);

    res
      .status(200)
      .json({ status: "success", message: "Password reset email sent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  const { token, id } = req.query;

  // If it's a GET request, serve the reset password form
  if (req.method === "GET") {
    try {
      const resetToken = await Token.findOne({ userId: id, token });
      if (!resetToken) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Password Reset Failed</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  background-color: #f5f5f5;
                }
                .container {
                  text-align: center;
                  padding: 2rem;
                  background-color: white;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                h1 { color: #dc3545; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Password Reset Failed</h1>
                <p>Invalid or expired reset token.</p>
              </div>
            </body>
          </html>
        `);
      }

      // Serve the reset password form
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Reset Your Password</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #0a0a1a;
                color: #ffffff;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .container {
                max-width: 500px;
                width: 90%;
                background: linear-gradient(135deg, #0f123a 0%, #090d2e 100%);
                border-radius: 16px;
                overflow: hidden;
                border: 1px solid #2a3177;
                box-shadow: 0 0 30px rgba(56, 128, 255, 0.15);
                padding: 40px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 32px;
                font-weight: bold;
                color: #ffffff;
                letter-spacing: 2px;
                text-shadow: 0 0 15px rgba(56, 182, 255, 0.6);
                margin-bottom: 20px;
              }
              h1 {
                color: #7e92ff;
                font-size: 24px;
                margin: 0;
              }
              .form-group {
                margin-bottom: 20px;
              }
              label {
                display: block;
                margin-bottom: 8px;
                color: #d1d7ff;
                font-size: 14px;
              }
              input[type="password"] {
                width: 100%;
                padding: 12px;
                border: 1px solid #2a3177;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.05);
                color: #ffffff;
                font-size: 16px;
                transition: all 0.3s ease;
                box-sizing: border-box;
              }
              input[type="password"]:focus {
                outline: none;
                border-color: #3f51b5;
                box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
              }
              button {
                width: 100%;
                padding: 14px;
                background: linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%);
                color: #ffffff;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 10px;
              }
              button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(61, 81, 181, 0.4);
              }
              .error {
                color: #ff6b6b;
                font-size: 14px;
                margin-top: 5px;
                display: none;
              }
              .success {
                color: #4caf50;
                font-size: 14px;
                margin-top: 5px;
                display: none;
                text-align: center;
              }
              .stars {
                background-image: radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0, 0, 0, 0)),
                                radial-gradient(2px 2px at 40px 70px, #ffffff, rgba(0, 0, 0, 0)),
                                radial-gradient(1px 1px at 90px 40px, #ffffff, rgba(0, 0, 0, 0)),
                                radial-gradient(1px 1px at 160px 20px, #ffffff, rgba(0, 0, 0, 0));
                background-repeat: repeat;
                background-position: 0 0;
                height: 15px;
                margin-bottom: 20px;
              }
              .success-container {
                text-align: center;
                padding: 20px;
                display: none;
              }
              .success-icon {
                color: #4caf50;
                font-size: 48px;
                margin-bottom: 20px;
              }
              .success-title {
                color: #7e92ff;
                font-size: 24px;
                margin-bottom: 15px;
              }
              .success-message {
                color: #d1d7ff;
                font-size: 16px;
                line-height: 1.6;
              }
              .login-link {
                display: inline-block;
                margin-top: 20px;
                color: #7e92ff;
                text-decoration: none;
                font-weight: bold;
                transition: color 0.3s ease;
              }
              .login-link:hover {
                color: #a0b0ff;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="stars"></div>
                <div class="logo">INTELLECTA</div>
                <h1>Reset Your Password</h1>
              </div>
              <form id="resetForm" method="POST">
                <div class="form-group">
                  <label for="password">New Password</label>
                  <input type="password" id="password" name="password" required minlength="6" placeholder="Enter your new password">
                  <div class="error" id="passwordError"></div>
                </div>
                <div class="form-group">
                  <label for="confirmPassword">Confirm Password</label>
                  <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6" placeholder="Confirm your new password">
                  <div class="error" id="confirmPasswordError"></div>
                </div>
                <input type="hidden" name="token" value="${token}">
                <input type="hidden" name="id" value="${id}">
                <button type="submit">Reset Password</button>
              </form>
              <div id="successContainer" class="success-container">
                <div class="success-icon">✓</div>
                <div class="success-title">Password Reset Successful!</div>
                <div class="success-message">Your password has been successfully reset. You can now log in with your new password.</div>
                <a href="/login" class="login-link">Go to Login</a>
              </div>
            </div>
      
            <script>
              document.getElementById('resetForm').addEventListener('submit', async function(event) {
                event.preventDefault();
                
                // Reset error messages
                document.getElementById('passwordError').style.display = 'none';
                document.getElementById('confirmPasswordError').style.display = 'none';
      
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
      
                // Validate passwords match
                if (password !== confirmPassword) {
                  document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
                  document.getElementById('confirmPasswordError').style.display = 'block';
                  return;
                }
      
                try {
                  const formData = new FormData(this);
                  
                  const response = await fetch(window.location.href, {
                    method: 'POST',
                    body: formData
                  });
      
                  if (response.ok) {
                    // Show success message
                    document.getElementById('resetForm').style.display = 'none';
                    document.getElementById('successContainer').style.display = 'block';
                  } else {
                    const data = await response.json();
                    document.getElementById('passwordError').textContent = data.message || 'Failed to reset password';
                    document.getElementById('passwordError').style.display = 'block';
                  }
                } catch (error) {
                  document.getElementById('passwordError').textContent = 'An error occurred. Please try again.';
                  document.getElementById('passwordError').style.display = 'block';
                }
              });
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.log(error);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Server Error</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
              }
              .container {
                text-align: center;
                padding: 2rem;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              h1 { color: #dc3545; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Server Error</h1>
              <p>An unexpected error occurred. Please try again later.</p>
            </div>
          </body>
        </html>
      `);
    }
    return;
  }

  // Handle POST request for password reset
  try {
    // Use express.urlencoded middleware to parse form data
    const { password, token, id } = req.body;

    const resetToken = await Token.findOne({ userId: id, token });

    if (!resetToken) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid or expired reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.updateOne({ _id: id }, { password: hashedPassword });
    await Token.deleteOne({ _id: resetToken._id });

    // Return JSON response for AJAX or redirect for form submission
    if (req.headers["content-type"] === "application/json") {
      return res
        .status(200)
        .json({ status: "success", message: "Password reset successful" });
    } else {
      // For traditional form submission
      return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Password Reset Success</title>
          <style>
            /* Your success page styles */
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Password Reset Successful</h1>
            <p>You can now log in with your new password.</p>
          </div>
        </body>
      </html>
    `);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  requestVerifyEmail,
};
