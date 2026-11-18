
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// ===============================
// AUTHENTICATION
// ===============================

export const registerUser = async (userData) => {
    const response = await axios.post(
        `${API_URL}/auth/register`,
        userData
    );
    return response.data;
};

export const loginUser = async (userData) => {
    const response = await axios.post(
        `${API_URL}/auth/login`,
        userData
    );
    return response.data;
};

// ===============================
// DASHBOARD
// ===============================

export const getDashboardStats = async () => {
    const response = await axios.get(
        `${API_URL}/dashboard/stats`
    );
    return response.data;
};

export const getRecentTransactions = async () => {
    const response = await axios.get(
        `${API_URL}/dashboard/recent-transactions`
    );
    return response.data;
};

// ===============================
// PRODUCTS
// ===============================

export const getProducts = async () => {
    const response = await axios.get(
        `${API_URL}/products`
    );
    return response.data;
};

export const addProduct = async (productData) => {
    const response = await axios.post(
        `${API_URL}/products`,
        productData
    );
    return response.data;
};

export const updateProduct = async (id, productData) => {
    const response = await axios.put(
        `${API_URL}/products/${id}`,
        productData
    );
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await axios.delete(
        `${API_URL}/products/${id}`
    );
    return response.data;
};

// ===============================
// CATEGORIES
// ===============================

export const getCategories = async () => {
    const response = await axios.get(
        `${API_URL}/categories`
    );
    return response.data;
};

export const addCategory = async (categoryData) => {
    const response = await axios.post(
        `${API_URL}/categories`,
        categoryData
    );
    return response.data;
};

export const updateCategory = async (id, categoryData) => {
    const response = await axios.put(
        `${API_URL}/categories/${id}`,
        categoryData
    );
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await axios.delete(
        `${API_URL}/categories/${id}`
    );
    return response.data;
};

// ===============================
// REPORTS
// ===============================

// STOCK SUMMARY REPORT
export const getStockSummary = async () => {
    const response = await axios.get(
        `${API_URL}/reports/summary`
    );
    return response.data;
};

// STOCK IN REPORT
export const getStockInReport = async () => {
    const response = await axios.get(
        `${API_URL}/reports/stock-in`
    );
    return response.data;
};

// STOCK OUT REPORT
export const getStockOutReport = async () => {
    const response = await axios.get(
        `${API_URL}/reports/stock-out`
    );
    return response.data;
};

// LOW STOCK REPORT
export const getLowStockReport = async () => {
    const response = await axios.get(
        `${API_URL}/reports/low-stock`
    );
    return response.data;
};
