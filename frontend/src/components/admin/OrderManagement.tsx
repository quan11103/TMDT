// OrderManagement.tsx
import React from 'react';

const orders = [
    { id: "#SKU1204", customer: "John Doe", items: 3, total: "$240", status: "Processing" },
    { id: "#SKU1205", customer: "Jane Smith", items: 1, total: "$130", status: "Shipped" },
    { id: "#SKU1206", customer: "Robert M.", items: 2, total: "$520", status: "Cancelled" },
];

const OrderManagement: React.FC = () => {
    return (
        <div className="admin-card">
            <h3>Order Management</h3>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o.id}>
                            <td className="bold">{o.id}</td>
                            <td>{o.customer}</td>
                            <td>{o.items} items</td>
                            <td className="bold">{o.total}</td>
                            <td><span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                            <td><button className="btn-view">View Detail</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderManagement;