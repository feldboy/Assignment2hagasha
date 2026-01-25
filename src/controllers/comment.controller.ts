import { Response } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import { AuthRequest } from '../middleware/auth.middleware';

export const getCommentsByPost = async (req: AuthRequest, res: Response) => {
    try {
        const { postId } = req.params;
        
        const comments = await Comment.find({ post: postId })
            .populate('owner', 'username email profilePicture')
            .sort({ createdAt: -1 });
        
        res.json(comments);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getCommentById = async (req: AuthRequest, res: Response) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate('owner', 'username email profilePicture');
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        res.json(comment);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const createComment = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { postId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = new Comment({
            post: postId,
            content,
            owner: req.userId,
            sender: req.userId
        });

        const savedComment = await comment.save();
        const populatedComment = await Comment.findById(savedComment._id)
            .populate('owner', 'username email profilePicture');

        res.status(201).json(populatedComment);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const comment = await Comment.findById(req.params.id);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to update this comment' });
        }

        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        comment.content = content;
        comment.updatedAt = new Date();

        const updatedComment = await comment.save();
        const populatedComment = await Comment.findById(updatedComment._id)
            .populate('owner', 'username email profilePicture');

        res.json(populatedComment);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const comment = await Comment.findById(req.params.id);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await comment.deleteOne();
        res.json({ message: 'Comment deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

