import React, { useState } from 'react';
import CartItem from '../components/cart/CartItem';
import OrderSummary from '../components/cart/OrderSummary';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import './CartPage.css';

const CartPage: React.FC = () => {
    // Dữ liệu giả lập
    const [cartItems, setCartItems] = useState([
        { id: 1, name: 'Gradient Graphic T-shirt', size: 'Large', color: 'White', price: 145, quantity: 1, image: '/images/p10.svg' },
        { id: 2, name: 'Checkered Shirt', size: 'Medium', color: 'Red', price: 180, quantity: 1, image: '/images/p3.svg' },
        { id: 3, name: 'Skinny Fit Jeans', size: 'Large', color: 'Blue', price: 240, quantity: 1, image: '/images/p2.svg' },
    ]);

    const handleRemove = (id: number) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const handleUpdateQty = (id: number, newQty: number) => {
        setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discount = Math.round(subtotal * 0.2);
    const deliveryFee = 15;

    return (
        <>
            <Header />

            {/* Container giới hạn chiều rộng chỉ áp dụng cho nội dung chính */}
            <div className="cart-page">
                <nav className="breadcrumbs">
                    <span>Home &nbsp; </span>
                    <img src="/icons/arrow-right.svg" alt="arrow" />
                    <span className="current"> &nbsp; Cart</span>
                </nav>
                <h2 className="cart-title">YOUR CART</h2>

                {/* Grid Layout chia cột tại đây */}
                <div className="cart-layout">

                    {/* Cột trái: Danh sách sản phẩm */}
                    <div className="items-container">
                        {cartItems.map(item => (
                            <CartItem
                                key={item.id}
                                {...item}
                                onRemove={handleRemove}
                                onUpdateQty={handleUpdateQty}
                            />
                        ))}
                    </div>

                    {/* Cột phải: Tổng tiền */}
                    <div className="summary-container">
                        <OrderSummary
                            subtotal={subtotal}
                            discount={discount}
                            deliveryFee={deliveryFee}
                        />
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default CartPage;