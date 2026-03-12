import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface User {
    full_name: string;
    email?: string;
}

const Header: React.FC = () => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleCartClick = () => {
        navigate(`/cart/`);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
        setIsUserMenuOpen(false);
    };

    return (
        <header className="header">
            <div className="header-inner">
                {/* Mobile Hamburger Menu */}
                <div className="mobile-menu-toggle">
                    <div id="hamburger-menu" className="hamburger">
                        <span className="line"></span>
                        <span className="line"></span>
                        <span className="line"></span>
                    </div>
                    <div className="menu-wrapper"></div>
                </div>

                {/* Logo */}
                <a className="logo" title="Welcome to MUJI" href="/">
                    <img
                        alt="Welcome to MUJI"
                        fetchPriority="high"
                        decoding="async"
                        data-nimg="1"
                        className="header-logo"
                        style={{ color: 'transparent' }}
                        src="/logo-removebg-preview.png"
                    />
                </a>

                {/* Desktop Navigation */}
                <nav aria-label="Main" className="main-nav">
                    <div className="nav-container">
                        <ul className="nav-menu" dir="ltr">
                            <li><a title="Hàng Mới" className="nav-link" href="/en/new-arrivals">Hàng Mới</a></li>
                            <li><a title="Bán chạy" className="nav-link" href="/en/bestseller">Bán chạy</a></li>
                            <li>
                                <button className="nav-button">
                                    <a className="category-link" title="Quần Áo" href="/category">Quần Áo</a>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-chevron" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                                </button>
                            </li>
                            <li>
                                <button className="nav-button">
                                    <a className="category-link" title="Sức Khỏe &amp; Làm Đẹp" href="/en/category/228-health-beauty">Sức Khỏe &amp; Làm Đẹp</a>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-chevron" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                                </button>
                            </li>
                            <li>
                                <button className="nav-button">
                                    <a className="category-link" title="Gia Dụng" href="/en/category/43-home">Gia Dụng</a>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-chevron" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                                </button>
                            </li>
                            <li>
                                <button className="nav-button">
                                    <a className="category-link" title="Thực Phẩm" href="/en/category/44-food-drink">Thực Phẩm</a>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-chevron" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                                </button>
                            </li>
                        </ul>
                    </div>
                </nav>

                {/* Right Action Section */}
                <div className="right-section">
                    <div className="action-group">

                        {/* Search Box */}
                        <div className="search-wrapper">
                            <div className="search-box">
                                <svg className="mobile-search-icon" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M5.94286 0C7.519 0 9.03059 0.62612 10.1451 1.74062C11.2596 2.85512 11.8857 4.36671 11.8857 5.94286C11.8857 7.41486 11.3463 8.768 10.4594 9.81029L10.7063 10.0571H11.4286L16 14.6286L14.6286 16L10.0571 11.4286V10.7063L9.81029 10.4594C8.768 11.3463 7.41486 11.8857 5.94286 11.8857C4.36671 11.8857 2.85512 11.2596 1.74062 10.1451C0.62612 9.03059 0 7.519 0 5.94286C0 4.36671 0.62612 2.85512 1.74062 1.74062C2.85512 0.62612 4.36671 0 5.94286 0ZM5.94286 1.82857C3.65714 1.82857 1.82857 3.65714 1.82857 5.94286C1.82857 8.22857 3.65714 10.0571 5.94286 10.0571C8.22857 10.0571 10.0571 8.22857 10.0571 5.94286C10.0571 3.65714 8.22857 1.82857 5.94286 1.82857Z" fill="white"></path></svg>
                                <div className="search-input-field" >
                                    <svg className="search-icon-inside" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M5.94286 0C7.519 0 9.03059 0.62612 10.1451 1.74062C11.2596 2.85512 11.8857 4.36671 11.8857 5.94286C11.8857 7.41486 11.3463 8.768 10.4594 9.81029L10.7063 10.0571H11.4286L16 14.6286L14.6286 16L10.0571 11.4286V10.7063L9.81029 10.4594C8.768 11.3463 7.41486 11.8857 5.94286 11.8857C4.36671 11.8857 2.85512 11.2596 1.74062 10.1451C0.62612 9.03059 0 7.519 0 5.94286C0 4.36671 0.62612 2.85512 1.74062 1.74062C2.85512 0.62612 4.36671 0 5.94286 0ZM5.94286 1.82857C3.65714 1.82857 1.82857 3.65714 1.82857 5.94286C1.82857 8.22857 3.65714 10.0571 5.94286 10.0571C8.22857 10.0571 10.0571 8.22857 10.0571 5.94286C10.0571 3.65714 8.22857 1.82857 5.94286 1.82857Z" fill="black" ></path ></svg>
                                    <form className="search-form">
                                        <input type="text" className="search-input" id="search" aria-label="Search" autoComplete="off" placeholder="Bạn đang muốn tìm kiếm gì?" defaultValue="" />
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Cart Icon */}
                        <div className="cart-icon-wrapper" onClick={handleCartClick}>
                            <div className="cart-count">0</div>
                            <div className="cart-svg-desktop">
                                <svg width="20" height="20" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1H2.83766C2.91259 1 2.98751 1.06244 3 1.13736L4.33617 9.70383C4.33617 9.77876 4.41109 9.8412 4.49851 9.8412H17.5C17.5749 9.8412 17.6499 9.79125 17.6623 9.70383L19.2483 1.3996" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round"></path><path d="M6.73274 15.3366C7.8569 15.3366 8.76821 14.4253 8.76821 13.3011C8.76821 12.1769 7.8569 11.2656 6.73274 11.2656C5.60858 11.2656 4.69727 12.1769 4.69727 13.3011C4.69727 14.4253 5.60858 15.3366 6.73274 15.3366Z" fill="white"></path><path d="M15.2738 15.3366C16.3979 15.3366 17.3092 14.4253 17.3092 13.3011C17.3092 12.1769 16.3979 11.2656 15.2738 11.2656C14.1496 11.2656 13.2383 12.1769 13.2383 13.3011C13.2383 14.4253 14.1496 15.3366 15.2738 15.3366Z" fill="white"></path></svg>
                            </div>
                            <div className="cart-svg-mobile">
                                <svg width="20" height="20" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1H2.83766C2.91259 1 2.98751 1.06244 3 1.13736L4.33617 9.70383C4.33617 9.77876 4.41109 9.8412 4.49851 9.8412H17.5C17.5749 9.8412 17.6499 9.79125 17.6623 9.70383L19.2483 1.3996" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round"></path><path d="M6.73274 15.3366C7.8569 15.3366 8.76821 14.4253 8.76821 13.3011C8.76821 12.1769 7.8569 11.2656 6.73274 11.2656C5.60858 11.2656 4.69727 12.1769 4.69727 13.3011C4.69727 14.4253 5.60858 15.3366 6.73274 15.3366Z" fill="white"></path><path d="M15.2738 15.3366C16.3979 15.3366 17.3092 14.4253 17.3092 13.3011C17.3092 12.1769 16.3979 11.2656 15.2738 11.2656C14.1496 11.2656 13.2383 12.1769 13.2383 13.3011C13.2383 14.4253 14.1496 15.3366 15.2738 15.3366Z" fill="white"></path></svg>
                            </div>
                        </div>

                        {/* User Icon & Popup */}
                        <div className="user-icon-wrapper" ref={userMenuRef}>
                            <div className="user-icon-btn" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C9.243 2 7 4.243 7 7C7 9.757 9.243 12 12 12C14.757 12 17 9.757 17 7C17 4.243 14.757 2 12 2ZM12 14C8.016 14 2 15.98 2 20V22H22V20C22 15.98 15.984 14 12 14Z" />
                                </svg>
                            </div>

                            {isUserMenuOpen && (
                                <div className="user-popup-menu">
                                    {user ? (
                                        <>
                                            <span className="user-popup-name">Xin chào {user.full_name}</span>
                                            <span className="user-popup-divider">|</span>
                                            <button onClick={handleLogout} className="user-popup-link logout-btn">
                                                Đăng xuất
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <a href="/login" className="user-popup-link">Đăng nhập</a>
                                            <span className="user-popup-divider">|</span>
                                            <a href="/signup" className="user-popup-link">Đăng kí</a>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;