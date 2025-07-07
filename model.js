const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  fullName: String,
  username: { type: String, unique: true },
  bio: String,
  college: String,
  degree: String,
  branch: String,
  year: String,
  skills: [String],
  profilePic: String,
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);
