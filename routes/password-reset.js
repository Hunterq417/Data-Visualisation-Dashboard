const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const { hash: hashPassword } = require('../lib/passwords');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const resetTokens = new Map();

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ 
      email: String(email).toLowerCase().trim() 
    });

    if (!user) {
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;

    resetTokens.set(resetToken, {
      userId: user._id.toString(),
      email: user.email,
      expiry: resetTokenExpiry
    });

    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset URL: http://localhost:5173/reset-password?token=${resetToken}`);

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        error: 'Reset token and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    const tokenData = resetTokens.get(token);
    
    if (!tokenData) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    if (Date.now() > tokenData.expiry) {
      resetTokens.delete(token);
      return res.status(400).json({ 
        error: 'Reset token has expired' 
      });
    }

    const user = await User.findById(tokenData.userId);
    if (!user) {
      resetTokens.delete(token);
      return res.status(400).json({ 
        error: 'Invalid reset token' 
      });
    }

    const passwordHash = await hashPassword(newPassword);
    
    user.passwordHash = passwordHash;
    await user.save();

    resetTokens.delete(token);

    res.json({ 
      message: 'Password has been successfully reset. You can now log in with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

router.get('/validate-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const tokenData = resetTokens.get(token);
    
    if (!tokenData) {
      return res.status(400).json({ 
        valid: false,
        error: 'Invalid reset token' 
      });
    }

    if (Date.now() > tokenData.expiry) {
      resetTokens.delete(token);
      return res.status(400).json({ 
        valid: false,
        error: 'Reset token has expired' 
      });
    }

    res.json({ 
      valid: true,
      email: tokenData.email 
    });
  } catch (error) {
    console.error('Validate token error:', error);
    res.status(500).json({ error: 'Failed to validate token' });
  }
});

router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.provider === 'local') {
      const { verify: verifyPassword } = require('../lib/passwords');
      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      
      if (!isValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    const passwordHash = await hashPassword(newPassword);
    
    user.passwordHash = passwordHash;
    user.provider = 'local';
    await user.save();

    res.json({ 
      message: 'Password has been successfully changed.' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;