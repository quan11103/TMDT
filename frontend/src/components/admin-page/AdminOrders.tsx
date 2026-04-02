import React, { useState, useEffect } from 'react';
import type { Order } from '../../types';
import Swal from 'sweetalert2';
import './AdminOrders.css';

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:3000/api/order', {
                headers: { 'Authorization': `Bearer ${token}` }
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

    useEffect(() => {
        fetchOrders();
    }, []);

    // Hàm xử lý cập nhật trạng thái
    const handleUpdateStatus = async (orderId: number, newStatus: string) => {
        const result = await Swal.fire({
            title: 'Xác nhận đơn hàng?',
            text: `Bạn có chắc chắn muốn chuyển đơn hàng #${orderId} sang trạng thái ${newStatus}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#7b0f1a',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`http://localhost:3000/api/order/${orderId}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: newStatus })
                });

                if (response.ok) {
                    Swal.fire('Thành công!', 'Đã cập nhật trạng thái đơn hàng.', 'success');
                    fetchOrders(); // Tải lại danh sách
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Lỗi cập nhật');
                }
            } catch (error: any) {
                Swal.fire('Lỗi!', error.message, 'error');
            }
        }
    };

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

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
                            <th>Thanh toán</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => {
                            const statusInfo = getStatusConfig(o.status);
                            // Kiểm tra xem đơn hàng có phải là COD không
                            const isCOD = o.payments?.some(p => p.method === 'COD');

                            return (
                                <tr key={o.id}>
                                    <td className="order-id">#{o.id}</td>
                                    <td>
                                        <div className="font-medium">{o.users?.full_name}</div>
                                    </td>
                                    <td>
                                        <span className={`method-tag ${isCOD ? 'tag-cod' : 'tag-vnpay'}`}>
                                            {isCOD ? 'COD' : 'VNPAY'}
                                        </span>
                                    </td>
                                    <td className="font-bold price-cell">{formatPrice(o.total_amount)}</td>
                                    <td>
                                        <span className={`status-badge ${statusInfo.class}`}>
                                            {statusInfo.label}
                                        </span>
                                    </td>
                                    <td>
                                        {o.status === 'PENDING' && isCOD && (
                                            <button
                                                className="btn-action confirm"
                                                onClick={() => handleUpdateStatus(o.id, 'CONFIRMED')}
                                            >
                                                Xác nhận đơn
                                            </button>
                                        )}
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