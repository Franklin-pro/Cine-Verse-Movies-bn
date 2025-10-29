import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import movieRoutes from "./routes/movieRoute.js";
import reviewRoutes from "./routes/reviewRoute.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoute.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
connectDB();

// Routes
app.use("/api/payments", paymentRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
