
import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function StockOut() {
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
    const [availableStock, setAvailableStock] = useState(null);

    // GET SELECTED PRODUCT
    const selectedProduct = products.find(
        (product) =>
            String(product.id) === String(formData.product_id)
    );

    const currentStock = selectedProduct
        ? Number(selectedProduct.current_stock ?? selectedProduct.opening_stock ?? 0)
        : null;

    // LOAD PRODUCTS
    const loadProducts = async () => {
        try {
            const response = await axios.get(`${API_URL}/products`);
            setProducts(response.data.products || []);
        } catch (err) {
            console.error("Load products error:", err);
            setError("Failed to load products.");
        }
    };

    // LOAD STOCK OUT HISTORY
    const loadTransactions = async () => {
        try {
            const response = await axios.get(`${API_URL}/stock-out`);
            setTransactions(response.data.transactions || []);
        } catch (err) {
            console.error("Load stock out error:", err);
            setError("Failed to load stock out history.");
        }
    };

    // LOAD DATA
    useEffect(() => {
        loadProducts();
        loadTransactions();
    }, []);

    // HANDLE INPUTS
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
        setSuccess("");
        setAvailableStock(null);
    };

    // ADD STOCK OUT
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setAvailableStock(null);

        if (!formData.product_id || !formData.quantity) {
            setError("Please select a product and enter quantity.");
            return;
        }

        const quantity = Number(formData.quantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            setError("Quantity must be a positive whole number.");
            return;
        }

        try {
            setLoading(true);

            // Temporary user ID.
            // Later we will connect this to the logged-in user.
            const userId = 1;

            const response = await axios.post(
                `${API_URL}/stock-out`,
                {
                    product_id: Number(formData.product_id),
                    user_id: userId,
                    quantity,
                    reference: formData.reference,
                    notes: formData.notes
                }
            );

            const remaining = response.data.remainingStock;

            setSuccess(
                `${response.data.message} Remaining stock: ${remaining}`
            );

            setFormData({
                product_id: "",
                quantity: "",
                reference: "",
                notes: ""
            });

            await Promise.all([
                loadProducts(),
                loadTransactions()
            ]);

        } catch (err) {
            console.error("Stock Out Error:", err);

            const message =
                err.response?.data?.message ||
                "Failed to record stock out.";

            const available =
                err.response?.data?.availableStock;

            if (available !== undefined) {
                setAvailableStock(available);
                setError(message);
            } else {
                setError(message);
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="stock-page">

            <header className="topbar">
                <div>
                    <h1>Stock Out Management</h1>
                    <p>Record products issued from the canteen</p>
                </div>
            </header>

            {error && (
                <p className="error-message">{error}</p>
            )}

            {success && (
                <p className="success-message">{success}</p>
            )}

            {availableStock !== null && (
                <p className="error-message">
                    Available stock: {availableStock}
                </p>
            )}

            <section className="dashboard-section">

                <h2>Issue Products</h2>

                <form
                    onSubmit={handleSubmit}
                    className="stock-form"
                >

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

                    {selectedProduct && (
                        <div className="form-group">
                            <label>Current Stock</label>

                            <input
                                type="text"
                                value={`${currentStock} ${selectedProduct.unit || ""}`}
                                readOnly
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Quantity</label>

                        <input
                            type="number"
                            name="quantity"
                            min="1"
                            step="1"
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

                    <button
                        type="submit"
                        className="record-stock-out-btn"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "− Record Stock Out"}
                    </button>

                </form>

            </section>

            <section className="dashboard-section">

                <h2>Stock Out History</h2>

                <div style={{ overflowX: "auto" }}>
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
                                                ? new Date(
                                                    item.created_at
                                                ).toLocaleDateString()
                                                : "-"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">
                                        No stock out transactions found.
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

export default StockOut;
