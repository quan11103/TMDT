import React, { useEffect, useState } from 'react';
import type { CartItem } from '../types';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ContentWrapper from '../components/checkout-page/ContentWrapper';
import './CheckoutPage.css';

const CheckoutPage: React.FC = () => {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const fetchCart = async () => {
            const token = localStorage.getItem('access_token');

            try {
                const response = await fetch('http://localhost:3000/api/cart', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Lỗi Server: ${response.status}`);
                }

                const data = await response.json();
                console.log("Dữ liệu nhận được:", data);
                setItems(data.items || []);
            } catch (error) {
                console.error("Lỗi Fetch:", error);
            }
        };
        fetchCart();
    }, []);

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