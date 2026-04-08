import React from "react";
import "./Coupon.css";

export interface CouponMessage {
    type: "error" | "success";
    text: string;
}

interface Props {
    value: string;
    onChange: (v: string) => void;
    onApply: () => void;
    onClear?: () => void;
    loading?: boolean;
    message?: CouponMessage | null;
    showClear?: boolean;
}

const Coupon: React.FC<Props> = ({
    value,
    onChange,
    onApply,
    onClear,
    loading,
    message,
    showClear,
}) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onApply();
    };

    return (
        <aside className="coupon">
            <h3 className="title">Mã giảm giá</h3>

            <form className="coupon-form" onSubmit={handleSubmit} noValidate>
                <input
                    className="input"
                    id="coupon_code"
                    name="coupon_code"
                    type="text"
                    placeholder="Nhập mã (ví dụ SUMMER26)"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={loading}
                    aria-label="Mã giảm giá"
                    autoComplete="off"
                />

                <button className="btn" type="submit" aria-label="Áp dụng mã" disabled={loading}>
                    {loading ? "…" : "ÁP DỤNG"}
                </button>
            </form>

            {showClear && onClear && (
                <button type="button" className="coupon-clear-btn" onClick={onClear} disabled={loading}>
                    Xóa mã
                </button>
            )}

            {message && (
                <p className={`msg ${message.type === "error" ? "err" : "ok"}`} role="status">
                    {message.text}
                </p>
            )}
        </aside>
    );
};

export default Coupon;
