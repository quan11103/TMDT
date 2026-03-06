import React from 'react';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
    const stats = [
        { label: 'Tổng doanh thu', value: '125.000.000 ₫' },
        { label: 'Đơn hàng mới', value: '42' },
        { label: 'Sản phẩm hết hàng', value: '3' },
    ];

    return (
        <div className="dashboard-container">
            <div className="stat-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <span className="stat-label">{stat.label}</span>
                        <h3 className="stat-value">{stat.value}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;