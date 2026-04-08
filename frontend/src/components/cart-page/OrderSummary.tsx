import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './OrderSummary.css';
import type { CartItem } from '../../types';
import {
    CHECKOUT_PROMO_STORAGE_KEY,
    previewOrderCheckout,
    type OrderPreviewResult,
} from '../../lib/orderPreview';

interface Props {
    selectedItems: CartItem[];
    totalAmount: number;
}

const OrderSummary: React.FC<Props> = ({ selectedItems, totalAmount }) => {
    const navigate = useNavigate();
    const [promoInput, setPromoInput] = useState('');
    const [appliedCode, setAppliedCode] = useState('');
    const [preview, setPreview] = useState<OrderPreviewResult | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [promoHint, setPromoHint] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

    const cartIds = selectedItems.map((i) => i.id);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (selectedItems.length === 0) {
                setPreview(null);
                setPromoHint(null);
                return;
            }
            const token = localStorage.getItem('access_token');
            if (!token) return;
            setPreviewLoading(true);
            setPromoHint(null);
            try {
                const p = await previewOrderCheckout(token, cartIds, appliedCode || undefined);
                if (!cancelled) setPreview(p);
            } catch {
                if (!cancelled && appliedCode) {
                    setPromoHint({ type: 'err', text: 'Mã không áp dụng được cho giỏ hàng. Đã gỡ mã.' });
                    setAppliedCode('');
                    try {
                        const p2 = await previewOrderCheckout(token, cartIds);
                        if (!cancelled) setPreview(p2);
                    } catch {
                        if (!cancelled) setPreview(null);
                    }
                } else if (!cancelled) {
                    setPreview(null);
                }
            } finally {
                if (!cancelled) setPreviewLoading(false);
            }
        };
        void run();
        return () => {
            cancelled = true;
        };
    }, [selectedItems.length, JSON.stringify(cartIds), appliedCode]);

    const handleCheckoutClick = () => {
        if (selectedItems.length === 0) {
            Swal.fire({
                title: 'Đơn hàng trống!',
                text: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán.',
                icon: 'warning',
                confirmButtonColor: '#7b0f1a',
                confirmButtonText: 'Đã hiểu',
            });
            return;
        }
        localStorage.setItem('checkout_items', JSON.stringify(selectedItems));
        if (appliedCode.trim()) {
            localStorage.setItem(CHECKOUT_PROMO_STORAGE_KEY, appliedCode.trim());
        } else {
            localStorage.removeItem(CHECKOUT_PROMO_STORAGE_KEY);
        }
        navigate('/checkout');
    };

    const handleApplyPromo = async () => {
        const trimmed = promoInput.trim().toUpperCase();
        if (!trimmed) {
            setPromoHint({ type: 'err', text: 'Vui lòng nhập mã.' });
            return;
        }
        const token = localStorage.getItem('access_token');
        if (!token) {
            Swal.fire({ title: 'Đăng nhập', text: 'Vui lòng đăng nhập để dùng mã.', icon: 'warning' });
            return;
        }
        if (selectedItems.length === 0) return;
        setPreviewLoading(true);
        setPromoHint(null);
        try {
            const p = await previewOrderCheckout(token, cartIds, trimmed);
            setPreview(p);
            setAppliedCode(trimmed);
            setPromoInput(trimmed);
            if (p.discount_amount > 0) {
                setPromoHint({
                    type: 'ok',
                    text: `Đã áp dụng. Giảm ${p.discount_amount.toLocaleString('vi-VN')}đ.`,
                });
            } else {
                setPromoHint({ type: 'ok', text: 'Mã hợp lệ nhưng không giảm thêm (không có SP áp dụng).' });
            }
        } catch (e: unknown) {
            setAppliedCode('');
            const msg = e instanceof Error ? e.message : 'Mã không hợp lệ';
            setPromoHint({ type: 'err', text: msg });
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleClearPromo = () => {
        setPromoInput('');
        setAppliedCode('');
        setPromoHint(null);
    };

    const itemCount = selectedItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

    const FREE_SHIPPING_THRESHOLD = 500000;
    const lineSubtotal = preview?.subtotal ?? totalAmount;
    const discount = preview?.discount_amount ?? 0;
    const payable = preview?.total_amount ?? totalAmount;
    const moreToFreeShipping = FREE_SHIPPING_THRESHOLD - payable;

    useEffect(() => {
        window.dispatchEvent(new Event('cartUpdated'));
    }, [itemCount]);

    return (
        <aside className="order-summary-container">
            <div className="order-summary-card">
                <h3 className="summary-title">Thông tin đơn hàng ({selectedItems.length})</h3>

                <div className="summary-details">
                    <div className="summary-row">
                        <p className="row-label">Tạm tính ({itemCount} mặt hàng)</p>
                        <p className="row-value">
                            {previewLoading && selectedItems.length > 0 ? (
                                <span className="muted">…</span>
                            ) : (
                                <>
                                    {lineSubtotal.toLocaleString('vi-VN')} <span>VND</span>
                                </>
                            )}
                        </p>
                    </div>

                    <div className="summary-row">
                        <p className="row-label">Phí vận chuyển</p>
                        <p
                            className="row-value capitalize"
                            style={{ color: payable >= FREE_SHIPPING_THRESHOLD ? '#28a745' : 'inherit' }}
                        >
                            {payable >= FREE_SHIPPING_THRESHOLD ? 'Miễn phí' : 'Chưa tính toán'}
                        </p>
                    </div>

                    <div className="summary-row">
                        <p className="row-label">Giảm giá (mã khuyến mại)</p>
                        <p className="row-value" style={{ color: discount > 0 ? '#2e7d32' : undefined }}>
                            {discount > 0 ? `-${discount.toLocaleString('vi-VN')}` : '0'} <span>VND</span>
                        </p>
                    </div>

                    <div className="coupon-wrapper">
                        <div className="coupon-group">
                            <input
                                type="text"
                                className="coupon-input"
                                placeholder="Mã giảm giá"
                                value={promoInput}
                                onChange={(e) => setPromoInput(e.target.value)}
                                disabled={previewLoading}
                            />
                            <button
                                type="button"
                                className="coupon-btn"
                                onClick={handleApplyPromo}
                                disabled={previewLoading}
                            >
                                {previewLoading ? '…' : 'ÁP DỤNG'}
                            </button>
                        </div>
                        {appliedCode && (
                            <button type="button" className="coupon-clear" onClick={handleClearPromo}>
                                Xóa mã
                            </button>
                        )}
                        {promoHint && (
                            <p className={`coupon-msg coupon-msg-${promoHint.type}`} role="status">
                                {promoHint.text}
                            </p>
                        )}
                        {moreToFreeShipping > 0 && (
                            <p className="shipping-notice">
                                Mua thêm <strong>{moreToFreeShipping.toLocaleString('vi-VN')} VND</strong> để được
                                miễn phí giao hàng
                            </p>
                        )}
                    </div>

                    <div className="total-section">
                        <p className="total-label">Tổng tiền (sau giảm)</p>
                        <div className="total-value-wrapper">
                            <p className="total-amount">
                                {previewLoading && selectedItems.length > 0 ? '…' : `${payable.toLocaleString('vi-VN')} VND`}
                            </p>
                            <span className="vat-notice">(Chưa gồm phí ship nếu có)</span>
                        </div>
                    </div>

                    <div className="summary-actions">
                        <button className="checkout-btn" onClick={handleCheckoutClick}>
                            Thanh toán
                        </button>
                        <button type="button" onClick={() => navigate('/')} className="continue-link">
                            Tiếp tục mua hàng
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default OrderSummary;
