import jwt from "jsonwebtoken";
import User from "../models/User.modal.js"; // Make sure this path is correct
import crypto from "crypto";

/**
 * Generate a unique device ID based on user-agent and IP
 * @param {Request} req
 * @returns string
 */
export const generateDeviceId = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || "";
  return crypto.createHash("md5").update(userAgent + ip).digest("hex");
};

/**
 * Authenticate JWT token and attach user info to request
 */
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if token matches any active device
    const deviceExists = user.activeDevices.some(
      (device) => device.token === token
    );
    if (!deviceExists) {
      return res
        .status(401)
        .json({ message: "Invalid or expired token for this device" });
    }

    req.userId = user._id;
    req.userRole = user.role;
    req.deviceId = decoded.deviceId;
    req.user = user; // Attach full user object for convenience

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    } else {
      return res.status(500).json({ message: "Server error during authentication" });
    }
  }
};

/**
 * Middleware to allow only admin users
 */
export const requireAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

/**
 * Middleware to allow only upgraded/premium users
 */
export const requireUpgrade = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isUpgraded) {
      return res
        .status(403)
        .json({ 
          message: "Upgrade required to access this feature",
          upgradeRequired: true
        });
    }

    next();
  } catch (error) {
    console.error("Upgrade check error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Clean up expired device sessions (optional helper function)
 */
export const cleanupExpiredSessions = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    const expiredThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    const validDevices = user.activeDevices.filter(device => {
      return new Date(device.lastActive) > expiredThreshold;
    });

    if (validDevices.length !== user.activeDevices.length) {
      await User.findByIdAndUpdate(userId, {
        activeDevices: validDevices
      });
    }
  } catch (error) {
    console.error("Session cleanup error:", error.message);
  }
};