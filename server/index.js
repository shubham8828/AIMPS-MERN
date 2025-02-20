import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import Routes from './routes/Routes.js';

dotenv.config();

const app = express();

// CORS configuration
app.use(
    cors({
        origin: ["https://aimps.vercel.app"],
        methods: ["POST", "GET", "PUT", "DELETE"],
        credentials: true,
    })
);

// Middleware to handle JSON payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// MongoDB Connection
const mongoURL = process.env.URL;
if (!mongoURL) {
    console.error("MongoDB connection URL is missing in environment variables.");
    process.exit(1); // Exit process if URL is missing
}

mongoose
    .connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process on connection failure
    });

// Define routes
app.use('/api', Routes);

// Health check route
app.get('/', (req, res) => {
    res.status(200).json({ server: "Server is running" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    console.error("Error starting server:", err);
});
