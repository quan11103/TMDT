import React, { useEffect, useState } from 'react';
import './ContentWrapper.css';
import type { User, ShippingInfo, CartItem } from '../../types';
import ShippingAddress from './ShippingAddress';
import PaymentMethod from './PaymentMethod';
import Coupon from './Coupon';
import OrderSummary from './OrderSummary';
import {
    CHECKOUT_PROMO_STORAGE_KEY,
    previewOrderCheckout,
    type OrderPreviewResult,
} from '../../lib/orderPreview';

interface Props {
    items: CartItem[];
    user: User | null;
}

const ContentWrapper: React.FC<Props> = ({ items, user }) => {
    const [address, setAddress] = useState<ShippingInfo>({
        email: '',
        fullName: '',
        phone: '',
        province: '',
        provinceCode: '',
        district: '',
        districtCode: '',
        ward: '',
        wardCode: '',
        street: '',
        note: '',
        addrType: 'home',
    });

    useEffect(() => {
        if (user) {
            setAddress((prev) => ({
                ...prev,
                email: user.email || prev.email,
                fullName: user.full_name || prev.fullName,
                phone: user.phone || prev.phone,
            }));
        }
    }, [user]);

    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [preview, setPreview] = useState<OrderPreviewResult | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [promoInput, setPromoInput] = useState('');
    const [appliedCode, setAppliedCode] = useState('');
    const [couponMsg, setCouponMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    const cartIds = items.map((i) => i.id);

    useEffect(() => {
        if (items.length === 0) {
            setPreview(null);
            return;
        }
        const token = localStorage.getItem('access_token');
        if (!token) return;

        let cancelled = false;
        (async () => {
            setPreviewLoading(true);
            setCouponMsg(null);
            const saved = localStorage.getItem(CHECKOUT_PROMO_STORAGE_KEY) || '';
            if (saved) setPromoInput(saved);
            try {
                const p = await previewOrderCheckout(token, cartIds, saved || undefined);
                if (!cancelled) {
                    setPreview(p);
                    if (saved) setAppliedCode(saved);
                }
            } catch {
                localStorage.removeItem(CHECKOUT_PROMO_STORAGE_KEY);
                if (!cancelled) {
                    setPromoInput('');
                    setAppliedCode('');
                    try {
                        const p = await previewOrderCheckout(token, cartIds);
                        if (!cancelled) setPreview(p);
                    } catch {
                        if (!cancelled) setPreview(null);
                    }
                }
            } finally {
                if (!cancelled) setPreviewLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [items.length, JSON.stringify(cartIds)]);

    const handleApplyCoupon = async () => {
        const token = localStorage.getItem('access_token');
        if (!token || cartIds.length === 0) return;
        const code = promoInput.trim().toUpperCase();
        if (!code) {
            setCouponMsg({ type: 'error', text: 'Vui lòng nhập mã giảm giá.' });
            return;
        }
        setPreviewLoading(true);
        setCouponMsg(null);
        try {
            const p = await previewOrderCheckout(token, cartIds, code);
            setPreview(p);
            setAppliedCode(code);
            localStorage.setItem(CHECKOUT_PROMO_STORAGE_KEY, code);
            setPromoInput(code);
            setCouponMsg({
                type: 'success',
                text:
                    p.discount_amount > 0
                        ? `Đã áp dụng. Giảm ${p.discount_amount.toLocaleString('vi-VN')}đ.`
                        : 'Mã hợp lệ (không có khoản giảm cho giỏ hàng này).',
            });
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Mã không hợp lệ hoặc hết hạn.';
            setCouponMsg({ type: 'error', text: msg });
            localStorage.removeItem(CHECKOUT_PROMO_STORAGE_KEY);
            setAppliedCode('');
            try {
                const p = await previewOrderCheckout(token, cartIds);
                setPreview(p);
            } catch {
                /* ignore */
            }
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleClearCoupon = async () => {
        setPromoInput('');
        setAppliedCode('');
        setCouponMsg(null);
        localStorage.removeItem(CHECKOUT_PROMO_STORAGE_KEY);
        const token = localStorage.getItem('access_token');
        if (!token || cartIds.length === 0) return;
        setPreviewLoading(true);
        try {
            const p = await previewOrderCheckout(token, cartIds);
            setPreview(p);
        } finally {
            setPreviewLoading(false);
        }
    };

    return (
        <div className="checkout-wrapper">
            <div className="checkout-container">
                <div className="checkout-left">
                    <ShippingAddress address={address} setAddress={setAddress} />
                </div>

                <div className="checkout-right">
                    <div className="sticky-content">
                        <section className="section-card">
                            <PaymentMethod selected={paymentMethod} onSelect={setPaymentMethod} />
                        </section>

                        <section className="section-card">
                            <Coupon
                                value={promoInput}
                                onChange={setPromoInput}
                                onApply={() => void handleApplyCoupon()}
                                onClear={() => void handleClearCoupon()}
                                loading={previewLoading}
                                message={couponMsg}
                                showClear={Boolean(appliedCode)}
                            />
                        </section>

                        <section className="section-card">
                            <div className="summary-container">
                                <OrderSummary
                                    items={items}
                                    shippingInfo={address}
                                    paymentMethod={paymentMethod}
                                    preview={preview}
                                    previewLoading={previewLoading}
                                    promotionCode={appliedCode}
                                />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentWrapper;
