"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.logout = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../utils/jwt");
const register = async (req, res) => {
    try {
        const { username, email, password, profilePicture, bio } = req.body;
        const existingUser = await User_1.default.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = new User_1.default({
            username,
            email,
            password: hashedPassword,
            profilePicture,
            bio
        });
        const accessToken = (0, jwt_1.generateAccessToken)(user._id.toString());
        const refreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString());
        user.refreshTokens = [refreshToken];
        await user.save();
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            accessToken,
            refreshToken
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user)
            return res.status(400).json({ message: 'Invalid credentials' });
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Invalid credentials' });
        const accessToken = (0, jwt_1.generateAccessToken)(user._id.toString());
        const refreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString());
        if (!user.refreshTokens)
            user.refreshTokens = [];
        user.refreshTokens.push(refreshToken);
        await user.save();
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            accessToken,
            refreshToken
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken)
            return res.status(400).json({ message: 'RefreshToken required' });
        const user = await User_1.default.findOne({ refreshTokens: refreshToken });
        if (!user) {
            return res.status(200).json({ message: 'Logged out successfully' });
        }
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.logout = logout;
const refresh = async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken)
        return res.status(401).json({ message: 'RefreshToken required' });
    try {
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const user = await User_1.default.findOne({ _id: decoded.userId, refreshTokens: refreshToken });
        if (!user)
            return res.status(403).json({ message: 'Invalid refresh token' });
        const newAccessToken = (0, jwt_1.generateAccessToken)(user._id.toString());
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString());
        // Replace old refresh token with new one (rotational)
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        await user.save();
        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    }
    catch (err) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};
exports.refresh = refresh;
