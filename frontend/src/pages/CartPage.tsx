import React, { useState } from 'react';
import type { Product } from '../types';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import './CartPage.css';
import ContentWrapper from '../components/cart-page/ContentWrapper';

const CartPage: React.FC = () => {
    const [items, setItems] = useState<Product[]>([
        { id: 'p1', name: 'Bút Bi Bấm 0.5mm - Xanh Dương MUJI', price: 25000, quantity: 1, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550002794132_org.jpg', productUrl: '#' },
        { id: 'p2', name: 'Túi My Bag A6 Vải Sợi Đay', price: 34000, quantity: 1, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550344878286_org.jpg', productUrl: '#' },
        { id: 'p3', name: 'Ruột Bút Mực Smooth Gel 0.5mm - Xanh Dương MUJI', price: 19000, quantity: 1, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550002822897_org.jpg', productUrl: '#' },
        { id: 'p4', name: 'Bút Bi Polycarbonate 0.7mm - Xanh Dương MUJI', price: 25000, quantity: 1, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550002186579_org.jpg', productUrl: '#' },
        { id: 'p5', name: 'Bộ 5 Bao Lì Xì 2026 (Quà tặng không bán)', price: 200000, quantity: 1, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/l/i/lizi2026.png', productUrl: '#' },
        { id: 'p6', name: 'Bút Bi Bấm 0.5mm - Đen MUJI', price: 25000, quantity: 1, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550002794118_org_1.jpg', productUrl: '#' }
    ]);

    const onChangeQuantity = (id: string, quantity: number) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const onRemoveItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <>
            <Header />
            <div className="cart-page">
                <div className="cart-header-container">
                    <h1 className="cart-title">Giỏ hàng</h1>
                </div>
                <ContentWrapper
                    items={items}
                    onChangeQuantity={onChangeQuantity}
                    onRemoveItem={onRemoveItem}
                />
            </div>
            <Footer />
        </>
    );
};

export default CartPage;