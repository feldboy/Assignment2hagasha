import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, profilePicture, bio } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            profilePicture,
            bio
        });

        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        user.refreshTokens = [refreshToken];
        await user.save();

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            accessToken,
            refreshToken
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        if (!user.refreshTokens) user.refreshTokens = [];
        user.refreshTokens.push(refreshToken);
        await user.save();

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            accessToken,
            refreshToken
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) return res.status(400).json({ message: 'RefreshToken required' });

        const user = await User.findOne({ refreshTokens: refreshToken });
        if (!user) {
            return res.status(200).json({ message: 'Logged out successfully' });
        }

        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const refresh = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'RefreshToken required' });

    try {
        const decoded = verifyRefreshToken(refreshToken) as { userId: string };
        const user = await User.findOne({ _id: decoded.userId, refreshTokens: refreshToken });

        if (!user) return res.status(403).json({ message: 'Invalid refresh token' });

        const newAccessToken = generateAccessToken(user._id.toString());
        const newRefreshToken = generateRefreshToken(user._id.toString());

        // Replace old refresh token with new one (rotational)
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        await user.save();

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};
