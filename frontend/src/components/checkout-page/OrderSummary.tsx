import React from "react";
import "./OrderSummary.css";
import type { Product } from "../../types";

interface Props {
    items: Product[];
    shipping?: number;    // phí vận chuyển nếu đã tính (VND)
    discount?: number;    // tổng khuyến mãi (VND)
}

const OrderSummary: React.FC<Props> = ({ items, shipping, discount = 0 }) => {
    const itemCount = items.reduce((acc, it) => acc + (it.quantity || 0), 0);
    const subtotal = items.reduce(
        (acc, it) => acc + (it.price || 0) * (it.quantity || 0),
        0
    );

    // Nếu chưa có phí vận chuyển, giữ tổng = subtotal (giống mẫu)
    const total = typeof shipping === "number" ? subtotal + shipping - discount : subtotal;

    const fmt = (v: number) => v.toLocaleString("vi-VN");

    return (
        <aside className="os">
            <h3 className="os-title">Thông tin đơn hàng ({itemCount})</h3>

            <div className="os-list">
                {items.map((it) => (
                    <div key={it.id} className="os-item">
                        <div className="os-imgWrap">
                            <img className="os-img" src={it.imageUrl} alt={it.name} />
                        </div>
                        <div className="os-info">
                            <div className="os-name">{it.name}</div>
                            <div className="os-meta"><span className="muted">Số lượng</span> {it.quantity}</div>
                            <div className="os-price">{fmt(it.price)} <span className="vnd">VND</span></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="os-summary">
                <div className="os-row">
                    <div className="os-label">Tạm tính ({itemCount} mặt hàng)</div>
                    <div className="os-value">{fmt(subtotal)} <span className="vnd">VND</span></div>
                </div>

                <div className="os-row">
                    <div className="os-label">Phí vận chuyển</div>
                    <div className="os-value">
                        {typeof shipping === "number" ? `${fmt(shipping)} VND` : <span className="muted">Chưa tính toán</span>}
                    </div>
                </div>

                <div className="os-row">
                    <div className="os-label">Tổng khuyến mãi</div>
                    <div className="os-value">{fmt(discount || 0)} <span className="vnd">VND</span></div>
                </div>

                <div className="os-total">
                    <div className="os-total-label">Tổng tiền</div>
                    <div className="os-total-value">
                        <div className="big">{fmt(total)} VND</div>
                        <div className="vat">(Đã bao gồm VAT)</div>
                    </div>
                </div>

                <div className="os-actions">
                    <button
                        className="btn-checkout"
                        type="button"
                        disabled={items.length === 0}
                    >
                        Thanh toán
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default OrderSummary;