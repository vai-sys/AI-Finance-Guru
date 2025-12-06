const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

  
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, unique: true },


  password: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
 


  avatarUrl: { type: String },
  bio: { type: String },
  location: { type: String },



  preferredLanguage: { type: String, default: "en" },


  lastLoginAt: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },

  resetPasswordToken: String,
  resetPasswordExpires: Date,

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
