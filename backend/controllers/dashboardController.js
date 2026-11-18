
import db from "../config/db.js";

// GET DASHBOARD STATISTICS
export const getDashboardStats = async (req, res) => {
    try {
        // Total products
        const [products] = await db.query(
            "SELECT COUNT(*) AS totalProducts FROM products"
        );

        // Total categories
        const [categories] = await db.query(
            "SELECT COUNT(*) AS totalCategories FROM categories"
        );

        // Total stock in
        const [stockIn] = await db.query(
            "SELECT COALESCE(SUM(quantity), 0) AS totalStockIn FROM stock_in"
        );

        // Total stock out
        const [stockOut] = await db.query(
            "SELECT COALESCE(SUM(quantity), 0) AS totalStockOut FROM stock_out"
        );

        // Available stock
        const [available] = await db.query(`
            SELECT COALESCE(
                SUM(
                    products.opening_stock +
                    COALESCE(stockin.total_in, 0) -
                    COALESCE(stockout.total_out, 0)
                ), 0
            ) AS availableStock
            FROM products
            LEFT JOIN (
                SELECT product_id, SUM(quantity) AS total_in
                FROM stock_in
                GROUP BY product_id
            ) AS stockin
                ON products.id = stockin.product_id
            LEFT JOIN (
                SELECT product_id, SUM(quantity) AS total_out
                FROM stock_out
                GROUP BY product_id
            ) AS stockout
                ON products.id = stockout.product_id
        `);

        // Low stock products
        const [lowStock] = await db.query(`
            SELECT
                products.id,
                products.product_name,
                products.reorder_level,
                (
                    products.opening_stock +
                    COALESCE(stockin.total_in, 0) -
                    COALESCE(stockout.total_out, 0)
                ) AS current_stock
            FROM products
            LEFT JOIN (
                SELECT product_id, SUM(quantity) AS total_in
                FROM stock_in
                GROUP BY product_id
            ) AS stockin
                ON products.id = stockin.product_id
            LEFT JOIN (
                SELECT product_id, SUM(quantity) AS total_out
                FROM stock_out
                GROUP BY product_id
            ) AS stockout
                ON products.id = stockout.product_id
            WHERE (
                products.opening_stock +
                COALESCE(stockin.total_in, 0) -
                COALESCE(stockout.total_out, 0)
            ) <= products.reorder_level
            ORDER BY current_stock ASC
        `);

        res.json({
            success: true,
            stats: {
                totalProducts: products[0].totalProducts,
                totalCategories: categories[0].totalCategories,
                totalStockIn: Number(stockIn[0].totalStockIn),
                totalStockOut: Number(stockOut[0].totalStockOut),
                availableStock: Number(available[0].availableStock),
                lowStockCount: lowStock.length
            },
            lowStockProducts: lowStock
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve dashboard statistics."
        });
    }
};

// GET RECENT TRANSACTIONS
export const getRecentTransactions = async (req, res) => {
    try {
        const [transactions] = await db.query(`
            SELECT * FROM (
                SELECT
                    stock_in.id,
                    products.product_name,
                    users.full_name,
                    stock_in.quantity,
                    'Stock In' AS transaction_type,
                    stock_in.reference,
                    stock_in.created_at
                FROM stock_in
                INNER JOIN products
                    ON stock_in.product_id = products.id
                INNER JOIN users
                    ON stock_in.user_id = users.id

                UNION ALL

                SELECT
                    stock_out.id,
                    products.product_name,
                    users.full_name,
                    stock_out.quantity,
                    'Stock Out' AS transaction_type,
                    stock_out.reference,
                    stock_out.created_at
                FROM stock_out
                INNER JOIN products
                    ON stock_out.product_id = products.id
                INNER JOIN users
                    ON stock_out.user_id = users.id
            ) AS recent
            ORDER BY created_at DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            transactions
        });

    } catch (error) {
        console.error("Recent transactions error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve recent transactions."
        });
    }
};
