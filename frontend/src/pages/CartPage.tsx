import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import type { CartItem } from '../types';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ContentWrapper from '../components/cart-page/ContentWrapper';
import './CartPage.css';

interface CartData {
    items: CartItem[];
    totalAmount: number;
    totalItems: number;
}

const CartPage: React.FC = () => {
    const [cartData, setCartData] = useState<CartData | null>(null);
    const [error, setError] = useState("");

    const API_URL = "http://localhost:3000/api/cart";
    const token = localStorage.getItem("access_token");

    // 1. Hàm lấy dữ liệu giỏ hàng
    const fetchCart = async () => {
        try {
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartData(response.data);
        } catch (err: any) {
            setError("Không thể tải giỏ hàng. Vui lòng đăng nhập lại.");
        }
    };

    useEffect(() => {
        if (token) {
            fetchCart();
        } else {
            setError("Vui lòng đăng nhập để xem giỏ hàng.");
        }
    }, [token]);

    // 2. Hàm thay đổi số lượng (PATCH /api/cart/{itemId})
    // Sửa tham số newQuantity từ 'number' thành 'number | string'
    const onChangeQuantity = async (itemId: number, newQuantity: number | string) => {

        // 2.1. Cập nhật Local State ngay lập tức để người dùng thấy số lượng thay đổi (kể cả khi họ xóa trống)
        const previousData = cartData;
        if (cartData) {
            const updatedItems = cartData.items.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            );

            // Khi tính tổng tiền, chúng ta dùng Number() để tránh lỗi với chuỗi rỗng
            const newTotal = updatedItems.reduce((sum, item) => {
                const qty = Number(item.quantity) || 0;
                return sum + (item.products.price * qty);
            }, 0);

            setCartData({ ...cartData, items: updatedItems as CartItem[], totalAmount: newTotal });
        }

        // 2.2. Kiểm tra điều kiện để gọi API
        const numericQty = Number(newQuantity);

        // Chỉ gọi API khi người dùng đã nhập một số hợp lệ và >= 1
        // Nếu họ đang xóa trống (string "") hoặc nhập 0, chúng ta không gọi API
        if (!isNaN(numericQty) && numericQty >= 1) {
            try {
                await axios.patch(`${API_URL}/${itemId}`,
                    { quantity: numericQty },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err: any) {
                // Nếu API lỗi (ví dụ: vượt quá tồn kho), rollback lại dữ liệu cũ
                setCartData(previousData);

                // Hiển thị thông báo lỗi chi tiết từ Backend (ví dụ: "Chỉ còn 5 sản phẩm")
                const errorMsg = err.response?.data?.message || "Không thể cập nhật số lượng.";
                alert(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
            }
        }
    };

    // 3. Hàm xóa mục hàng (DELETE /api/cart/{itemId})
    const onRemoveItem = async (itemId: number) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa?',
            text: "Sản phẩm sẽ bị loại bỏ khỏi giỏ hàng của bạn!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#7b0f1a',
            cancelButtonColor: '#6e7881',
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/${itemId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                fetchCart();
            } catch (err) {
                Swal.fire(
                    'Lỗi!',
                    'Không thể xóa sản phẩm. Vui lòng thử lại sau.',
                    'error'
                );
            }
        }
    };

    return (
        <>
            <Header />
            <div className="cart-page">
                <div className="cart-header-container">
                    <h1 className="cart-title">Giỏ hàng</h1>
                </div>
                {error ? (
                    <div className="cart-error-msg">{error}</div>
                ) : (
                    <ContentWrapper
                        items={cartData?.items || []}
                        totalAmount={cartData?.totalAmount || 0}
                        onChangeQuantity={onChangeQuantity}
                        onRemoveItem={onRemoveItem}
                    />
                )}
            </div>
            <Footer />
        </>
    );
};

export default CartPage;