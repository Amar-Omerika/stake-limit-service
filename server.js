import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

import connectDB from "./src/db/mongoose.js";
import deviceConfigRoutes from "./src/routes/DeviceRoutes.js";
import ticketRoutes from "./src/routes/TicketRoutes.js";
import RedisCache from "./src/utils/RedisCache.js";

// Db connection
connectDB();

const app = express();

// Basic security middlewares
app.use(helmet()); // Adds security headers
app.use(express.json({ limit: "10kb" })); // Limit payload size

// General rate limiting for all routes
const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: "Too many requests, please try again later",
});
app.use(generalLimiter);

// CORS headers
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*"); // Change in production
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
	next();
});

// Routes
app.use("/device-config", deviceConfigRoutes);
app.use("/process-ticket", ticketRoutes);

// Start server
app.listen(3000, () => {
	console.log("Server started on port 3000");
});

process.on("SIGINT", async () => {
	try {
		// Close MongoDB connection
		await mongoose.connection.close();
		console.log("MongoDB connection closed due to app termination");

		// Close Redis connection
		await RedisCache.disconnect();
		console.log("Redis connection closed due to app termination");

		process.exit(0);
	} catch (err) {
		console.error("Error while closing connections:", err);
		process.exit(1);
	}
});
