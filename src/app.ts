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

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

export default app;
