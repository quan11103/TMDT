import React, { useEffect, useState } from 'react';
import type { CartItem } from '../types';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ContentWrapper from '../components/checkout-page/ContentWrapper';
import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css';

const CheckoutPage: React.FC = () => {
    const [items, setItems] = useState<CartItem[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const savedItems = localStorage.getItem('checkout_items');

        if (savedItems) {
            try {
                const parsedItems: CartItem[] = JSON.parse(savedItems);

                if (parsedItems.length === 0) {
                    // Nếu mảng rỗng, đẩy về giỏ hàng
                    navigate('/cart');
                    return;
                }

                setItems(parsedItems);
            } catch (error) {
                console.error("Lỗi parse dữ liệu checkout:", error);
                navigate('/cart');
            }
        } else {
            // 2. Nếu không có dữ liệu (user tự ý gõ link /checkout), đẩy về giỏ hàng
            navigate('/cart');
        }
    }, [navigate]);

    return (
        <>
            <Header />
            <div className="checkout-page">
                <ContentWrapper items={items} />
            </div>
            <Footer />
        </>
    );
};

export default CheckoutPage;