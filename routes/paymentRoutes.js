import express from "express";
import { payWithMoMo, payWithStripe } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/momo", payWithMoMo);
router.post("/stripe", payWithStripe);

export default router;
