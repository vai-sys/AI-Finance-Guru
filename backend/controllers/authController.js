
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

const SALT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MESSAGE = "Too many failed attempts. Try again later.";

const RegisterUser = async (req, res) => {
  try {
    const { name, email, password, preferredLanguage } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, Email and Password are required" });
    }

    const normalizedEmail = email.toLowerCase();

    const duplicateEmail = await User.findOne({ email: normalizedEmail });
    if (duplicateEmail) {
      return res.status(400).json({ message: "Email already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,    
      preferredLanguage: preferredLanguage || "en",
    });

    await user.save();

    return res.status(201).json({
      message: "User created. Please login.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Internal server error. Please try again later.",
    });
  }
};

const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isDisabled) {
      return res.status(403).json({ message: "Account disabled" });
    }

    if ((user.failedLoginAttempts || 0) >= MAX_FAILED_ATTEMPTS) {
      return res.status(429).json({ message: LOCKOUT_MESSAGE });
    }

   
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      await user.save();

      return res.status(401).json({ message: "Invalid credentials" });
    }

 
    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date();
    await user.save();

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || "7d",
    });

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    return res.json({ user: req.user });
  } catch (err) {
    console.error("getProfile Error", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "avatarUrl",
      "bio",
      "location",
      "preferredLanguage",
    ];

    const updates = {};

    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    return res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      
    });

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  RegisterUser,
  LoginUser,
  getProfile,
  updateProfile,
  logoutUser,
};
