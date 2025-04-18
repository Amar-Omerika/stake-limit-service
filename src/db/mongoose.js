import mongoose from 'mongoose';

//Add pooling to the MongoDB connection
// reference link https://mongoosejs.com/docs/connections.html#connection-pooling
const connectDB = async () => {
  try {
		// Use environment variable or fallback to local development URL
		const mongoURI =
			process.env.MONGODB_URI ||
			"mongodb://localhost:27017/stake-limit-service";

		await mongoose.connect(mongoURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			// Connection pool options
			maxPoolSize: 10,
			minPoolSize: 2,
			socketTimeoutMS: 45000,
			family: 4,
		});

		console.log("MongoDB connected with connection pooling");

		// Event listeners for debugging
		mongoose.connection.on("connected", () => {
			console.log("MongoDB connection established");
		});

		mongoose.connection.on("disconnected", () => {
			console.log("MongoDB connection disconnected");
		});

		mongoose.connection.on("error", (err) => {
			console.error("MongoDB connection error:", err);
		});
	} catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;