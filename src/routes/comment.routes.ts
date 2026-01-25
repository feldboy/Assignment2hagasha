import { Router } from 'express';
import * as commentController from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protected routes
router.post('/:postId', authenticate, commentController.createComment);
router.put('/:id', authenticate, commentController.updateComment);
router.delete('/:id', authenticate, commentController.deleteComment);

// Public routes
router.get('/post/:postId', commentController.getCommentsByPost);
router.get('/:id', commentController.getCommentById);

export default router;

