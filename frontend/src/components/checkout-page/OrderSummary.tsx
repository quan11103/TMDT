import React from "react";
import type { CartItem, ShippingInfo } from "../../types";
import { useNavigate } from 'react-router-dom';
import "./OrderSummary.css";
import Swal from "sweetalert2";

interface Props {
    items: CartItem[];
    shippingInfo: ShippingInfo;
    shipping?: number;
    discount?: number;
}

const OrderSummary: React.FC<Props> = ({ items, shippingInfo, shipping, discount = 0 }) => {
    if (!items || items.length === 0) {
        return <div className="os-empty">Giỏ hàng của bạn đang trống.</div>;
    }

    const navigate = useNavigate();

    const { email, fullName, phone, province, district, ward, street } = shippingInfo;
    const itemCount = items.reduce((acc, it) => acc + (it.quantity || 0), 0);
    const subtotal = items.reduce(
        (acc, item) => acc + Number(item.products.price) * item.quantity,
        0
    );
    const total = typeof shipping === "number" ? subtotal + shipping - discount : subtotal;
    const fmt = (v: number) => v.toLocaleString("vi-VN");

    const handleConfirmOrder = async () => {
        // 1. Kiểm tra validation địa chỉ
        if (!email || !fullName || !phone || !province || !district || !ward || !street) {
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
        const orderPayload = {
            cart_item_ids: items.map(it => it.id), // Lấy danh sách ID các item trong giỏ
            address: `${street}, ${ward}, ${district}, ${province}`, // Ghép chuỗi địa chỉ đầy đủ
            phone: phone,
            note: shippingInfo.note || ""
        };

        try {
            // Hiển thị loading để người dùng không nhấn nút nhiều lần
            Swal.showLoading();

            // 4. Gọi API tạo đơn hàng (Backend sẽ tự trừ kho và xóa giỏ hàng trong Transaction)
            const response = await fetch('http://localhost:3000/api/order', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderPayload)
            });

            const result = await response.json();

            if (response.ok) {
                // Thành công: Backend đã tự xóa cart_items và trừ stock products
                await Swal.fire({
                    icon: 'success',
                    title: 'Đặt hàng thành công!',
                    text: `Mã đơn hàng của bạn là: #${result.id}`,
                    confirmButtonColor: '#28a745'
                });
                navigate('/'); // Quay về trang chủ
            } else {
                // Thất bại: Hiển thị lỗi từ NestJS (ví dụ: "Sản phẩm A chỉ còn lại 2 sản phẩm")
                throw new Error(result.message || 'Có lỗi xảy ra khi tạo đơn hàng');
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
                                src={it.products.product_images[0]?.image_url || 'https://via.placeholder.com/80'}
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
                    <div className="os-value">{fmt(subtotal)} <span className="vnd">VND</span></div>
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
                        onClick={handleConfirmOrder}
                    >
                        Thanh toán
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default OrderSummary;