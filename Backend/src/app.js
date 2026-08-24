import express from "express";
import cors from "cors";
import googleAuthRoutes from "./service/email.js";
import localAuthRoutes from "./Routes/auth.js";
import projectRoutes from "./Routes/projects.js";
import aiRoutes from "./Routes/ai.js";
import inspirationRoutes from "./Routes/inspiration.js";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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
app.use("/inspiration", inspirationRoutes);
app.use("/api/inspiration", inspirationRoutes);

export default app;