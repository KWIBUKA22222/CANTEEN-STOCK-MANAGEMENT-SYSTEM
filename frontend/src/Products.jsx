
import { useState, useEffect } from "react";

import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getCategories
} from "./api.js";

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        product_name: "",
        sku: "",
        category_id: "",
        opening_stock: 0,
        unit: "Pieces",
        unit_price: 0,
        reorder_level: 5
    });

    // LOAD PRODUCTS AND CATEGORIES
    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const productsResponse = await getProducts();
            const categoriesResponse = await getCategories();

            setProducts(productsResponse.products || []);
            setCategories(categoriesResponse.categories || []);

        } catch (err) {
            console.error("Products Error:", err);
            setError("Failed to load products. Check your backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // HANDLE INPUT CHANGES
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    // RESET FORM
    const resetForm = () => {
        setFormData({
            product_name: "",
            sku: "",
            category_id: "",
            opening_stock: 0,
            unit: "Pieces",
            unit_price: 0,
            reorder_level: 5
        });

        setEditingId(null);
    };

    // ADD OR UPDATE PRODUCT
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError("");
            setSuccess("");

            const productData = {
                product_name: formData.product_name.trim(),
                sku: formData.sku.trim() || null,
                category_id: formData.category_id
                    ? Number(formData.category_id)
                    : null,
                opening_stock: Number(formData.opening_stock),
                unit: formData.unit,
                unit_price: Number(formData.unit_price),
                reorder_level: Number(formData.reorder_level)
            };

            if (
                !productData.product_name ||
                !Number.isFinite(productData.opening_stock) ||
                !Number.isFinite(productData.unit_price) ||
                !Number.isFinite(productData.reorder_level) ||
                productData.opening_stock < 0 ||
                productData.unit_price < 0 ||
                productData.reorder_level < 0
            ) {
                setError("Please enter valid product information.");
                return;
            }

            if (editingId) {
                await updateProduct(editingId, productData);
                setSuccess("Product updated successfully!");
            } else {
                await addProduct(productData);
                setSuccess("Product added successfully!");
            }

            resetForm();
            await loadData();

        } catch (err) {
            console.error("Save Product Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to save product. Please check your information."
            );
        }
    };

    // EDIT PRODUCT
    const handleEdit = (product) => {
        setEditingId(product.id);

        setFormData({
            product_name: product.product_name || "",
            sku: product.sku || "",
            category_id: product.category_id || "",
            opening_stock: product.opening_stock ?? 0,
            unit: product.unit || "Pieces",
            unit_price: product.unit_price ?? 0,
            reorder_level: product.reorder_level ?? 5
        });

        setSuccess("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // DELETE PRODUCT
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await deleteProduct(id);

            setSuccess("Product deleted successfully!");
            await loadData();

        } catch (err) {
            console.error("Delete Product Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to delete product."
            );
        }
    };

    // FORMAT NUMBERS
    const formatNumber = (value) => {
        return Number(value || 0).toLocaleString();
    };

    if (loading) {
        return (
            <div className="loading">
                Loading Products...
            </div>
        );
    }

    return (
        <div className="products-page">

            <header className="topbar">
                <div>
                    <h1>Products Management</h1>
                    <p>Add, view, update and delete products</p>
                </div>

                <button onClick={loadData}>
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

            {/* PRODUCT FORM */}
            <section className="dashboard-section">

                <h2>
                    {editingId ? "Edit Product" : "Add New Product"}
                </h2>

                <form onSubmit={handleSubmit} className="product-form">

                    <div className="form-group">
                        <label>Product Name</label>

                        <input
                            type="text"
                            name="product_name"
                            value={formData.product_name}
                            onChange={handleChange}
                            placeholder="Enter product name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>SKU</label>

                        <input
                            type="text"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            placeholder="Enter product SKU"
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>

                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                        >
                            <option value="">Select Category</option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Opening Stock</label>

                        <input
                            type="number"
                            name="opening_stock"
                            min="0"
                            value={formData.opening_stock}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Unit</label>

                        <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                        >
                            <option value="Pieces">Pieces</option>
                            <option value="Packets">Packets</option>
                            <option value="Boxes">Boxes</option>
                            <option value="Bottles">Bottles</option>
                            <option value="Kilograms">Kilograms</option>
                            <option value="Litres">Litres</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Unit Price</label>

                        <input
                            type="number"
                            name="unit_price"
                            min="0"
                            step="0.01"
                            value={formData.unit_price}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Reorder Level</label>

                        <input
                            type="number"
                            name="reorder_level"
                            min="0"
                            value={formData.reorder_level}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-buttons">

                        <button type="submit">
                            {editingId ? "Update Product" : "Add Product"}
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

            {/* PRODUCTS TABLE */}
            <section className="dashboard-section">

                <h2>All Products ({products.length})</h2>

                <div style={{ overflowX: "auto" }}>

                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Product Name</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Opening Stock</th>
                                <th>Stock In</th>
                                <th>Stock Out</th>
                                <th>Current Stock</th>
                                <th>Unit</th>
                                <th>Unit Price</th>
                                <th>Reorder Level</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {products.length > 0 ? (

                                products.map((product) => {

                                    const openingStock =
                                        Number(product.opening_stock || 0);

                                    const totalStockIn =
                                        Number(product.total_stock_in || 0);

                                    const totalStockOut =
                                        Number(product.total_stock_out || 0);

                                    const currentStock =
                                        product.current_stock !== undefined
                                            ? Number(product.current_stock)
                                            : openingStock +
                                              totalStockIn -
                                              totalStockOut;

                                    const reorderLevel =
                                        Number(product.reorder_level || 0);

                                    const isLowStock =
                                        currentStock <= reorderLevel;

                                    return (
                                        <tr key={product.id}>

                                            <td>{product.id}</td>

                                            <td>
                                                {product.product_name}
                                            </td>

                                            <td>
                                                {product.sku || "-"}
                                            </td>

                                            <td>
                                                {product.category_name || "No Category"}
                                            </td>

                                            <td>
                                                {formatNumber(openingStock)}
                                            </td>

                                            <td>
                                                {formatNumber(totalStockIn)}
                                            </td>

                                            <td>
                                                {formatNumber(totalStockOut)}
                                            </td>

                                            <td>
                                                <strong>
                                                    {formatNumber(currentStock)}
                                                </strong>
                                            </td>

                                            <td>{product.unit}</td>

                                            <td>
                                                {formatNumber(product.unit_price)}
                                            </td>

                                            <td>
                                                {formatNumber(reorderLevel)}
                                            </td>

                                            <td>
                                                {isLowStock ? (
                                                    <span
                                                        style={{
                                                            color: "#dc2626",
                                                            fontWeight: "bold"
                                                        }}
                                                    >
                                                        Low Stock
                                                    </span>
                                                ) : (
                                                    <span
                                                        style={{
                                                            color: "#16a34a",
                                                            fontWeight: "bold"
                                                        }}
                                                    >
                                                        In Stock
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                <div className="action-buttons">

                                                    <button
                                                        className="edit-button"
                                                        onClick={() => handleEdit(product)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="delete-button"
                                                        onClick={() => handleDelete(product.id)}
                                                    >
                                                        Delete
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })

                            ) : (
                                <tr>
                                    <td colSpan="13">
                                        No products found. Add your first product.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                </div>

            </section>

        </div>
    );
}

export default Products;