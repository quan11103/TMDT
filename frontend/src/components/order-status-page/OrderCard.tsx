import React from 'react';
import axios from 'axios';
import './OrderCard.css';

interface OrderCardProps {
    order: any;
    onReload: () => void;
    handleViewDetail: (order: any) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onReload, handleViewDetail }) => {

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDING': return { label: 'Chờ xác nhận', class: 'pending' };
            case 'CONFIRMED': return { label: 'Đã xác nhận', class: 'confirmed' };
            case 'SHIPPING': return { label: 'Đang giao hàng', class: 'shipping' };
            case 'DELIVERED': return { label: 'Đã giao', class: 'delivered' };
            case 'CANCELLED': return { label: 'Đã hủy', class: 'cancelled' };
            default: return { label: status, class: '' };
        }
    };

    const handleCancel = async () => {
        const confirmCancel = window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?");
        if (!confirmCancel) return;

        try {
            const token = localStorage.getItem("access_token");
            await axios.patch(`http://localhost:3000/api/order/my/${order.id}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Đã hủy đơn hàng thành công");
            onReload();
        } catch (err: any) {
            alert(err.response?.data?.message || "Lỗi khi hủy đơn");
        }
    };

    const statusInfo = getStatusInfo(order.status);

    // Tính tổng số lượng món hàng trong đơn
    const totalItems = order.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    return (
        <div className="order-card overview">
            {/* Header vẫn để trên cùng để giữ Mã đơn và Trạng thái */}
            <div className="order-card-header">
                <div className="order-main-info">
                    <span className="order-id">#{order.id}</span>
                    <span className="order-date">
                        {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </span>
                </div>
                <div className={`status-badge ${statusInfo.class}`}>
                    {statusInfo.label}
                </div>
            </div>

            {/* Phần nội dung chính được chia làm 2 cột bên dưới header */}
            <div className="order-card-main-layout">
                <div className="order-card-body overview-body">
                    <div className="summary-row">
                        <span className="summary-label">Sản phẩm:</span>
                        <span className="summary-value">
                            {order.order_items[0]?.products?.name}
                            {order.order_items.length > 1 && ` và ${order.order_items.length - 1} sản phẩm khác`}
                        </span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Số lượng:</span>
                        <span className="summary-value">{totalItems} món</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Tổng thanh toán:</span>
                        <span className="total-amount">{Number(order.total_amount).toLocaleString()}đ</span>
                    </div>
                </div>

                <div className="order-card-footer">
                    <div className="order-actions">
                        <button className="btn-secondary" onClick={() => handleViewDetail(order)}>Xem chi tiết</button>
                        {order.status === 'PENDING' && (
                            <button className="btn-outline-danger" onClick={handleCancel}>
                                Hủy đơn
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;