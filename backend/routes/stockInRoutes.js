
import express from "express";

import {
    getStockIn,
    addStockIn
} from "../controllers/stockInController.js";

const router = express.Router();

router.get("/", getStockIn);
router.post("/", addStockIn);

export default router;
