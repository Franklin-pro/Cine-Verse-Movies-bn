import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        required: true,
        default: "user",
        enum: ["user", "admin"]
    },
    isUpgraded: {
        type: Boolean,
        default: false
    },
    activeDevices: [{
        deviceId: String,
        token: String,
        loginAt: {
            type: Date,
            default: Date.now
        },
        userAgent: String,
        ipAddress: String,
        lastActive: {
            type: Date,
            default: Date.now
        }
    }],
    maxDevices: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// Add index for better performance
userSchema.index({ email: 1 });
userSchema.index({ "activeDevices.token": 1 });

const User = mongoose.model("User", userSchema);

export default User;