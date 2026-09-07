import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { username, email, password, role, department, phoneNumber } = req.body;

    // Check if user exists with email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if username exists
    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Prevent direct admin registration
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot register as admin through signup'
      });
    }

    // Validate role
    const validRoles = ['employee', 'technician'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Create user
    const user = await User.create({
      username: username.toLowerCase(),
      email,
      password,
      role: role || 'employee',
      department,
      phoneNumber
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          department: user.department,
          phoneNumber: user.phoneNumber,
          avatar: user.avatar,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        },
        token
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate credentials
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username/email and password'
      });
    }

    // Check for user by email OR username (include password for comparison)
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // If role is provided, verify it matches
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Invalid credentials for ${role} login`
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          department: user.department,
          phoneNumber: user.phoneNumber,
          avatar: user.avatar,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          department: user.department,
          phoneNumber: user.phoneNumber,
          avatar: user.avatar,
          isActive: user.isActive,
          isAvailable: user.isAvailable,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: {}
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { username, name, phoneNumber, department } = req.body;

    const user = await User.findById(req.user._id);

    // If username is being updated, check if it's already taken
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({
        username: username.toLowerCase(),
        _id: { $ne: req.user._id }
      });
      
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
      
      user.username = username.toLowerCase();
    }

    if (name !== undefined) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (department) user.department = department;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          department: user.department,
          phoneNumber: user.phoneNumber,
          avatar: user.avatar,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// @desc    Delete account
// @route   DELETE /api/auth/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide password to confirm account deletion'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Prevent admin from deleting own account
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be self-deleted. Contact system administrator.'
      });
    }

    // Delete user
    await User.findByIdAndDelete(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
};

// @desc    Update technician availability status
// @route   PUT /api/auth/availability
// @access  Private (Technicians only)
export const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    // Only technicians can update availability
    if (req.user.role !== 'technician') {
      return res.status(403).json({
        success: false,
        message: 'Only technicians can update availability status'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isAvailable },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Availability updated to ${isAvailable ? 'available' : 'unavailable'}`,
      data: {
        isAvailable: user.isAvailable
      }
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability',
      error: error.message
    });
  }
};
