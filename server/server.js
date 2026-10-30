const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const caseRoutes = require("./routes/caseRoutes");
app.use("/api/cases", caseRoutes);

// Test the backend
app.get("/", (req, res) => {
res.json({
message: "SHADOW FILES Backend is running!",
status: "success",
});
});

// Test backend health and database connection
app.get("/api/health", (req, res) => {
res.json({
message: "SHADOW FILES backend health check",
backend: "running",
database:
mongoose.connection.readyState === 1 ? "connected" : "disconnected",
});
});

// Connect to MongoDB before starting the server
async function startServer() {
try {
if (!process.env.MONGODB_URI) {
throw new Error("MONGODB_URI is missing from the .env file");
}


await mongoose.connect(process.env.MONGODB_URI);

console.log("MongoDB connected successfully!");

app.listen(PORT, () => {
  console.log(`SHADOW FILES backend running on port ${PORT}`);
});


} catch (error) {
console.error("Failed to start SHADOW FILES:", error.message);
process.exit(1);
}
}

startServer();
