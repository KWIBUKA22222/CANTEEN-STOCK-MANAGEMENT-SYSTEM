
import { useState, useEffect, useCallback } from "react";

import {
    getDashboardStats,
    getRecentTransactions
} from "./api.js";

import Products from "./Products.jsx";
import Categories from "./Categories.jsx";
import StockIn from "./StockIn.jsx";
import StockOut from "./StockOut.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Reports from "./Reports.jsx";

import "./App.css";

// SAFE USER LOADING
function getSavedUser() {
    try {
        const savedUser = localStorage.getItem("canteenUser");
        return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
        localStorage.removeItem("canteenUser");
        return null;
    }
}

function App() {

    // STATES
    const [stats, setStats] = useState({});
    const [transactions, setTransactions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState("dashboard");
    const [authPage, setAuthPage] = useState("login");

    const [currentUser, setCurrentUser] = useState(getSavedUser);

    // LOGIN
    const handleLogin = (response) => {
        if (!response.success || !response.user || !response.token) {
            setError("Login response is incomplete.");
            return;
        }

        localStorage.setItem("canteenToken", response.token);

        localStorage.setItem(
            "canteenUser",
            JSON.stringify(response.user)
        );

        setCurrentUser(response.user);
        setPage("dashboard");
        setError("");
    };

    // LOGOUT
    const handleLogout = () => {
        localStorage.removeItem("canteenToken");
        localStorage.removeItem("canteenUser");

        setCurrentUser(null);
        setPage("dashboard");
        setAuthPage("login");

        setStats({});
        setTransactions([]);
    };

    // LOAD DASHBOARD
    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const statsResponse = await getDashboardStats();
            const transactionsResponse = await getRecentTransactions();

            setStats(statsResponse.stats || {});

            setTransactions(
                transactionsResponse.transactions || []
            );

        } catch (err) {
            console.error("Dashboard Error:", err);

            setError(
                "Failed to load dashboard. Check your backend server."
            );

        } finally {
            setLoading(false);
        }
    }, []);

    // LOAD DASHBOARD AFTER LOGIN
    useEffect(() => {
        if (currentUser) {
            loadDashboard();
        } else {
            setLoading(false);
        }
    }, [currentUser, loadDashboard]);

    // LOGIN / REGISTER
    if (!currentUser) {

        if (authPage === "register") {
            return (
                <Register
                    onShowLogin={() => setAuthPage("login")}
                />
            );
        }

        return (
            <Login
                onLogin={handleLogin}
                onShowRegister={() => setAuthPage("register")}
            />
        );
    }

    // LOADING
    if (loading) {
        return (
            <div className="loading">
                Loading Dashboard...
            </div>
        );
    }

    // DASHBOARD CARDS
    const cards = [
        {
            title: "Total Products",
            value: stats.totalProducts ?? 0,
            icon: "📦"
        },
        {
            title: "Total Categories",
            value: stats.totalCategories ?? 0,
            icon: "📂"
        },
        {
            title: "Total Stock In",
            value: stats.totalStockIn ?? 0,
            icon: "📥"
        },
        {
            title: "Total Stock Out",
            value: stats.totalStockOut ?? 0,
            icon: "📤"
        },
        {
            title: "Available Stock",
            value: stats.availableStock ?? 0,
            icon: "🏪"
        },
        {
            title: "Low Stock Alerts",
            value: stats.lowStockCount ?? 0,
            icon: "⚠️"
        }
    ];

    // MAIN APPLICATION
    return (
        <div className="dashboard">

            {/* SIDEBAR */}
            <aside className="sidebar">

                <h2>CANTEEN STOCK</h2>

                <nav>

                    <a
                        href="#dashboard"
                        className={page === "dashboard" ? "active" : ""}
                        onClick={() => setPage("dashboard")}
                    >
                        🏠 Dashboard
                    </a>

                    <a
                        href="#products"
                        className={page === "products" ? "active" : ""}
                        onClick={() => setPage("products")}
                    >
                        📦 Products
                    </a>

                    <a
                        href="#categories"
                        className={page === "categories" ? "active" : ""}
                        onClick={() => setPage("categories")}
                    >
                        📂 Categories
                    </a>

                    <a
                        href="#stock-in"
                        className={page === "stock-in" ? "active" : ""}
                        onClick={() => setPage("stock-in")}
                    >
                        📥 Stock In
                    </a>

                    <a
                        href="#stock-out"
                        className={page === "stock-out" ? "active" : ""}
                        onClick={() => setPage("stock-out")}
                    >
                        📤 Stock Out
                    </a>

                    <a
                        href="#reports"
                        className={page === "reports" ? "active" : ""}
                        onClick={() => setPage("reports")}
                    >
                        📊 Reports
                    </a>

                </nav>

            </aside>

            {/* MAIN CONTENT */}
            <main className="main-content">

                {/* TOPBAR */}
                <header className="topbar">

                    <div>
                        <h1>
                            {page === "dashboard"
                                ? "Dashboard"
                                : page === "stock-in"
                                ? "Stock In"
                                : page === "stock-out"
                                ? "Stock Out"
                                : page.charAt(0).toUpperCase() + page.slice(1)}
                        </h1>

                        <p>
                            Welcome, {currentUser.full_name}
                        </p>
                    </div>

                    <div className="topbar-actions">

                        {page === "dashboard" && (
                            <button onClick={loadDashboard}>
                                Refresh
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            className="logout-button"
                        >
                            Logout
                        </button>

                    </div>

                </header>

                {/* ERROR MESSAGE */}
                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                {/* DASHBOARD PAGE */}
                {page === "dashboard" && (
                    <>

                        <section className="stats-container">

                            {cards.map((card, index) => (
                                <div
                                    className="stat-card"
                                    key={index}
                                >

                                    <div className="stat-icon">
                                        {card.icon}
                                    </div>

                                    <div>
                                        <h3>{card.title}</h3>
                                        <h2>{card.value}</h2>
                                    </div>

                                </div>
                            ))}

                        </section>

                        {/* LOW STOCK ALERTS */}
                        <section className="dashboard-section">

                            <h2>Low Stock Alerts</h2>

                            <table>
                                <thead>
                                    <tr>
                                        <th>Product Name</th>
                                        <th>Available Stock</th>
                                        <th>Reorder Level</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {(stats.lowStockProducts || []).length > 0 ? (

                                        stats.lowStockProducts.map((product, index) => (
                                            <tr key={product.id || index}>
                                                <td>{product.product_name}</td>
                                                <td>{product.current_stock ?? 0}</td>
                                                <td>{product.reorder_level}</td>
                                            </tr>
                                        ))

                                    ) : (

                                        <tr>
                                            <td colSpan="3">
                                                No low stock products found.
                                            </td>
                                        </tr>

                                    )}

                                </tbody>
                            </table>

                        </section>

                        {/* RECENT TRANSACTIONS */}
                        <section className="dashboard-section">

                            <h2>Recent Transactions</h2>

                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Type</th>
                                        <th>Quantity</th>
                                        <th>User</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {transactions.length > 0 ? (

                                        transactions.map((transaction, index) => (
                                            <tr key={transaction.id || index}>
                                                <td>{transaction.product_name}</td>
                                                <td>{transaction.transaction_type}</td>
                                                <td>{transaction.quantity}</td>
                                                <td>{transaction.full_name}</td>
                                                <td>
                                                    {transaction.created_at
                                                        ? new Date(
                                                            transaction.created_at
                                                        ).toLocaleDateString()
                                                        : "-"}
                                                </td>
                                            </tr>
                                        ))

                                    ) : (

                                        <tr>
                                            <td colSpan="5">
                                                No transactions available.
                                            </td>
                                        </tr>

                                    )}

                                </tbody>
                            </table>

                        </section>

                    </>
                )}

                {/* PRODUCTS PAGE */}
                {page === "products" && (
                    <Products />
                )}

                {/* CATEGORIES PAGE */}
                {page === "categories" && (
                    <Categories />
                )}

                {/* STOCK IN PAGE */}
                {page === "stock-in" && (
                    <StockIn />
                )}

                {/* STOCK OUT PAGE */}
                {page === "stock-out" && (
                    <StockOut />
                )}

                {/* REPORTS PAGE */}
                {page === "reports" && (
                    <Reports />
                )}

            </main>

        </div>
    );
}

export default App;
