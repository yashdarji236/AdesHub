import dns from "dns";
import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";

dotenv.config();

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dns.setDefaultResultOrder("ipv4first");

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});