// OrderTable.tsx
import React from 'react';
import './OrderTable.css';

const OrderTable: React.FC = () => {
    const orders = [
        { id: '#9283', customer: 'Sarah M.', total: '$450', status: 'Pending' },
        { id: '#9284', customer: 'Alex K.', total: '$120', status: 'Completed' },
    ];

    return (
        <div className="table-section">
            <div className="table-header">
                <h3>Recent Orders</h3>
                <button className="btn-view-all">View All</button>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((o) => (
                        <tr key={o.id}>
                            <td className="bold">{o.id}</td>
                            <td>{o.customer}</td>
                            <td className="bold">{o.total}</td>
                            <td><span className={`badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderTable;