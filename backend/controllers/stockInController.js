
import db from "../config/db.js";

// GET ALL STOCK IN
export const getStockIn = async (req, res) => {
    try {
        const [transactions] = await db.query(`
            SELECT
                stock_in.*,
                products.product_name,
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
            transactions
        });

    } catch (error) {
        console.error("Get stock in error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve stock in records."
        });
    }
};


// ADD STOCK IN
export const addStockIn = async (req, res) => {
    let connection;

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
            !Number.isInteger(productId) ||
            productId <= 0 ||
            !Number.isInteger(userId) ||
            userId <= 0 ||
            !Number.isInteger(stockQuantity) ||
            stockQuantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid product, user and positive quantity are required."
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        // CHECK PRODUCT
        const [products] = await connection.query(
            "SELECT id FROM products WHERE id = ? FOR UPDATE",
            [productId]
        );

        if (products.length === 0) {
            await connection.rollback();

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
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // INSERT STOCK IN
        const [result] = await connection.query(
            `INSERT INTO stock_in
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

        res.status(201).json({
            success: true,
            message: "Stock in recorded successfully!",
            transactionId: result.insertId
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error("Add stock in error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to record stock in."
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
};
