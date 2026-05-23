import React, { useEffect, useState } from 'react';
import type { User, CartItem } from '../types';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ContentWrapper from '../components/checkout-page/ContentWrapper';
import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css';
import { API_BASE } from '../lib/apiConfig';

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
                return;
            }
        } else {
            // 2. Nếu không có dữ liệu (user tự ý gõ link /checkout), đẩy về giỏ hàng
            navigate('/cart');
            return;
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`${API_BASE}/users/me`, {
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

        const verifyCartAndCheckoutItems = async () => {
            try {
                const response = await fetch(`${API_BASE}/cart`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const cartData = await response.json();
                    const dbItems = cartData.items || [];

                    if (dbItems.length === 0) {
                        localStorage.removeItem('checkout_items');
                        navigate('/cart');
                        return;
                    }

                    // Kiểm tra xem các sản phẩm trong checkout_items còn tồn tại trong giỏ hàng DB hay không
                    const saved = localStorage.getItem('checkout_items');
                    if (saved) {
                        const parsed: CartItem[] = JSON.parse(saved);
                        const dbItemIds = dbItems.map((it: any) => it.id);
                        const valid = parsed.filter(item => dbItemIds.includes(item.id));

                        if (valid.length === 0) {
                            localStorage.removeItem('checkout_items');
                            navigate('/cart');
                        } else if (valid.length !== parsed.length) {
                            localStorage.setItem('checkout_items', JSON.stringify(valid));
                            setItems(valid);
                        }
                    }
                }
            } catch (error) {
                console.error("Lỗi khi kiểm tra giỏ hàng thực tế:", error);
            }
        };

        fetchUserProfile();
        verifyCartAndCheckoutItems();
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