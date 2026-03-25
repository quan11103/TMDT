import React, { useState, useEffect } from 'react';
import type { Order } from '../../types';``
import './AdminOrders.css';

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // 2. Gọi API từ Backend
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('access_token');
                // Lưu ý: Endpoint này phải khớp với Controller gọi AdminService.getAllOrders()
                const response = await fetch('http://localhost:3000/api/order', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // 3. Helper: Định dạng tiền tệ
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    // 4. Helper: Map trạng thái và class CSS
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'PENDING': return { label: 'Chờ xử lý', class: 'waiting' };
            case 'CONFIRMED': return { label: 'Đã xác nhận', class: 'confirmed' };
            case 'SHIPPING': return { label: 'Đang giao', class: 'shipping' };
            case 'DELIVERED': return { label: 'Hoàn thành', class: 'success' };
            case 'CANCELLED': return { label: 'Đã hủy', class: 'danger' };
            default: return { label: status, class: '' };
        }
    };

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2 className="section-title mb-24">Quản lý đơn hàng (Admin)</h2>
                <div className="order-count">Tổng số: {orders.length} đơn hàng</div>
            </div>

            {loading ? (
                <div className="loading-state">Đang tải dữ liệu đơn hàng...</div>
            ) : (
                <table className="muji-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Ngày đặt</th>
                            <th>Sản phẩm</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => {
                            const statusInfo = getStatusConfig(o.status);
                            return (
                                <tr key={o.id}>
                                    <td className="order-id">#{o.id}</td>
                                    <td className="font-medium">
                                        {o.users?.full_name || 'Khách vãng lai'}
                                    </td>
                                    <td>{new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <span className="item-count">
                                            {o.order_items.length} món
                                        </span>
                                    </td>
                                    <td className="font-bold price-cell">{formatPrice(o.total_amount)}</td>
                                    <td>
                                        <span className={`status-badge ${statusInfo.class}`}>
                                            {statusInfo.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminOrders;