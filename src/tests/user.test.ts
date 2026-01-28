import request from 'supertest';
import app from '../app';
import User from '../models/User';
import bcrypt from 'bcryptjs';

describe('User Endpoints', () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
        // Create a user for authentication
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: hashedPassword
        });
        await user.save();
        userId = user._id.toString();

        // Login to get token
        const loginRes = await request(app)
            .post('/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        authToken = loginRes.body.accessToken;
    });

    describe('GET /users', () => {
        it('should get all users', async () => {
            const res = await request(app).get('/users');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('GET /users/:id', () => {
        it('should get user by ID', async () => {
            const res = await request(app).get(`/users/${userId}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('username', 'testuser');
            expect(res.body).toHaveProperty('email', 'test@example.com');
        });

        it('should return 404 for non-existent user ID', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011';
            const res = await request(app).get(`/users/${nonExistentId}`);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'User not found');
        });
    });

    describe('POST /users', () => {
        it('should create a new user', async () => {
            const res = await request(app)
                .post('/users')
                .send({
                    username: 'newuser',
                    email: 'new@example.com',
                    password: 'password123',
                    bio: 'Interested in tech'
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('username', 'newuser');
            expect(res.body).toHaveProperty('email', 'new@example.com');
        });

        it('should fail with duplicate email', async () => {
            const res = await request(app)
                .post('/users')
                .send({
                    username: 'user2',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'User with this email or username already exists');
        });
    });

    describe('PUT /users/:id', () => {
        it('should update user information', async () => {
            const res = await request(app)
                .put(`/users/${userId}`)
                .send({
                    bio: 'Updated bio',
                    profilePicture: 'http://example.com/pic.jpg'
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('bio', 'Updated bio');
            expect(res.body).toHaveProperty('profilePicture', 'http://example.com/pic.jpg');
        });

        it('should return 404 when updating non-existent user', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011';
            const res = await request(app)
                .put(`/users/${nonExistentId}`)
                .send({ bio: 'Update attempt' });

            expect(res.status).toBe(404);
        });
    });

    describe('DELETE /users/:id', () => {
        it('should delete user', async () => {
            const res = await request(app).delete(`/users/${userId}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'User deleted');

            // Verify user is gone
            const secondGet = await request(app).get(`/users/${userId}`);
            expect(secondGet.status).toBe(404);
        });

        it('should return 404 when deleting non-existent user', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011';
            const res = await request(app).delete(`/users/${nonExistentId}`);

            expect(res.status).toBe(404);
        });
    });
});
