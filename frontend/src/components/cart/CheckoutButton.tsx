import React from 'react';
import './CheckoutButton.css';
import { useNavigate } from 'react-router-dom';

const CheckoutButton: React.FC = () => {
    const navigate = useNavigate();

    const handleCheckoutClick = () => {
        navigate(`/checkout`);
    };

    return (
        <button className="btn-checkout-full" onClick={handleCheckoutClick}>
            Go to Checkout
            <img src="/icons/arrow-right-white.svg" alt="arrow" />
        </button>
    );
};

export default CheckoutButton;