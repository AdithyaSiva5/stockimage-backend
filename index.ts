import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db';
import apiRoutes from './routes/apiRoutes';

import cors from 'cors';
import http from 'http';
import { verifyJWTToken } from './middleware/verifyJWTToken'; 
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: true, // This can be restricted to specific domains in production
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// Serve static files from the "public" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log(__dirname, "__dirname");


// Routes
app.use('/api', apiRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.message);
    res.status(500).send('Something went wrong!');
});

connectDB()
    .then(() => {
        console.log('MongoDB connected');

        const PORT = process.env.PORT || 3001;
        const server = http.createServer(app);

        server.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });
