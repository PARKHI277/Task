const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const { validationResult } = require("express-validator");

const RegisterUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const user = new User({
      name,
      email,

      password,
    });

    await user.save();

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: error.message });
  }
};

const LoginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || "20m";
    const accessToken = jwt.sign(
      { userId: user._id },
      "process.env.Secret_Key",
      {
        expiresIn: accessTokenExpiry,
      }
    );

    // Refresh Token
    const refreshToken = jwt.sign({ userId: user._id }, "refresh_secret_key");

    await User.updateOne({ _id: user._id }, { $set: { refreshToken } });

    const message = "logged in successfully";
    return res.status(200).json({
      accessToken,
      refreshToken,
      id: user._id,
      name: user.name,
      email: user.email,
      message,
    });
  } catch (error) {
    console.error("Error logging in User:", error);

    return res.status(500).json({ error: error.message });
  }
};

const getRefreshToken = async (req, res) => {
  const refreshToken = req.query.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ error: "Invalid refresh token" });

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ error: "Invalid refresh token" });

    jwt.verify(refreshToken, "refresh_secret_key", (err, user) => {
      if (err) return res.status(403).json({ error: "Invalid refresh token" });

      const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || "20m";
      const accessToken = jwt.sign(
        { userId: user._id },
        "process.env.Secret_Key",
        {
          expiresIn: accessTokenExpiry,
        }
      );
      res.json({ accessToken });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const logoutUser = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ error: "Invalid refresh token" });

  try {
    const user = await User.findOne({ refreshToken });
    if (user) {
      await User.updateOne({ _id: user._id }, { $set: { refreshToken: null } });
    }
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedData = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.log("Error In updating User:", error);
    return res.status(500).json({ error: error.message });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    console.log("Error in deleting User:", error);
    return res.status(400).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      // If the user with the specified ID is not found
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log("Error in getting User:", error);
    return res.status(400).json({ error: error.message });
  }
};

const resSetPassword = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { oldPassword, newPassword } = req.body;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // Check if the new password matches the regex pattern
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ error: "Invalid new password format" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: `user not found` });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: `incorrect password` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    let newHashedPassword = hashedPassword;

    await User.findByIdAndUpdate(userId, {
      password: newHashedPassword,
    });

    return res.status(200).json({ message: `password updated successfully` });
  } catch (error) {
    console.log("Error in Reseting Password:", error);
    return res.status(400).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json({ users });
  } catch (error) {
    console.log("Error in getting all users:", error);
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  RegisterUser,
  LoginUser,
  logoutUser,
  resSetPassword,
  getRefreshToken,
  getUserById,
  deleteUserById,
  updateUserById,
  getAllUsers,
};
