import express from "express";
import cors from "cors";


const app = express();
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173']
}));


export default app;