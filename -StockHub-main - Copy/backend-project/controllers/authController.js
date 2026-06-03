const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const authController = {
  register: async (req, res, next) => {
    try {
      const { fullName, username, password } = req.body;

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists.',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const recoveryToken = crypto.randomBytes(4).toString('hex').toUpperCase();

      const user = await User.create({
        fullName,
        username,
        password: hashedPassword,
        recoveryToken,
      });

      const token = jwt.sign(
        { id: user._id, fullName: user.fullName, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        data: {
          token,
          user: { id: user._id, fullName: user.fullName, username: user.username },
          recoveryToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password.',
        });
      }

      const token = jwt.sign(
        { id: user._id, fullName: user.fullName, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          user: { id: user._id, fullName: user.fullName, username: user.username },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { username, recoveryToken, newPassword } = req.body;

      if (!username || !recoveryToken || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Username, recovery token, and new password are required.',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters.',
        });
      }

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      if (user.recoveryToken !== recoveryToken) {
        return res.status(400).json({
          success: false,
          message: 'Invalid recovery token.',
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password reset successful. You can now sign in with your new password.',
      });
    } catch (error) {
      next(error);
    }
  },

  getMe: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
