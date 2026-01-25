import { Response } from 'express';
import Post from '../models/Post';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllPosts = async (req: AuthRequest, res: Response) => {
    try {
        const posts = await Post.find()
            .populate('owner', 'username email profilePicture')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getPostById = async (req: AuthRequest, res: Response) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('owner', 'username email profilePicture');
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        res.json(post);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const createPost = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const post = new Post({
            title,
            content,
            owner: req.userId,
            sender: req.userId
        });

        const savedPost = await post.save();
        const populatedPost = await Post.findById(savedPost._id)
            .populate('owner', 'username email profilePicture');

        res.status(201).json(populatedPost);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }

        const { title, content } = req.body;
        
        if (title) post.title = title;
        if (content) post.content = content;

        const updatedPost = await post.save();
        const populatedPost = await Post.findById(updatedPost._id)
            .populate('owner', 'username email profilePicture');

        res.json(populatedPost);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await post.deleteOne();
        res.json({ message: 'Post deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

