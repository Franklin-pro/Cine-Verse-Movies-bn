import express from "express";
import { 
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    upgradeUser,
    downgradeUser
} from "../controllers/adminController.js";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/users", authenticateToken, requireAdmin, getAllUsers);
router.get("/users/:id", authenticateToken, requireAdmin, getUserById);
router.put("/users/:id", authenticateToken, requireAdmin, updateUser);
router.delete("/users/:id", authenticateToken, requireAdmin, deleteUser);
router.patch("/users/:id/upgrade", authenticateToken, requireAdmin, upgradeUser);
router.patch("/users/:id/downgrade", authenticateToken, requireAdmin, downgradeUser);

export default router;