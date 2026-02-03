const User = require('../models/User');

const getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};

const updateProfile = async (req, res) => {
  res.status(200).json({ success: true, message: 'Update profile' });
};

const getAllUsers = async (req, res) => {
  res.status(200).json({ success: true, data: [] });
};

const getUserById = async (req, res) => {
  res.status(200).json({ success: true, data: {} });
};

const createUser = async (req, res) => {
  res.status(201).json({ success: true, message: 'Create user' });
};

const updateUser = async (req, res) => {
  res.status(200).json({ success: true, message: 'Update user' });
};

const deleteUser = async (req, res) => {
  res.status(200).json({ success: true, message: 'Delete user' });
};

const updateUserStatus = async (req, res) => {
  res.status(200).json({ success: true, message: 'Update status' });
};

const importUsers = async (req, res) => {
  res.status(200).json({ success: true, message: 'Import users' });
};

module.exports = {
  getMe,
  updateProfile,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  importUsers,
};
