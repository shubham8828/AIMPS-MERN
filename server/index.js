import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path'
import Routes from './routes/Routes.js';

dotenv.config();
const app = express(); 

const dirname=path.dirname("")
const buildpath =path.join(dirname,'../frontend/dist')
app.use(cors(
    
    // {
    //     origin: ["https://aimsps.vercel.app/","http://localhost:5173/"],
    //     methods: ["POST", "GET","PUT","DELETE"],
    //     credentials: true
    // }

));
app.use(express.json());

mongoose.connect(process.env.URL)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => { 
        console.error('MongoDB connection error:', error);
    });

// Middleware to handle larger payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Define routes
app.use('/api', Routes);

app.get('/', (req, res) => {
    res.status(200).json({server:"Server is running"})

    
  });  


const PORT = process.env.PORT||4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
  