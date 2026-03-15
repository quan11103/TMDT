import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderSummary.css';
import type { CartItem } from '../../types';

interface Props {
    items: CartItem[];
    totalAmount: number;
}

const OrderSummary: React.FC<Props> = ({ items, totalAmount }) => {
    const navigate = useNavigate();

    const handleCheckoutClick = () => {
        navigate('/checkout');
    };

    const itemCount = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

    const FREE_SHIPPING_THRESHOLD = 500000;
    const moreToFreeShipping = FREE_SHIPPING_THRESHOLD - totalAmount;

    return (
        <aside className="order-summary-container">
            <div className="order-summary-card">
                <h3 className="summary-title">Thông tin đơn hàng ({items.length})</h3>

                <div className="summary-details">
                    {/* Tạm tính */}
                    <div className="summary-row">
                        <p className="row-label">Tạm tính ({itemCount} mặt hàng)</p>
                        <p className="row-value">{totalAmount.toLocaleString('vi-VN')} <span>VND</span></p>
                    </div>

                    {/* Phí vận chuyển */}
                    <div className="summary-row">
                        <p className="row-label">Phí vận chuyển</p>
                        <p className="row-value capitalize" style={{ color: totalAmount >= FREE_SHIPPING_THRESHOLD ? '#28a745' : 'inherit' }}>
                            {totalAmount >= FREE_SHIPPING_THRESHOLD ? 'Miễn phí' : 'Chưa tính toán'}
                        </p>
                    </div>

                    {/* Khuyến mãi */}
                    <div className="summary-row">
                        <p className="row-label">Tổng khuyến mãi</p>
                        <p className="row-value">0 <span>VND</span></p>
                    </div>

                    {/* Mã giảm giá */}
                    <div className="coupon-wrapper">
                        <div className="coupon-group">
                            <input
                                type="text"
                                className="coupon-input"
                                placeholder="Mã giảm giá"
                            />
                            <button className="coupon-btn">ÁP DỤNG</button>
                        </div>
                        {moreToFreeShipping > 0 && (
                            <p className="shipping-notice">
                                Mua thêm <strong>{moreToFreeShipping.toLocaleString('vi-VN')} VND</strong> để được miễn phí giao hàng
                            </p>
                        )}
                    </div>

                    {/* Tổng tiền */}
                    <div className="total-section">
                        <p className="total-label">Tổng tiền</p>
                        <div className="total-value-wrapper">
                            <p className="total-amount">{totalAmount.toLocaleString('vi-VN')} VND</p>
                            <span className="vat-notice">(Đã bao gồm VAT)</span>
                        </div>
                    </div>

                    {/* Hành động */}
                    <div className="summary-actions">
                        <button
                            className="checkout-btn"
                            onClick={handleCheckoutClick}
                            disabled={items.length === 0} // Không cho thanh toán nếu giỏ trống
                        >
                            Thanh toán
                        </button>
                        <button onClick={() => navigate('/')} className="continue-link">
                            Tiếp tục mua hàng
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default OrderSummary;