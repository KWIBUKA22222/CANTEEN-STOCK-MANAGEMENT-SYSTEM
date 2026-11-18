
import { useState, useEffect } from "react";

import {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory
} from "./api.js";

function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        category_name: "",
        description: ""
    });

    // LOAD CATEGORIES
    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getCategories();

            setCategories(response.categories || []);

        } catch (err) {
            console.error("Categories Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load categories. Check your backend."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    // HANDLE INPUT
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // RESET FORM
    const resetForm = () => {
        setFormData({
            category_name: "",
            description: ""
        });

        setEditingId(null);
    };

    // ADD OR UPDATE CATEGORY
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const categoryData = {
            category_name: formData.category_name.trim(),
            description: formData.description.trim()
        };

        if (!categoryData.category_name) {
            setError("Category name is required.");
            return;
        }

        try {
            if (editingId) {
                await updateCategory(editingId, categoryData);
                setSuccess("Category updated successfully!");
            } else {
                await addCategory(categoryData);
                setSuccess("Category added successfully!");
            }

            resetForm();
            await loadCategories();

        } catch (err) {
            console.error("Save Category Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to save category."
            );
        }
    };

    // EDIT CATEGORY
    const handleEdit = (category) => {
        setEditingId(category.id);

        setFormData({
            category_name: category.category_name || "",
            description: category.description || ""
        });

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // DELETE CATEGORY
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this category?"
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await deleteCategory(id);

            setSuccess("Category deleted successfully!");
            await loadCategories();

        } catch (err) {
            console.error("Delete Category Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to delete category. Check whether products are using it."
            );
        }
    };

    if (loading) {
        return (
            <div className="loading">
                Loading Categories...
            </div>
        );
    }

    return (
        <div className="categories-page">

            {/* PAGE HEADER */}
            <header className="topbar">
                <div>
                    <h1>Categories Management</h1>
                    <p>Organize and manage canteen product categories</p>
                </div>

                <button onClick={loadCategories}>
                    Refresh
                </button>
            </header>

            {error && (
                <p className="error-message">
                    {error}
                </p>
            )}

            {success && (
                <p className="success-message">
                    {success}
                </p>
            )}

            {/* CATEGORY FORM */}
            <section className="dashboard-section">

                <h2>
                    {editingId ? "Edit Category" : "Add New Category"}
                </h2>

                <form
                    className="category-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">
                        <label>Category Name</label>

                        <input
                            type="text"
                            name="category_name"
                            value={formData.category_name}
                            onChange={handleChange}
                            placeholder="Enter category name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter category description"
                            rows="4"
                        />
                    </div>

                    <div className="form-buttons">

                        <button type="submit">
                            {editingId
                                ? "Update Category"
                                : "Add Category"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                </form>

            </section>

            {/* CATEGORIES TABLE */}
            <section className="dashboard-section">

                <h2>
                    All Categories ({categories.length})
                </h2>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Category Name</th>
                            <th>Description</th>
                            <th>Date Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {categories.length > 0 ? (

                            categories.map((category) => (
                                <tr key={category.id}>
                                    <td>{category.id}</td>

                                    <td>{category.category_name}</td>

                                    <td>
                                        {category.description || "-"}
                                    </td>

                                    <td>
                                        {category.created_at
                                            ? new Date(
                                                category.created_at
                                            ).toLocaleDateString()
                                            : "-"}
                                    </td>

                                    <td>
                                        <div className="action-buttons">

                                            <button
                                                type="button"
                                                className="edit-button"
                                                onClick={() => handleEdit(category)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="delete-button"
                                                onClick={() => handleDelete(category.id)}
                                            >
                                                Delete
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            ))

                        ) : (
                            <tr>
                                <td colSpan="5">
                                    No categories found. Add your first category.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

            </section>

        </div>
    );
}

export default Categories;