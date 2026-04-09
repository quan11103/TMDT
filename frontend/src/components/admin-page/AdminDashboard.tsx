import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

interface OrderItem {
    total_amount: number;
    status: string;
}

interface ProductsItem {
    stock: number;
}

function normalizeOrders(raw: unknown): OrderItem[] {
    if (Array.isArray(raw)) return raw as OrderItem[];
    return [];
}

function normalizeProducts(raw: unknown): ProductsItem[] {
    if (raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown }).data)) {
        return (raw as { data: ProductsItem[] }).data;
    }
    if (Array.isArray(raw)) return raw as ProductsItem[];
    return [];
}

const AdminDashboard: React.FC = () => {
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const [orderCount, setOrderCount] = useState<number>(0);
    const [productCount, setProductCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const [responseOrder, responseProduct] = await Promise.all([
                    fetch('http://localhost:3000/api/order', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    // API trả { data, meta } — không phải mảng; cần limit đủ lớn để đếm hết hàng
                    fetch('http://localhost:3000/api/products?page=1&limit=5000', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                let orders: OrderItem[] = [];
                if (responseOrder.ok) {
                    orders = normalizeOrders(await responseOrder.json());
                } else {
                    console.error('Dashboard: không tải được đơn hàng');
                }

                let products: ProductsItem[] = [];
                if (responseProduct.ok) {
                    products = normalizeProducts(await responseProduct.json());
                } else {
                    console.error('Dashboard: không tải được sản phẩm');
                }

                const total = orders.reduce((acc, order) => {
                    return order.status !== 'CANCELLED' ? acc + Number(order.total_amount) : acc;
                }, 0);

                const newOrders = orders.filter((order) => order.status === 'PENDING').length;

                const outOfStockProduct = products.filter(
                    (product) => Number(product.stock) === 0,
                ).length;

                setTotalRevenue(total);
                setOrderCount(newOrders);
                setProductCount(outOfStockProduct);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu dashboard:', error);
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
            value: loading ? '...' : productCount.toString()
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