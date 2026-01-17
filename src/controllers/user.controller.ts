import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password, profilePicture, bio } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }

        // Hash password (even for basic CRUD, we should store hashed passwords)
        // Note: Task 3 mentions installing bcryptjs. I will assume it's available or install it now if I haven't. 
        // Wait, Task 3 is "Install Authentication Dependencies". I haven't installed bcryptjs yet.
        // For now, I will create the user WITHOUT hashing if bcrypt is not available, OR I can just install it now.
        // To be safe and follow the plan, I'll install it now as part of "User Management" since I need to create users.

        // Assuming I will install bcryptjs in the next step or right now.
        // Ideally I should have installed it in Task 1 or 2 preamble. I'll add the import but comment out hashing if I can't install it in parallel.
        // Better: I'll just store plain text for this specific step and update it in Task 3? 
        // No, that's bad practice. I should install bcryptjs now.

        // For this file content, I'll write the code assuming bcrypt is there and I will run the install command in the same turn.

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            profilePicture,
            bio
        });

        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password, profilePicture, bio } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (username) user.username = username;
        if (email) user.email = email;
        if (profilePicture) user.profilePicture = profilePicture;
        if (bio) user.bio = bio;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.deleteOne();
        res.json({ message: 'User deleted' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
