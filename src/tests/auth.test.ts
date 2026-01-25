import request from 'supertest';
import app from '../app';

describe('Auth Endpoints', () => {
  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should fail with duplicate email', async () => {
      await request(app).post('/auth/register').send({
        username: 'user1',
        email: 'test@example.com',
        password: 'password123'
      });

      const res = await request(app).post('/auth/register').send({
        username: 'user2',
        email: 'test@example.com',
        password: 'password123'
      });

      expect(res.status).toBe(400);
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser'
        });
      
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should login existing user', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout with valid refresh token', async () => {
      const registerRes = await request(app).post('/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const refreshToken = registerRes.body.refreshToken;

      const res = await request(app)
        .post('/auth/logout')
        .send({ refreshToken });
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const registerRes = await request(app).post('/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const refreshToken = registerRes.body.refreshToken;

      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should fail with invalid refresh token', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' });
      
      expect(res.status).toBe(403);
    });
  });
});

