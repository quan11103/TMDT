import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

interface OrderItem {
    total_amount: number;
    status: string;
}

const AdminDashboard: React.FC = () => {
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const [orderCount, setOrderCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch('http://localhost:3000/api/order', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const orders: OrderItem[] = await response.json();

                    const total = orders.reduce((acc, order) => {
                        return order.status !== 'CANCELLED' ? acc + Number(order.total_amount) : acc;
                    }, 0);

                    // 2. Tính số lượng đơn hàng mới (Ví dụ: trạng thái PENDING)
                    const newOrders = orders.filter(order => order.status === 'PENDING').length;

                    setTotalRevenue(total);
                    setOrderCount(newOrders);
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount).replace('₫', '₫');
    };

    const stats = [
        {
            label: 'Tổng doanh thu',
            value: loading ? 'Đang tải...' : formatCurrency(totalRevenue)
        },
        {
            label: 'Đơn hàng mới',
            value: loading ? '...' : orderCount.toString()
        },
        {
            label: 'Sản phẩm hết hàng',
            value: '3' // Phần này có thể tích hợp API sản phẩm sau
        },
    ];

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Tổng quan hệ thống</h2>
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