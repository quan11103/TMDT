import React, { useMemo } from 'react';
import './OrderDetailModal.css';
import { mediaUrl } from '../../lib/mediaUrl';

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
    const userName = useMemo(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                return parsedUser.full_name || parsedUser.username || 'Khách hàng';
            } catch (e) {
                return 'Khách hàng';
            }
        }
        return 'Khách hàng';
    }, []);

    if (!isOpen || !order) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Chi tiết đơn hàng #{order.id}</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body modal-two-columns">
                    {/* CỘT 1: Chứa Phần 1 và Phần 3 */}
                    <div className="modal-column left-column">
                        {/* Phần 1: Thông tin đơn hàng */}
                        <section className="detail-section">
                            <h4 className="section-title">Thông tin đơn hàng</h4>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Người nhận: </span>
                                    <span className="info-value">{userName}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Số điện thoại: </span>
                                    <span className="info-value">{order.phone}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Địa chỉ: </span>
                                    <span className="info-value">{order.address}</span>
                                </div>
                                {order.note && (
                                    <div className="info-item">
                                        <span className="info-label">Ghi chú:</span>
                                        <span className="info-value">{order.note}</span>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Phần 3: Thanh toán & Tổng kết */}
                        <section className="detail-section payment-summary-box">
                            <h4 className="section-title">Thanh toán</h4>
                            <div className="payment-info-compact">
                                {/* Sử dụng cấu trúc tương tự info-item để đồng bộ CSS */}
                                <div className="info-item">
                                    <span className="info-label">Phương thức:</span>
                                    <span className="info-value">{order.payments?.[0]?.method || 'COD'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Trạng thái:</span>
                                    <span className="info-value">
                                        <span className="payment-status-tag">{order.payments?.[0]?.status || 'Chưa thanh toán'}</span>
                                    </span>
                                </div>
                            </div>
                            <div className="price-breakdown-compact">
                                <div className="price-row">
                                    <span>Tạm tính: </span>
                                    <span>{Number(order.total_amount).toLocaleString()}đ</span>
                                </div>
                                <div className="price-row total-row">
                                    <span>Tổng cộng: </span>
                                    <span className="final-price">{Number(order.total_amount).toLocaleString()}đ</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* CỘT 2: Chứa Phần 2 */}
                    <div className="modal-column right-column">
                        {/* Phần 2: Danh sách sản phẩm */}
                        <section className="detail-section">
                            <h4 className="section-title">Sản phẩm đã đặt</h4>
                            <div className="product-list-scrollable">
                                {order.order_items.map((item: any) => (
                                    <div key={item.id} className="product-row-item">
                                        <img
                                            src={
                                                item.products.product_images?.[0]?.image_url
                                                    ? mediaUrl(item.products.product_images[0].image_url)
                                                    : 'https://via.placeholder.com/60'
                                            }
                                            alt={item.products.name}
                                            className="prod-thumb-sm"
                                        />
                                        <div className="prod-info-sm">
                                            <p className="prod-name-sm">{item.products.name}</p>
                                            <p className="prod-qty-sm">x{item.quantity}</p>
                                        </div>
                                        <div className="prod-price-sm">
                                            {Number(item.price_at_time).toLocaleString()}đ
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;