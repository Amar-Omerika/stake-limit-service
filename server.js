import express from 'express';
import mongoose from "mongoose";
import connectDB from "./src/db/mongoose.js";
import ticketController from './src/controllers/TicketController.js';
import deviceConfigController from './src/controllers/DeviceConfigController.js';
import apiKeyAuth from "./src/middleware/auth.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";


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

// Specific stricter rate limit for ticket processing
const ticketLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 30, // limit to 30 requests per minute
	message: "Too many ticket requests, please try again later",
});

// CORS headers
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*"); // Change in production
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
	next();
});

// Ticket route with additional specific rate limiting
app.post(
	"/process-ticket",
	apiKeyAuth,
	ticketLimiter,
	ticketController.processTicket
);

// Device config routes
app.post(
	"/device-config",
	apiKeyAuth,
	deviceConfigController.createDeviceConfig
);
app.put(
	"/device-config/:deviceId",
	apiKeyAuth,
	deviceConfigController.updateDeviceConfig
);
app.get(
	"/device-config/:deviceId",
	apiKeyAuth,
	deviceConfigController.getDeviceConfig
);
app.get("/device-config", apiKeyAuth, deviceConfigController.getAllDevices);
app.delete(
	"/device-config/:deviceId",
	apiKeyAuth,
	deviceConfigController.deleteDeviceConfig
);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error while closing MongoDB connection:', err);
    process.exit(1);
  }
});