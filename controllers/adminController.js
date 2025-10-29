import User from "../models/User.modal.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const upgradeUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isUpgraded: true }, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User upgraded successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const downgradeUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isUpgraded: false }, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User downgraded successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
