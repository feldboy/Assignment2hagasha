import request from 'supertest';
import app from '../app';
import User from '../models/User';
import Post from '../models/Post';
import bcrypt from 'bcryptjs';

describe('Post Endpoints', () => {
  let authToken: string;
  let userId: string;

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
  });

  describe('GET /posts', () => {
    it('should get all posts', async () => {
      const post = new Post({
        title: 'Test Post',
        content: 'Test Content',
        owner: userId,
        sender: userId
      });
      await post.save();

      const res = await request(app).get('/posts');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /posts', () => {
    it('should create a post with authentication', async () => {
      const res = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Post',
          content: 'Post Content'
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('title', 'New Post');
      expect(res.body).toHaveProperty('content', 'Post Content');
      expect(res.body.owner).toHaveProperty('username');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/posts')
        .send({
          title: 'New Post',
          content: 'Post Content'
        });
      
      expect(res.status).toBe(401);
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Post'
        });
      
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /posts/:id', () => {
    it('should update own post', async () => {
      const post = new Post({
        title: 'Original Title',
        content: 'Original Content',
        owner: userId,
        sender: userId
      });
      await post.save();

      const res = await request(app)
        .put(`/posts/${post._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
          content: 'Updated Content'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Title');
      expect(res.body.content).toBe('Updated Content');
    });

    it('should fail to update other user\'s post', async () => {
      const otherUser = new User({
        username: 'otheruser',
        email: 'other@example.com',
        password: await bcrypt.hash('password123', 10)
      });
      await otherUser.save();

      const post = new Post({
        title: 'Other Post',
        content: 'Other Content',
        owner: otherUser._id,
        sender: otherUser._id.toString()
      });
      await post.save();

      const res = await request(app)
        .put(`/posts/${post._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Hacked Title'
        });
      
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete own post', async () => {
      const post = new Post({
        title: 'To Delete',
        content: 'Content',
        owner: userId,
        sender: userId
      });
      await post.save();

      const res = await request(app)
        .delete(`/posts/${post._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Post deleted successfully');
    });

    it('should fail to delete other user\'s post', async () => {
      const otherUser = new User({
        username: 'otheruser',
        email: 'other@example.com',
        password: await bcrypt.hash('password123', 10)
      });
      await otherUser.save();

      const post = new Post({
        title: 'Other Post',
        content: 'Other Content',
        owner: otherUser._id,
        sender: otherUser._id.toString()
      });
      await post.save();

      const res = await request(app)
        .delete(`/posts/${post._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(403);
    });
  });
});

