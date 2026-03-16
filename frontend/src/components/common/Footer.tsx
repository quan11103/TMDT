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
                            <p className="menu-title">About MUJI</p>
                            <ul>
                                <li><a href="/en/page/about">What is MUJI?</a></li>
                                <li><a href="/en/page/notice">Notice</a></li>
                                <li><a href="/en/page/careers">Careers</a></li>
                                <li><a href="/en/page/faq">FAQ</a></li>
                                <li><a href="https://drive.google.com/..." target="_blank">MUJI Household Catalog</a></li>
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
                        <p className="subscribe-title">Subscribe newsletters from MUJI</p>
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
                    <p className="copyright-italic">Copyright © Ryohin Keikaku Co., Ltd.</p>
                    <div className="company-info">
                        <p><strong>MUJI RETAIL (VIETNAM) CO., LTD.</strong></p>
                        <p>Business Registration Number: 0315855270 issued by the Department of Planning and Investment of Ho Chi Minh City on August 20th, 2019</p>
                        <p>Head Office: Unit No. 09-00, 9th Floor, Tower No. 9-11 Ton Duc Thang Street, Saigon Ward, Ho Chi Minh City, Vietnam</p>
                        <p>Head Office Number: 028 7108 8388</p>
                        <p>Working Hours: Monday to Friday, from 8:00 AM to 5:00 PM</p>
                        <p>Store Customer Service: <a href="https://www.muji.com.vn/en/page/store-location">https://www.muji.com.vn/en/page/store-location</a></p>
                        <p>E-commerce Customer Service: 1900 2555 79, Email: <a href="mailto:ec.sale@muji.vn">ec.sale@muji.vn</a></p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;