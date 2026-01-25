import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './config/database';

dotenv.config();

const app: Application = express();

// Connect Database
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import commentRoutes from './routes/comment.routes';

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);

export default app;
