import React from "react";
import type { CartItem, ShippingInfo } from "../../types";
import { useNavigate } from 'react-router-dom';
import "./OrderSummary.css";
import Swal from "sweetalert2";
import { mediaUrl } from "../../lib/mediaUrl";
import { CHECKOUT_PROMO_STORAGE_KEY } from "../../lib/orderPreview";
import type { OrderPreviewResult } from "../../lib/orderPreview";
import { API_BASE } from "../../lib/apiConfig";

interface Props {
    items: CartItem[];
    shippingInfo: ShippingInfo;
    shipping?: number;
    paymentMethod: string | null;
    preview: OrderPreviewResult | null;
    previewLoading?: boolean;
    /** Mã đang áp dụng (đồng bộ với CreateOrderDto.promotion_code) */
    promotionCode?: string;
}

const OrderSummary: React.FC<Props> = ({
    items,
    shippingInfo,
    shipping,
    paymentMethod,
    preview,
    previewLoading,
    promotionCode = "",
}) => {
    if (!items || items.length === 0) {
        return <div className="os-empty">Giỏ hàng của bạn đang trống.</div>;
    }

    const navigate = useNavigate();

    const { email, fullName, phone, province, district, ward, street } = shippingInfo;
    const itemCount = items.reduce((acc, it) => acc + (it.quantity || 0), 0);
    const computedSubtotal = items.reduce(
        (acc, item) => acc + Number(item.products.price) * item.quantity,
        0
    );
    const subtotal = preview ? preview.subtotal : computedSubtotal;
    const discount = preview ? preview.discount_amount : 0;
    const afterDiscount = preview ? preview.total_amount : computedSubtotal;
    const total = typeof shipping === "number" ? afterDiscount + shipping : afterDiscount;
    const fmt = (v: number) => v.toLocaleString("vi-VN");

    const handleConfirmOrder = async () => {
        // 1. Kiểm tra validation địa chỉ
        if (!email || !fullName || !phone || !province || !ward || !street) {
            Swal.fire({
                icon: 'warning',
                title: 'Thông tin chưa đầy đủ',
                text: 'Vui lòng hoàn thiện địa chỉ giao hàng khi thanh toán.',
                confirmButtonColor: '#7b0f1a'
            });
            return;
        }

        // 2. Lấy token xác thực
        const token = localStorage.getItem('access_token'); // Đảm bảo key này khớp với lúc bạn lưu khi Login

        if (!token) {
            Swal.fire('Lỗi', 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
            navigate('/login');
            return;
        }

        // 3. Chuẩn bị dữ liệu theo CreateOrderDto của Backend
        const code =
            promotionCode.trim() || localStorage.getItem(CHECKOUT_PROMO_STORAGE_KEY)?.trim() || "";
        const orderPayload: Record<string, unknown> = {
            cart_item_ids: items.map(it => it.id), // Lấy danh sách ID các item trong giỏ
            address: `${street}, ${ward}, ${district}, ${province}`, // Ghép chuỗi địa chỉ đầy đủ
            phone: phone,
            note: shippingInfo.note || ""
        };
        if (code) orderPayload.promotion_code = code;

        try {
            Swal.showLoading();

            // BƯỚC A: Gọi API tạo đơn hàng
            const orderResponse = await fetch(`${API_BASE}/order`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderPayload)
            });

            const orderResult = await orderResponse.json();

            if (orderResponse.ok) {
                // BƯỚC B: Gọi API tạo Payment cho đơn hàng vừa tạo
                // Giả sử bạn chọn mặc định là VNPAY, nếu có UI chọn method thì thay bằng biến
                const paymentResponse = await fetch(`${API_BASE}/payment`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        order_id: orderResult.id,
                        method: paymentMethod?.toUpperCase()
                    })
                });

                const paymentResult = await paymentResponse.json();

                if (paymentResponse.ok) {
                    Swal.close();
                    localStorage.removeItem(CHECKOUT_PROMO_STORAGE_KEY);
                    // CHUYỂN HƯỚNG sang trang Redirect đã thiết kế
                    // KIỂM TRA PHƯƠNG THỨC THANH TOÁN
                    if (paymentMethod?.toUpperCase() === 'VNPAY') {
                        // Nếu là VNPAY thì mới yêu cầu và chuyển hướng URL
                        if (paymentResult.payment_url) {
                            window.location.href = paymentResult.payment_url;
                        } else {
                            throw new Error('Không nhận được liên kết thanh toán từ VNPay');
                        }
                    } else {
                        // Nếu là COD hoặc phương thức khác không cần chuyển hướng
                        Swal.fire({
                            icon: 'success',
                            title: 'Đặt hàng thành công!',
                            text: 'Đơn hàng của bạn đã được ghi nhận (COD).',
                            confirmButtonColor: '#7b0f1a'
                        }).then(() => {
                            navigate('/order-status/'); // Chuyển về trang danh sách đơn hàng của khách
                        });
                    }
                } else {
                    throw new Error(paymentResult.message || 'Lỗi tạo liên kết thanh toán');
                }
            } else {
                throw new Error(orderResult.message || 'Có lỗi xảy ra khi tạo đơn hàng');
            }
        } catch (error: any) {
            console.error("Lỗi đặt hàng:", error);
            Swal.fire({
                icon: 'error',
                title: 'Thanh toán thất bại',
                text: error.message,
                confirmButtonColor: '#d33'
            });
        }
    };

    return (
        <aside className="os">
            <h3 className="os-title">Thông tin đơn hàng ({items.length})</h3>

            <div className="os-list">
                {items.map((it) => (
                    <div key={it.id} className="os-item">
                        <div className="os-imgWrap">
                            <img
                                className="os-img"
                                src={
                                    it.products.product_images[0]?.image_url
                                        ? mediaUrl(it.products.product_images[0].image_url)
                                        : 'https://via.placeholder.com/80'
                                }
                                alt={it.products.name}
                            />
                        </div>
                        <div className="os-info">
                            <div className="os-name">{it.products.name}</div>
                            <div className="os-meta">
                                <span className="muted">Số lượng:</span> {it.quantity}
                            </div>
                            <div className="os-price">
                                {fmt(it.products.price)} <span className="vnd">VND</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="os-summary">
                <div className="os-row">
                    <div className="os-label">Tạm tính ({itemCount} mặt hàng)</div>
                    <div className="os-value">
                        {previewLoading ? (
                            <span className="muted">…</span>
                        ) : (
                            <>
                                {fmt(subtotal)} <span className="vnd">VND</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="os-row">
                    <div className="os-label">Phí vận chuyển</div>
                    <div className="os-value">
                        {typeof shipping === "number" ?
                            `${fmt(shipping)} VND` :
                            <span className="muted">Chưa tính toán</span>
                        }
                    </div>
                </div>

                <div className="os-row">
                    <div className="os-label">Giảm giá (mã khuyến mại)</div>
                    <div className="os-value" style={{ color: discount > 0 ? '#1f7a3a' : undefined }}>
                        {previewLoading ? (
                            <span className="muted">…</span>
                        ) : (
                            <>
                                {discount > 0 ? `-${fmt(discount)}` : fmt(0)} <span className="vnd">VND</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="os-total">
                    <div className="os-total-label">Tổng tiền</div>
                    <div className="os-total-value">
                        <div className="big">
                            {previewLoading ? '…' : `${fmt(total)} VND`}
                        </div>
                        <div className="vat">(Đã bao gồm VAT)</div>
                    </div>
                </div>

                <div className="os-actions">
                    <button
                        className="btn-checkout"
                        type="button"
                        disabled={items.length === 0 || !paymentMethod}
                        onClick={handleConfirmOrder}
                        style={{
                            backgroundColor: !paymentMethod ? '#ccc' : '',
                            cursor: !paymentMethod ? 'auto' : 'pointer'
                        }}
                    >
                        Thanh toán
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default OrderSummary;