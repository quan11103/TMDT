import React, { useState } from 'react';
import './CheckoutPage.css';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAppSelector } from '../store/Hooks';
import ContentWrapper from '../components/checkout-page/ContentWrapper';

const CheckoutPage: React.FC = () => {
    const items = useAppSelector((state) => state.checkout.items);
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