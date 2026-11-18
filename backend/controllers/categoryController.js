
import db from "../config/db.js";

// GET ALL CATEGORIES
export const getCategories = async (req, res) => {
    try {
        const [categories] = await db.query(
            "SELECT * FROM categories ORDER BY id DESC"
        );

        res.json({
            success: true,
            categories
        });

    } catch (error) {
        console.error("Get categories error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve categories."
        });
    }
};

// ADD CATEGORY
export const addCategory = async (req, res) => {
    try {
        const { category_name, description } = req.body;

        if (!category_name || !category_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required."
            });
        }

        const [result] = await db.query(
            `INSERT INTO categories (category_name, description)
             VALUES (?, ?)`,
            [category_name.trim(), description || null]
        );

        res.status(201).json({
            success: true,
            message: "Category added successfully!",
            categoryId: result.insertId
        });

    } catch (error) {
        console.error("Add category error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add category."
        });
    }
};

// UPDATE CATEGORY
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name, description } = req.body;

        if (!category_name || !category_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required."
            });
        }

        const [result] = await db.query(
            `UPDATE categories
             SET category_name = ?, description = ?
             WHERE id = ?`,
            [category_name.trim(), description || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        res.json({
            success: true,
            message: "Category updated successfully!"
        });

    } catch (error) {
        console.error("Update category error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update category."
        });
    }
};

// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM categories WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        res.json({
            success: true,
            message: "Category deleted successfully!"
        });

    } catch (error) {
        console.error("Delete category error:", error);

        res.status(500).json({
            success: false,
            message: "Cannot delete this category."
        });
    }
};
