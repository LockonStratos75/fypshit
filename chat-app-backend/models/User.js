// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    lastLogin: { type: Date },
});

module.exports = mongoose.model('User', userSchema);
