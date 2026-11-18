
import { useState, useEffect } from "react";

import {
    getStockSummary,
    getStockInReport,
    getStockOutReport,
    getLowStockReport
} from "./api.js";

import "./Reports.css";

function Reports() {
    const [reportType, setReportType] = useState("summary");

    const [summary, setSummary] = useState([]);
    const [report, setReport] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // LOAD REPORT DATA
    const loadReport = async (type = reportType) => {
        setLoading(true);
        setError("");

        try {
            let response;

            switch (type) {
                case "summary":
                    response = await getStockSummary();
                    break;

                case "stockin":
                    response = await getStockInReport();
                    break;

                case "stockout":
                    response = await getStockOutReport();
                    break;

                case "lowstock":
                    response = await getLowStockReport();
                    break;

                default:
                    response = { report: [] };
            }

            const data = Array.isArray(response.report)
                ? response.report
                : [];

            setReport(data);

            if (type === "summary") {
                setSummary(data);
            }

        } catch (err) {
            console.error("Reports error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load report."
            );

            setReport([]);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport("summary");
    }, []);

    // CHANGE REPORT
    const changeReport = (type) => {
        setReportType(type);
        loadReport(type);
    };

    // STATISTICS
    const totalProducts = summary.length;

    const totalStock = summary.reduce(
        (total, item) =>
            total + Number(item.current_stock || 0),
        0
    );

    const lowStockCount = summary.filter(
        item =>
            Number(item.current_stock || 0) <=
            Number(item.reorder_level || 0)
    ).length;

    const totalStockIn = summary.reduce(
        (total, item) =>
            total + Number(item.total_stock_in || 0),
        0
    );

    const totalStockOut = summary.reduce(
        (total, item) =>
            total + Number(item.total_stock_out || 0),
        0
    );

    // PRINT
    const printReport = () => {
        window.print();
    };

    return (
        <div className="reports-page">

            <div className="reports-header">
                <div>
                    <h1>Reports</h1>
                    <p>
                        Monitor and analyze canteen stock activities.
                    </p>
                </div>

                <div className="reports-actions">
                    <button
                        className="refresh-btn"
                        onClick={() => loadReport(reportType)}
                        disabled={loading}
                    >
                        Refresh
                    </button>

                    <button
                        className="print-btn"
                        onClick={printReport}
                    >
                        Print Report
                    </button>
                </div>
            </div>

            {/* STATISTICS */}
            <div className="reports-stats">

                <div className="report-card blue">
                    <h3>Total Products</h3>
                    <h2>{totalProducts}</h2>
                </div>

                <div className="report-card green">
                    <h3>Current Stock</h3>
                    <h2>{totalStock}</h2>
                </div>

                <div className="report-card orange">
                    <h3>Stock In</h3>
                    <h2>{totalStockIn}</h2>
                </div>

                <div className="report-card red">
                    <h3>Stock Out</h3>
                    <h2>{totalStockOut}</h2>
                </div>

                <div className="report-card purple">
                    <h3>Low Stock</h3>
                    <h2>{lowStockCount}</h2>
                </div>

            </div>

            {/* REPORT BUTTONS */}
            <div className="reports-tabs">

                <button
                    className={reportType === "summary" ? "active" : ""}
                    onClick={() => changeReport("summary")}
                >
                    Stock Summary
                </button>

                <button
                    className={reportType === "stockin" ? "active" : ""}
                    onClick={() => changeReport("stockin")}
                >
                    Stock In
                </button>

                <button
                    className={reportType === "stockout" ? "active" : ""}
                    onClick={() => changeReport("stockout")}
                >
                    Stock Out
                </button>

                <button
                    className={reportType === "lowstock" ? "active" : ""}
                    onClick={() => changeReport("lowstock")}
                >
                    Low Stock
                </button>

            </div>

            {/* REPORT TABLE */}
            <div className="reports-table-container">

                <h2>
                    {reportType === "summary" && "Stock Summary Report"}
                    {reportType === "stockin" && "Stock In Report"}
                    {reportType === "stockout" && "Stock Out Report"}
                    {reportType === "lowstock" && "Low Stock Report"}
                </h2>

                {loading && (
                    <p className="report-message">
                        Loading report...
                    </p>
                )}

                {error && (
                    <p className="report-error">
                        {error}
                    </p>
                )}

                {!loading && !error && (
                    <div className="table-scroll">

                        <table className="reports-table">

                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>

                                    {reportType === "summary" ||
                                    reportType === "lowstock" ? (
                                        <>
                                            <th>Opening Stock</th>
                                            <th>Stock In</th>
                                            <th>Stock Out</th>
                                            <th>Current Stock</th>
                                            <th>Reorder Level</th>
                                            <th>Status</th>
                                        </>
                                    ) : (
                                        <>
                                            <th>Quantity</th>
                                            <th>Reference</th>
                                            <th>User</th>
                                            <th>Date</th>
                                        </>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {report.map((item, index) => {

                                    const currentStock =
                                        Number(item.current_stock || 0);

                                    const reorderLevel =
                                        Number(item.reorder_level || 0);

                                    const isLowStock =
                                        currentStock <= reorderLevel;

                                    return (
                                        <tr key={item.id || item.product_id || index}>

                                            <td>{item.product_name || "-"}</td>

                                            <td>{item.sku || "-"}</td>

                                            {reportType === "summary" ||
                                            reportType === "lowstock" ? (
                                                <>
                                                    <td>{item.opening_stock ?? 0}</td>
                                                    <td>{item.total_stock_in ?? 0}</td>
                                                    <td>{item.total_stock_out ?? 0}</td>
                                                    <td>{item.current_stock ?? 0}</td>
                                                    <td>{item.reorder_level ?? 0}</td>

                                                    <td>
                                                        <span className={
                                                            isLowStock
                                                                ? "status-low"
                                                                : "status-good"
                                                        }>
                                                            {isLowStock
                                                                ? "Low Stock"
                                                                : "Available"}
                                                        </span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{item.quantity ?? 0}</td>
                                                    <td>{item.reference || "-"}</td>
                                                    <td>{item.full_name || "-"}</td>
                                                    <td>
                                                        {item.created_at
                                                            ? new Date(item.created_at).toLocaleDateString()
                                                            : "-"}
                                                    </td>
                                                </>
                                            )}

                                        </tr>
                                    );
                                })}
                            </tbody>

                        </table>

                        {report.length === 0 && (
                            <p className="report-message">
                                No records found.
                            </p>
                        )}

                    </div>
                )}

            </div>

        </div>
    );
}

export default Reports;
