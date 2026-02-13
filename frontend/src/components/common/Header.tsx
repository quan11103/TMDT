import React from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
    const navigate = useNavigate();

    const handleHomeClick = () => {
        navigate(`/`);
    };

    const HandleCategoryClick = () => {
        navigate(`/category/`);
    }

    const handleCartClick = () => {
        navigate(`/cart/`);
    };

    const handleLoginClick = () => {
        navigate(`/login/`);
    };

    return (
        <header className="header">
            <nav className="navbar">
                <div className="logo" style={{ cursor: 'pointer' }} onClick={handleHomeClick}>SHOP.CO</div>
                <ul className="nav-links">
                    <li onClick={HandleCategoryClick}>
                        Shop
                        <img src="/icons/chevron-down.svg" alt="down" className="icon-img-small" />
                    </li>
                    <li>On Sale</li>
                    <li>New Arrivals</li>
                    <li>Brands</li>
                </ul>
                <div className="search-bar">
                    <img src="/icons/search.svg" alt="search" className="icon-img" />
                    <input type="text" placeholder="Search for products..." />
                </div>
                <div className="nav-icons">
                    <img src="/icons/cart.svg" alt="cart" className="icon-img" onClick={handleCartClick} />
                    <img src="/icons/user.svg" alt="user" className="icon-img" onClick={handleLoginClick} />
                </div>
            </nav>
        </header>
    );
};

export default Header;