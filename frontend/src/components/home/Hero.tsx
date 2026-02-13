import React from 'react';
import './Hero.css';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
    const navigate = useNavigate();

    const handleShopClick = () => {
        navigate(`/category/`);
    };

    const handleAdminClick = () => {
        navigate(`/admin`);
    };

    return (
        <section className="hero">
            <div className="hero-content">
                <h1>FIND CLOTHES THAT MATCHES YOUR STYLE</h1>
                <p>Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.</p>
                <button className="shop-now-btn" onClick={handleShopClick}>Shop Now</button>

                <div className="stats">
                    <div className="stat-item">
                        <h3>200+</h3>
                        <p>International Brands</p>
                    </div>
                    <div className="stat-item">
                        <h3>2,000+</h3>
                        <p>High-Quality Products</p>
                    </div>
                    <div className="stat-item">
                        <h3>30,000+</h3>
                        <p>Happy Customers</p>
                    </div>
                </div>
            </div>
            <div className="hero-image" style={{ cursor: 'pointer' }} onClick={handleAdminClick}>
                {/* Thay bằng đường dẫn ảnh thật của bạn */}
                <img src="/images/hero-image.png" alt="Fashion Models" />
                <div className="star-icon star-big">✦</div>
                <div className="star-icon star-small">✦</div>
            </div>
        </section>
    );
};

export default Hero;