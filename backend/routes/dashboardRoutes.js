
import express from "express";

import {
    getDashboardStats,
    getRecentTransactions
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/recent-transactions", getRecentTransactions);

export default router;
