import express from "express";
import { 
    getMovies,
    getMovieById,
    updateMovie,
    deleteMovie,
    searchMovies, 
    addMovie
} from "../controllers/movieController.js";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getMovies);
router.get("/search", searchMovies);
router.get("/:id", getMovieById);

// Admin only routes
router.post("/", authenticateToken, requireAdmin, addMovie);
router.put("/:id", authenticateToken, requireAdmin, updateMovie);
router.delete("/:id", authenticateToken, requireAdmin, deleteMovie);

export default router;