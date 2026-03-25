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
    const [cartCount, setCartCount] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const userMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const fetchCartCount = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setCartCount(0);
                return;
            }

            const response = await fetch('http://localhost:3000/api/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // data.items là mảng các mặt hàng trong giỏ
                // Logic tính tổng quantity giống hệt itemCount trong OrderSummary
                const total = data.items.reduce((acc: number, item: any) =>
                    acc + (Number(item.quantity) || 0), 0
                );
                setCartCount(total);
            }
        } catch (error) {
            console.error("Lỗi lấy giỏ hàng:", error);
        }
    };

    const handleCartClick = () => {
        navigate(`/cart/`);
    };

    const handleCategoryClick = (categoryId: number) => {
        navigate(`/category/${categoryId}`);
    };

    const handleOrderStatusClick = () => {
        navigate(`/order-status/`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn trang bị reload
        if (searchTerm.trim()) {
            // Chuyển sang trang search với query parameter 'q'
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    useEffect(() => {
        fetchCartCount(); // Chạy lần đầu khi load trang

        // Lắng nghe sự kiện khi thêm hàng thành công từ các component khác
        window.addEventListener('cartUpdated', fetchCartCount);
        return () => window.removeEventListener('cartUpdated', fetchCartCount);
    }, []);

    useEffect(() => {

        const storedUser = localStorage.getItem('user');

        if (storedUser) {

            setUser(JSON.parse(storedUser));

        }

    }, []);

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
        setCartCount(0);
        setIsUserMenuOpen(false);
        window.location.reload();
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
                                <button className="nav-button" onClick={() => handleCategoryClick(1)}>
                                    <a className="category-link" title="Bút viết" href="/category/1">Bút viết</a>
                                </button>
                            </li>
                            <li>
                                <button className="nav-button" onClick={() => handleCategoryClick(2)}>
                                    <a className="category-link" title="Giấy &amp; Sổ" href="/category/2">Giấy &amp; Sổ</a>
                                </button>
                            </li>
                            <li>
                                <button className="nav-button" onClick={() => handleCategoryClick(5)}>
                                    <a className="category-link" title="Balo & Túi" href="/category/5">Balo & Túi</a>
                                </button>
                            </li>
                            <li>
                                <button className="nav-button" onClick={() => handleCategoryClick(4)}>
                                    <a className="category-link" title="Mực in & Mực máy" href="/category/4">Mực in & Mực máy</a>
                                </button>
                            </li>
                            <li>
                                <button className="nav-button" onClick={() => handleCategoryClick(3)}>
                                    <a className="category-link" title="Dụng cụ văn phòng" href="/category/3">Dụng cụ văn phòng</a>
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
                                    <form className="search-form" onSubmit={handleSearch}>
                                        <input
                                            type="text"
                                            className="search-input"
                                            placeholder="Bạn đang muốn tìm kiếm gì?"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật state khi gõ
                                        />
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Cart Icon */}
                        <div className="cart-icon-wrapper" onClick={handleCartClick}>
                            <div className="cart-count">{cartCount}</div>
                            <div className="cart-svg-desktop">
                                <svg width="20" height="20" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1H2.83766C2.91259 1 2.98751 1.06244 3 1.13736L4.33617 9.70383C4.33617 9.77876 4.41109 9.8412 4.49851 9.8412H17.5C17.5749 9.8412 17.6499 9.79125 17.6623 9.70383L19.2483 1.3996" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round"></path><path d="M6.73274 15.3366C7.8569 15.3366 8.76821 14.4253 8.76821 13.3011C8.76821 12.1769 7.8569 11.2656 6.73274 11.2656C5.60858 11.2656 4.69727 12.1769 4.69727 13.3011C4.69727 14.4253 5.60858 15.3366 6.73274 15.3366Z" fill="white"></path><path d="M15.2738 15.3366C16.3979 15.3366 17.3092 14.4253 17.3092 13.3011C17.3092 12.1769 16.3979 11.2656 15.2738 11.2656C14.1496 11.2656 13.2383 12.1769 13.2383 13.3011C13.2383 14.4253 14.1496 15.3366 15.2738 15.3366Z" fill="white"></path></svg>
                            </div>
                            <div className="cart-svg-mobile">
                                <svg width="20" height="20" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1H2.83766C2.91259 1 2.98751 1.06244 3 1.13736L4.33617 9.70383C4.33617 9.77876 4.41109 9.8412 4.49851 9.8412H17.5C17.5749 9.8412 17.6499 9.79125 17.6623 9.70383L19.2483 1.3996" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round"></path><path d="M6.73274 15.3366C7.8569 15.3366 8.76821 14.4253 8.76821 13.3011C8.76821 12.1769 7.8569 11.2656 6.73274 11.2656C5.60858 11.2656 4.69727 12.1769 4.69727 13.3011C4.69727 14.4253 5.60858 15.3366 6.73274 15.3366Z" fill="white"></path><path d="M15.2738 15.3366C16.3979 15.3366 17.3092 14.4253 17.3092 13.3011C17.3092 12.1769 16.3979 11.2656 15.2738 11.2656C14.1496 11.2656 13.2383 12.1769 13.2383 13.3011C13.2383 14.4253 14.1496 15.3366 15.2738 15.3366Z" fill="white"></path></svg>
                            </div>
                        </div>

                        {/* User Icon & Popup */}
                        <div className="user-wrapper" ref={userMenuRef}>
                            <div className="user-icon-btn" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C9.243 2 7 4.243 7 7C7 9.757 9.243 12 12 12C14.757 12 17 9.757 17 7C17 4.243 14.757 2 12 2ZM12 14C8.016 14 2 15.98 2 20V22H22V20C22 15.98 15.984 14 12 14Z" />
                                </svg>
                            </div>

                            {isUserMenuOpen && (
                                <div className="user-dropdown">
                                    {/* Mũi tên tam giác */}
                                    <div className="dropdown-arrow">
                                        <svg width="30" height="10" viewBox="0 0 30 10" preserveAspectRatio="none">
                                            <polygon points="0,0 30,0 15,10"></polygon>
                                        </svg>
                                    </div>

                                    <div className="dropdown-content">
                                        {user ? (
                                            <>
                                                <div className="dropdown-greeting">
                                                    Chào, <span>{user.full_name}</span>
                                                </div>

                                                <div className="dropdown-item" onClick={() => navigate('/account')}>
                                                    <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="item-icon">
                                                        <path d="M9 9.5C11.2091 9.5 13 7.70914 13 5.5C13 3.29086 11.2091 1.5 9 1.5C6.79086 1.5 5 3.29086 5 5.5C5 7.70914 6.79086 9.5 9 9.5Z" stroke="currentColor" strokeWidth="1.5"></path>
                                                        <path d="M7.98855 11.6992H10.0115C13.8703 11.6992 17 14.3511 17 17.6138V18.1992H1V17.6138C1 14.348 4.13344 11.6992 7.98855 11.6992Z" stroke="currentColor" strokeWidth="1.5"></path>
                                                    </svg>
                                                    <span>Thông tin tài khoản</span>
                                                </div>

                                                <div className="dropdown-item" onClick={handleOrderStatusClick}>
                                                    <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="item-icon">
                                                        <path d="M0.808594 3.5H2.77478C2.96027 3.5 3.12102 3.63603 3.14576 3.83388L4.6915 15.6062H15.6477" stroke="currentColor" strokeWidth="1.5"></path>
                                                        <path d="M4.54297 13.4035H16.7358C16.9213 13.4035 17.082 13.2674 17.1068 13.0943L17.9989 5.5" stroke="currentColor" strokeWidth="1.5"></path>
                                                    </svg>
                                                    <span>Đơn hàng</span>
                                                </div>

                                                <div className="dropdown-divider"></div>

                                                <div className="dropdown-item logout" onClick={handleLogout}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="item-icon">
                                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                                        <polyline points="16 17 21 12 16 7"></polyline>
                                                        <line x1="21" x2="9" y1="12" y2="12"></line>
                                                    </svg>
                                                    <span>Đăng xuất</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="dropdown-auth">
                                                <button onClick={() => navigate('/login')}>Đăng nhập</button>
                                                <div className="auth-divider"></div>
                                                <button onClick={() => navigate('/signup')}>Đăng ký</button>
                                            </div>
                                        )}
                                    </div>
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