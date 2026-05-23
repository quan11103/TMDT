import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Phần trên: Logo, Menu, Subscribe */}
                <div className="footer-top">

                    {/* Cột 1: Logo & Chứng nhận */}
                    <div className="footer-brand">
                        <div className="footer-certificate">
                            <a href="http://online.gov.vn/Home/WebDetails/123273" target="_blank" rel="noreferrer">
                                <img
                                    src="https://api.muji.com.vn/media/wysiwyg/home_block/logoSaleNoti.png"
                                    alt="Đã thông báo bộ công thương"
                                    width="195"
                                    height="74"
                                />
                            </a>
                        </div>
                    </div>

                    {/* Cột 2: Các danh mục Menu */}
                    <div className="footer-menu-grid">
                        <div className="footer-menu-column">
                            <p className="menu-title">About VPP21</p>
                            <ul>
                                <li><a href="/en/page/about">What is VPP21?</a></li>
                                <li><a href="/en/page/notice">Notice</a></li>
                                <li><a href="/en/page/careers">Careers</a></li>
                                <li><a href="/en/page/faq">FAQ</a></li>
                                <li><a href="https://drive.google.com/..." target="_blank">VPP21 Catalog</a></li>
                            </ul>
                        </div>

                        <div className="footer-menu-column">
                            <p className="menu-title">Physical Stores</p>
                            <ul>
                                <li><a href="/en/page/notice-2716">Exchange, Return, Refund Policies</a></li>
                                <li><a href="/en/page/store-location">Store locations</a></li>
                            </ul>
                        </div>

                        <div className="footer-menu-column">
                            <p className="menu-title">Online Store</p>
                            <ul>
                                <li><a href="/en/page/privacy">Privacy Policy</a></li>
                                <li><a href="/en/page/delivery">Delivery Policy</a></li>
                                <li><a href="/en/page/refund">Return & Refund Policy</a></li>
                                <li><a href="/en/page/warranty">Warranty Policy</a></li>
                                <li><a href="/en/page/sales-policy">Sales Policy</a></li>
                                <li><a href="/en/page/return">Exchange Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Cột 3: Đăng ký & Mạng xã hội */}
                    <div className="footer-actions">
                        <p className="subscribe-title">Subscribe newsletters from VPP21</p>
                        <form className="subscribe-form">
                            <input
                                type="email"
                                placeholder="Enter email"
                                className="subscribe-input"
                                required
                            />
                            <button type="submit" className="subscribe-button">Subscribe</button>
                        </form>

                        <ul className="social-links">
                            <li><a href="https://zalo.me/..." target="_blank" rel="noreferrer"><img src="https://api.muji.com.vn/media/wysiwyg/footer/zalo.png" alt="Zalo" /></a></li>
                            <li><a href="https://www.facebook.com/..." target="_blank" rel="noreferrer"><img src="https://api.muji.com.vn/media/wysiwyg/footer/fb.png" alt="Facebook" /></a></li>
                            <li><a href="https://www.instagram.com/..." target="_blank" rel="noreferrer"><img src="https://api.muji.com.vn/media/wysiwyg/footer/ins.png" alt="Instagram" /></a></li>
                            <li><a href="https://www.tiktok.com/..." target="_blank" rel="noreferrer"><img src="https://api.muji.com.vn/media/wysiwyg/footer/tiktok.png" alt="Tiktok" /></a></li>
                        </ul>
                    </div>
                </div>

                {/* Phần dưới: Thông tin bản quyền & Công ty */}
                <div className="footer-bottom">
                    <div className="company-info">
                        <p><strong>VPP21 RETAIL (VIETNAM) CO., LTD.</strong></p>
                        <p>Head Office: No. 1, Tran Phu Street, Ha Dong Ward, Ha Noi, Vietnam</p>
                        <p>Head Office Number: 012 3456 7890</p>
                        <p>Working Hours: Monday to Friday, from 8:00 AM to 5:00 PM</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;