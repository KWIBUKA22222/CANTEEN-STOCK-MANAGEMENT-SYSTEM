
import express from "express";

import {
    getStockOut,
    addStockOut
} from "../controllers/stockOutController.js";

const router = express.Router();

router.get("/", getStockOut);
router.post("/", addStockOut);

export default router;
