import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './OrderSummary.css';
import type { CartItem } from '../../types';

interface Props {
    selectedItems: CartItem[];
    totalAmount: number;
}

const OrderSummary: React.FC<Props> = ({ selectedItems, totalAmount }) => {
    const navigate = useNavigate();

    const handleCheckoutClick = () => {
        if (selectedItems.length === 0) {
            Swal.fire({
                title: 'Đơn hàng trống!',
                text: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán.',
                icon: 'warning',
                confirmButtonColor: '#7b0f1a', // Màu đỏ Muji của bạn
                confirmButtonText: 'Đã hiểu'
            });
            return;
        }
        // Lưu tạm các item được chọn vào kho lưu trữ
        localStorage.setItem('checkout_items', JSON.stringify(selectedItems));
        navigate('/checkout');
    };

    const itemCount = selectedItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

    const FREE_SHIPPING_THRESHOLD = 500000;
    const moreToFreeShipping = FREE_SHIPPING_THRESHOLD - totalAmount;

    useEffect(() => {
        // Chỉ phát tín hiệu khi giỏ hàng có dữ liệu hoặc thay đổi
        // Điều này giúp Header cập nhật đúng con số 'itemCount' mà bạn thấy ở row-label
        window.dispatchEvent(new Event('cartUpdated'));
    }, [itemCount]); // Chỉ chạy lại khi tổng số lượng món hàng thay đổi

    return (
        <aside className="order-summary-container">
            <div className="order-summary-card">
                <h3 className="summary-title">Thông tin đơn hàng ({selectedItems.length})</h3>

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