import React, { useEffect, useState } from 'react';
import type { User, CartItem } from '../types';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ContentWrapper from '../components/checkout-page/ContentWrapper';
import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css';

const CheckoutPage: React.FC = () => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [userProfile, setUserProfile] = useState<User | null>(null);
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

        const fetchUserProfile = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const response = await fetch('http://localhost:3000/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserProfile(data);
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin người dùng:", error);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    return (
        <>
            <Header />
            <div className="checkout-page">
                <ContentWrapper
                    items={items}
                    user={userProfile}
                />
            </div>
            <Footer />
        </>
    );
};

export default CheckoutPage;