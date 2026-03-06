import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderSummary.css';
import type { CartItem } from '../../types';
import { useAppDispatch } from '../../store/Hooks';
import { setItems } from '../../store/slices/CheckoutSlice';

interface Props {
    items: CartItem[];
}

const OrderSummary: React.FC<Props> = ({ items }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleCheckoutClick = () => {
        dispatch(setItems(items));   // <-- lưu vào redux
        navigate('/checkout');      // <-- chuyển trang
    };

    const total = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    const moreToFreeShipping = 500000 - total;

    return (
        <aside className="order-summary-container">
            <div className="order-summary-card">
                <h3 className="summary-title">Thông tin đơn hàng ({itemCount})</h3>

                <div className="summary-details">
                    {/* Tạm tính */}
                    <div className="summary-row">
                        <p className="row-label">Tạm tính ({itemCount} mặt hàng)</p>
                        <p className="row-value">{total.toLocaleString('vi-VN')} <span>VND</span></p>
                    </div>

                    {/* Phí vận chuyển */}
                    <div className="summary-row">
                        <p className="row-label">Phí vận chuyển</p>
                        <p className="row-value capitalize">Chưa tính toán</p>
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
                                Mua thêm {moreToFreeShipping.toLocaleString('vi-VN')} VND để được miễn phí giao hàng
                            </p>)}
                    </div>

                    {/* Tổng tiền */}
                    <div className="total-section">
                        <p className="total-label">Tổng tiền</p>
                        <div className="total-value-wrapper">
                            <p className="total-amount">{total.toLocaleString('vi-VN')} VND</p>
                            <span className="vat-notice">(Đã bao gồm VAT)</span>
                        </div>
                    </div>

                    {/* Hành động */}
                    <div className="summary-actions">
                        <button className="checkout-btn" onClick={handleCheckoutClick}>Thanh toán</button>
                        <a href="/vn" className="continue-link">Tiếp tục mua hàng</a>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default OrderSummary;