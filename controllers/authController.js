import User from "../models/User.modal.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Generate unique device ID
const generateDeviceId = (req) => {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress;
    return crypto.createHash('md5').update(userAgent + ip).digest('hex');
};

// Register
export const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user",
            isUpgraded: false,
            maxDevices: 1
        });

        const deviceId = generateDeviceId(req);
        
        const token = jwt.sign(
            { 
                userId: user._id, 
                role: user.role,
                deviceId: deviceId
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Add first device
        await User.findByIdAndUpdate(user._id, {
            $push: {
                activeDevices: {
                    deviceId: deviceId,
                    token: token,
                    userAgent: req.headers['user-agent'],
                    ipAddress: req.ip
                }
            }
        });

        res.status(201).json({ 
            message: "User registered successfully", 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isUpgraded: user.isUpgraded,
                maxDevices: user.maxDevices
            }, 
            token 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Login
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const deviceId = generateDeviceId(req);
        const existingDevice = user.activeDevices.find(device => device.deviceId === deviceId);

        // Check if this is a new device
        if (!existingDevice) {
            // Check device limit
            const maxAllowedDevices = user.isUpgraded ? 2 : 1;
            
            if (user.activeDevices.length >= maxAllowedDevices) {
                return res.status(403).json({ 
                    message: `Device limit reached. Maximum ${maxAllowedDevices} device(s) allowed.`,
                    upgradeRequired: !user.isUpgraded
                });
            }
        }

        const token = jwt.sign(
            { 
                userId: user._id, 
                role: user.role,
                deviceId: deviceId
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        if (existingDevice) {
            // Update existing device token
            await User.updateOne(
                { _id: user._id, "activeDevices.deviceId": deviceId },
                { 
                    $set: { 
                        "activeDevices.$.token": token,
                        "activeDevices.$.loginAt": new Date()
                    } 
                }
            );
        } else {
            // Add new device
            await User.findByIdAndUpdate(user._id, {
                $push: {
                    activeDevices: {
                        deviceId: deviceId,
                        token: token,
                        userAgent: req.headers['user-agent'],
                        ipAddress: req.ip,
                        loginAt: new Date()
                    }
                }
            });
        }

        res.status(200).json({ 
            message: "User logged in successfully", 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isUpgraded: user.isUpgraded,
                maxDevices: user.maxDevices
            }, 
            token 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Logout from current device
export const logout = async (req, res) => {
    try {
        const deviceId = generateDeviceId(req);
        
        await User.findByIdAndUpdate(req.userId, {
            $pull: {
                activeDevices: { deviceId: deviceId }
            }
        });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Logout from all devices
export const logoutAll = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, {
            $set: { activeDevices: [] }
        });

        res.status(200).json({ message: "Logged out from all devices successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Upgrade user to premium
export const upgradeUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findByIdAndUpdate(
            userId, 
            { 
                isUpgraded: true, 
                maxDevices: 2 
            }, 
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ 
            message: "User upgraded successfully", 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isUpgraded: user.isUpgraded,
                maxDevices: user.maxDevices
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get active devices
export const getActiveDevices = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('activeDevices isUpgraded maxDevices');
        
        res.status(200).json({ 
            activeDevices: user.activeDevices,
            isUpgraded: user.isUpgraded,
            maxDevices: user.maxDevices
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Remove specific device
export const removeDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        await User.findByIdAndUpdate(req.userId, {
            $pull: {
                activeDevices: { deviceId: deviceId }
            }
        });

        res.status(200).json({ message: "Device removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};