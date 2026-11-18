
import express from "express";

import {
    getStockSummary,
    getStockInReport,
    getStockOutReport,
    getLowStockReport
} from "../controllers/reportsController.js";

const router = express.Router();

router.get("/summary", getStockSummary);

router.get("/stock-in", getStockInReport);

router.get("/stock-out", getStockOutReport);

router.get("/low-stock", getLowStockReport);

export default router;
