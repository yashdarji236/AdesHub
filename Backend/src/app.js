import express from "express";
import cors from "cors";
import googleAuthRoutes from "./service/email.js";
import localAuthRoutes from "./Routes/auth.js";
import projectRoutes from "./Routes/projects.js";
import aiRoutes from "./Routes/ai.js";

const app = express();
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173']
}));

app.use(googleAuthRoutes);
app.use("/auth", localAuthRoutes);
app.use("/api/auth", localAuthRoutes);
app.use("/projects", projectRoutes);
app.use("/ai", aiRoutes);
app.use("/api/ai", aiRoutes);

export default app;