
import db from "../config/db.js";

// GET ALL STOCK OUT
export const getStockOut = async (req, res) => {
    try {
        const [transactions] = await db.query(`
            SELECT
                stock_out.*,
                products.product_name,
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
            transactions
        });

    } catch (error) {
        console.error("Get stock out error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve stock out records."
        });
    }
};


// ADD STOCK OUT
export const addStockOut = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const {
            product_id,
            user_id,
            quantity,
            reference,
            notes
        } = req.body;

        const productId = Number(product_id);
        const userId = Number(user_id);
        const stockQuantity = Number(quantity);

        if (
            !Number.isInteger(productId) || productId <= 0 ||
            !Number.isInteger(userId) || userId <= 0 ||
            !Number.isInteger(stockQuantity) || stockQuantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Select a valid product, user and positive quantity."
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        // LOCK PRODUCT
        const [products] = await connection.query(
            `SELECT id, opening_stock
             FROM products
             WHERE id = ?
             FOR UPDATE`,
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        // CHECK USER
        const [users] = await connection.query(
            "SELECT id FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // CALCULATE STOCK IN
        const [stockIn] = await connection.query(
            `SELECT COALESCE(SUM(quantity), 0) AS total
             FROM stock_in
             WHERE product_id = ?`,
            [productId]
        );

        // CALCULATE STOCK OUT
        const [stockOut] = await connection.query(
            `SELECT COALESCE(SUM(quantity), 0) AS total
             FROM stock_out
             WHERE product_id = ?`,
            [productId]
        );

        const currentStock =
            Number(products[0].opening_stock) +
            Number(stockIn[0].total) -
            Number(stockOut[0].total);

        // PREVENT NEGATIVE STOCK
        if (currentStock < 0 || stockQuantity > currentStock) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock!",
                availableStock: Math.max(0, currentStock)
            });
        }

        // INSERT STOCK OUT
        const [result] = await connection.query(
            `INSERT INTO stock_out
            (
                product_id,
                user_id,
                quantity,
                reference,
                notes
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                productId,
                userId,
                stockQuantity,
                reference || null,
                notes || null
            ]
        );

        await connection.commit();
        transactionStarted = false;

        res.status(201).json({
            success: true,
            message: "Stock out recorded successfully!",
            transactionId: result.insertId,
            previousStock: currentStock,
            quantityOut: stockQuantity,
            remainingStock: currentStock - stockQuantity
        });

    } catch (error) {
        console.error("Add stock out error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to record stock out."
        });

    } finally {
        if (connection) {
            if (transactionStarted) {
                try {
                    await connection.rollback();
                } catch (rollbackError) {
                    console.error("Rollback error:", rollbackError);
                }
            }

            connection.release();
        }
    }
};

export default { getStockOut, addStockOut };
