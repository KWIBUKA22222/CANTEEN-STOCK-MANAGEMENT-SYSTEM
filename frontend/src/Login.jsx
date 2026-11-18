
import { useState } from "react";
import { loginUser } from "./api.js";

function Login({ onLogin, onShowRegister }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const handleLogin = (response) => {
    localStorage.setItem("canteenToken", response.token);
    localStorage.setItem(
        "canteenUser",
        JSON.stringify(response.user)
    );

    setCurrentUser(response.user);
};

const handleLogout = () => {
    localStorage.removeItem("canteenToken");
    localStorage.removeItem("canteenUser");

    setCurrentUser(null);
    setPage("dashboard");
    setAuthPage("login");
};
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);

            const response = await loginUser({
                email,
                password
            });

            onLogin(response);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>CANTEEN STOCK</h1>
                <h2>Login</h2>

                {error && <p className="error-message">{error}</p>}

                <label>Email Address</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                />

                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p>
                    Don't have an account?{" "}
                    <button
                        type="button"
                        className="text-button"
                        onClick={onShowRegister}
                    >
                        Register
                    </button>
                </p>
            </form>
        </div>
    );
}

export default Login;