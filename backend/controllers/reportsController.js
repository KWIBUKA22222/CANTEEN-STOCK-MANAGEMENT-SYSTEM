
import db from "../config/db.js";

// =====================================
// 1. STOCK SUMMARY REPORT
// =====================================

export const getStockSummary = async (req, res) => {
    try {
        const [report] = await db.query(`
            SELECT
                p.id AS product_id,
                p.product_name,
                p.sku,
                c.category_name,
                p.opening_stock,
                p.unit,
                p.unit_price,
                p.reorder_level,

                COALESCE((
                    SELECT SUM(si.quantity)
                    FROM stock_in si
                    WHERE si.product_id = p.id
                ), 0) AS total_stock_in,

                COALESCE((
                    SELECT SUM(so.quantity)
                    FROM stock_out so
                    WHERE so.product_id = p.id
                ), 0) AS total_stock_out,

                (
                    p.opening_stock
                    + COALESCE((
                        SELECT SUM(si.quantity)
                        FROM stock_in si
                        WHERE si.product_id = p.id
                    ), 0)
                    - COALESCE((
                        SELECT SUM(so.quantity)
                        FROM stock_out so
                        WHERE so.product_id = p.id
                    ), 0)
                ) AS current_stock

            FROM products p

            LEFT JOIN categories c
                ON p.category_id = c.id

            ORDER BY p.product_name ASC
        `);

        res.json({
            success: true,
            report
        });

    } catch (error) {
        console.error("Stock summary error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate stock summary."
        });
    }
};


// =====================================
// 2. STOCK IN REPORT
// =====================================

export const getStockInReport = async (req, res) => {
    try {
        const [report] = await db.query(`
            SELECT
                stock_in.*,
                products.product_name,
                products.sku,
                products.unit,
                users.full_name

            FROM stock_in

            INNER JOIN products
                ON stock_in.product_id = products.id

            INNER JOIN users
                ON stock_in.user_id = users.id

            ORDER BY stock_in.id DESC
        `);

        res.json({
            success: true,
            report
        });

    } catch (error) {
        console.error("Stock in report error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate stock in report."
        });
    }
};


// =====================================
// 3. STOCK OUT REPORT
// =====================================

export const getStockOutReport = async (req, res) => {
    try {
        const [report] = await db.query(`
            SELECT
                stock_out.*,
                products.product_name,
                products.sku,
                products.unit,
                users.full_name

            FROM stock_out

            INNER JOIN products
                ON stock_out.product_id = products.id

            INNER JOIN users
                ON stock_out.user_id = users.id

            ORDER BY stock_out.id DESC
        `);

        res.json({
            success: true,
            report
        });

    } catch (error) {
        console.error("Stock out report error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate stock out report."
        });
    }
};


// =====================================
// 4. LOW STOCK REPORT
// =====================================

export const getLowStockReport = async (req, res) => {
    try {
        const [report] = await db.query(`
            SELECT
                p.id AS product_id,
                p.product_name,
                p.sku,
                c.category_name,
                p.unit,
                p.opening_stock,
                p.reorder_level,

                COALESCE((
                    SELECT SUM(si.quantity)
                    FROM stock_in si
                    WHERE si.product_id = p.id
                ), 0) AS total_stock_in,

                COALESCE((
                    SELECT SUM(so.quantity)
                    FROM stock_out so
                    WHERE so.product_id = p.id
                ), 0) AS total_stock_out,

                (
                    p.opening_stock
                    + COALESCE((
                        SELECT SUM(si.quantity)
                        FROM stock_in si
                        WHERE si.product_id = p.id
                    ), 0)
                    - COALESCE((
                        SELECT SUM(so.quantity)
                        FROM stock_out so
                        WHERE so.product_id = p.id
                    ), 0)
                ) AS current_stock

            FROM products p

            LEFT JOIN categories c
                ON p.category_id = c.id

            HAVING current_stock <= p.reorder_level

            ORDER BY current_stock ASC
        `);

        res.json({
            success: true,
            report
        });

    } catch (error) {
        console.error("Low stock report error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate low stock report."
        });
    }
};


// =====================================
// EXPORT CONTROLLERS
// =====================================

export default {
    getStockSummary,
    getStockInReport,
    getStockOutReport,
    getLowStockReport
};
