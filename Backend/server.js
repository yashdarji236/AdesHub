import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
dotenv.config();

connectDB();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}
)


