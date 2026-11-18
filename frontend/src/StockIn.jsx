
import { useState, useEffect } from "react";
import axios from "axios";

import "./App.css";

const API_URL = "http://localhost:5000/api";

function StockIn() {
    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const [formData, setFormData] = useState({
        product_id: "",
        quantity: "",
        reference: "",
        notes: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // LOAD PRODUCTS
    const loadProducts = async () => {
        try {
            const response = await axios.get(`${API_URL}/products`);
            setProducts(response.data.products || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load products.");
        }
    };

    // LOAD STOCK IN TRANSACTIONS
    const loadTransactions = async () => {
        try {
            const response = await axios.get(`${API_URL}/stock-in`);
            setTransactions(response.data.transactions || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load stock in transactions.");
        }
    };

    useEffect(() => {
        loadProducts();
        loadTransactions();
    }, []);

    // HANDLE INPUTS
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    // ADD STOCK IN
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.product_id || !formData.quantity) {
            setError("Please select a product and enter quantity.");
            return;
        }

        if (Number(formData.quantity) <= 0) {
            setError("Quantity must be greater than zero.");
            return;
        }

        try {
            setLoading(true);

            // Replace 1 with the actual logged-in user's ID
            const userId = 1;

            await axios.post(`${API_URL}/stock-in`, {
                ...formData,
                user_id: userId,
                quantity: Number(formData.quantity)
            });

            setSuccess("Stock added successfully!");

            setFormData({
                product_id: "",
                quantity: "",
                reference: "",
                notes: ""
            });

            await loadTransactions();

        } catch (err) {
            console.error("Stock In Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to add stock."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="stock-page">

            <header className="topbar">
                <div>
                    <h1>Stock In Management</h1>
                    <p>Record new stock received by the canteen</p>
                </div>
            </header>

            {error && (
                <p className="error-message">{error}</p>
            )}

            {success && (
                <p className="success-message">{success}</p>
            )}

            {/* STOCK IN FORM */}
            <section className="dashboard-section">

                <h2>Receive New Stock</h2>

                <form onSubmit={handleSubmit} className="stock-form">

                    <div className="form-group">
                        <label>Product</label>

                        <select
                            name="product_id"
                            value={formData.product_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Product</option>

                            {products.map((product) => (
                                <option
                                    key={product.id}
                                    value={product.id}
                                >
                                    {product.product_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Quantity</label>

                        <input
                            type="number"
                            name="quantity"
                            min="1"
                            value={formData.quantity}
                            onChange={handleChange}
                            placeholder="Enter quantity"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Reference</label>

                        <input
                            type="text"
                            name="reference"
                            value={formData.reference}
                            onChange={handleChange}
                            placeholder="Enter reference"
                        />
                    </div>

                    <div className="form-group">
                        <label>Notes</label>

                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Additional information"
                        />
                    </div>

                    {/* ADD STOCK BUTTON */}
                    <button
                        type="submit"
                        className="add-stock-btn"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "+ Add Stock"}
                    </button>

                </form>

            </section>

            {/* STOCK IN HISTORY */}
            <section className="dashboard-section">

                <h2>Stock In History</h2>

                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Reference</th>
                            <th>User</th>
                            <th>Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {transactions.length > 0 ? (
                            transactions.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.product_name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.reference || "-"}</td>
                                    <td>{item.full_name || "-"}</td>
                                    <td>
                                        {item.created_at
                                            ? new Date(item.created_at).toLocaleDateString()
                                            : "-"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">
                                    No stock in transactions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

            </section>

        </div>
    );
}

export default StockIn;


/* =====================================
   ADD STOCK BUTTON CSS
===================================== */

<style>
</style>
