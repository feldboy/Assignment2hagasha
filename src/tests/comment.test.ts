import request from 'supertest';
import app from '../app';
import User from '../models/User';
import Post from '../models/Post';
import Comment from '../models/Comment';
import bcrypt from 'bcryptjs';

describe('Comment Endpoints', () => {
  let authToken: string;
  let userId: string;
  let postId: string;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword
    });
    await user.save();
    userId = user._id.toString();

    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = loginRes.body.accessToken;

    const post = new Post({
      title: 'Test Post',
      content: 'Test Content',
      owner: userId,
      sender: userId
    });
    await post.save();
    postId = post._id.toString();
  });

  describe('POST /comments/:postId', () => {
    it('should create a comment with authentication', async () => {
      const res = await request(app)
        .post(`/comments/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Test Comment'
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('content', 'Test Comment');
      expect(res.body.owner).toHaveProperty('username');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post(`/comments/${postId}`)
        .send({
          content: 'Test Comment'
        });
      
      expect(res.status).toBe(401);
    });
  });

  describe('GET /comments/post/:postId', () => {
    it('should get all comments for a post', async () => {
      const comment = new Comment({
        post: postId,
        content: 'Test Comment',
        owner: userId,
        sender: userId
      });
      await comment.save();

      const res = await request(app).get(`/comments/post/${postId}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /comments/:id', () => {
    it('should update own comment', async () => {
      const comment = new Comment({
        post: postId,
        content: 'Original Comment',
        owner: userId,
        sender: userId
      });
      await comment.save();

      const res = await request(app)
        .put(`/comments/${comment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated Comment'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.content).toBe('Updated Comment');
    });
  });

  describe('DELETE /comments/:id', () => {
    it('should delete own comment', async () => {
      const comment = new Comment({
        post: postId,
        content: 'To Delete',
        owner: userId,
        sender: userId
      });
      await comment.save();

      const res = await request(app)
        .delete(`/comments/${comment._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Comment deleted successfully');
    });
  });
});

