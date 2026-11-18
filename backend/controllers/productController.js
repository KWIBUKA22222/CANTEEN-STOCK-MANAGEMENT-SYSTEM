
import db from "../config/db.js";

// GET ALL PRODUCTS WITH CURRENT STOCK
export const getProducts = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT
                p.*,
                c.category_name,

                COALESCE(si.total_stock_in, 0) AS total_stock_in,

                COALESCE(so.total_stock_out, 0) AS total_stock_out,

                (
                    p.opening_stock
                    + COALESCE(si.total_stock_in, 0)
                    - COALESCE(so.total_stock_out, 0)
                ) AS current_stock

            FROM products p

            LEFT JOIN categories c
                ON p.category_id = c.id

            LEFT JOIN (
                SELECT
                    product_id,
                    SUM(quantity) AS total_stock_in
                FROM stock_in
                GROUP BY product_id
            ) si
                ON p.id = si.product_id

            LEFT JOIN (
                SELECT
                    product_id,
                    SUM(quantity) AS total_stock_out
                FROM stock_out
                GROUP BY product_id
            ) so
                ON p.id = so.product_id

            ORDER BY p.id DESC
        `);

        res.json({
            success: true,
            products
        });

    } catch (error) {
        console.error("Get products error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve products."
        });
    }
};


// ADD PRODUCT
export const addProduct = async (req, res) => {
    try {
        const {
            product_name,
            sku,
            category_id,
            opening_stock,
            unit,
            unit_price,
            reorder_level
        } = req.body;

        const openingStock = Number(opening_stock ?? 0);
        const price = Number(unit_price ?? 0);
        const reorderLevel = Number(reorder_level ?? 5);

        if (!product_name || !product_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product name is required."
            });
        }

        if (
            !Number.isFinite(openingStock) ||
            !Number.isFinite(price) ||
            !Number.isFinite(reorderLevel) ||
            openingStock < 0 ||
            price < 0 ||
            reorderLevel < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter valid product values."
            });
        }

        const [result] = await db.query(
            `INSERT INTO products
            (
                product_name,
                sku,
                category_id,
                opening_stock,
                unit,
                unit_price,
                reorder_level
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                product_name.trim(),
                sku || null,
                category_id || null,
                openingStock,
                unit || "Pieces",
                price,
                reorderLevel
            ]
        );

        res.status(201).json({
            success: true,
            message: "Product added successfully!",
            productId: result.insertId
        });

    } catch (error) {
        console.error("Add product error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add product."
        });
    }
};


// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            product_name,
            sku,
            category_id,
            opening_stock,
            unit,
            unit_price,
            reorder_level
        } = req.body;

        const openingStock = Number(opening_stock ?? 0);
        const price = Number(unit_price ?? 0);
        const reorderLevel = Number(reorder_level ?? 5);

        if (!product_name || !product_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product name is required."
            });
        }

        if (
            !Number.isFinite(openingStock) ||
            !Number.isFinite(price) ||
            !Number.isFinite(reorderLevel) ||
            openingStock < 0 ||
            price < 0 ||
            reorderLevel < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter valid product values."
            });
        }

        const [result] = await db.query(
            `UPDATE products SET
                product_name = ?,
                sku = ?,
                category_id = ?,
                opening_stock = ?,
                unit = ?,
                unit_price = ?,
                reorder_level = ?
             WHERE id = ?`,
            [
                product_name.trim(),
                sku || null,
                category_id || null,
                openingStock,
                unit || "Pieces",
                price,
                reorderLevel,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        res.json({
            success: true,
            message: "Product updated successfully!"
        });

    } catch (error) {
        console.error("Update product error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update product."
        });
    }
};


// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM products WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        res.json({
            success: true,
            message: "Product deleted successfully!"
        });

    } catch (error) {
        console.error("Delete product error:", error);

        res.status(500).json({
            success: false,
            message: "Cannot delete this product. It may be used in stock transactions."
        });
    }
};
