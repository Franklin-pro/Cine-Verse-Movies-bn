// auth.routes.js
import express from "express";
import { 
    register, 
    login, 
    logout, 
    logoutAll, 
    upgradeUser, 
    getActiveDevices, 
    removeDevice 
} from "../controllers/authController.js";
import { authenticateToken, requireUpgrade } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.post("/logout-all", authenticateToken, logoutAll);
router.get("/devices", authenticateToken, getActiveDevices);
router.delete("/devices/:deviceId", authenticateToken, removeDevice);
router.patch("/upgrade/:userId", authenticateToken, requireUpgrade, upgradeUser);

export default router;