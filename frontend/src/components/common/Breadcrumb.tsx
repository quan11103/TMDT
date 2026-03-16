import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumb.css';

interface Props {
    productName?: string;
    category?: any; // Dữ liệu từ API trả về có cấu trúc { name, categories: { name: ... } }
}

const Breadcrumb: React.FC<Props> = ({ productName, category }) => {
    return (
        <div className="breadcrumb-wrapper">
            <nav aria-label="breadcrumb" className="breadcrumb-nav">
                <ol className="breadcrumb-list">
                    {/* Luôn hiển thị Trang chủ */}
                    <li className="breadcrumb-item">
                        <Link to="/" className="breadcrumb-link">Trang chủ</Link>
                        <svg className="breadcrumb-separator" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6"></path>
                        </svg>
                    </li>

                    {/* HIỂN THỊ DANH MỤC CHA (Cấp 1 - Giấy & Sổ) */}
                    {category?.categories && (
                        <li className="breadcrumb-item">
                            <Link to={`/category/${category.categories.id}`} className="breadcrumb-link">
                                {category.categories.name}
                            </Link>
                            <svg className="breadcrumb-separator" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6"></path>
                            </svg>
                        </li>
                    )}

                    {/* HIỂN THỊ DANH MỤC CON (Cấp 2 - Giấy in) */}
                    {category && (
                        <li className="breadcrumb-item">
                            {/* Nếu là trang sản phẩm thì cấp này là Link, nếu là trang danh mục thì là text hiện tại */}
                            {productName ? (
                                <>
                                    <Link to={`/category/${category.id}`} className="breadcrumb-link">
                                        {category.name}
                                    </Link>
                                    <svg className="breadcrumb-separator" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m9 18 6-6-6-6"></path>
                                    </svg>
                                </>
                            ) : (
                                <span className="breadcrumb-current">{category.name}</span>
                            )}
                        </li>
                    )}

                    {/* HIỂN THỊ TÊN SẢN PHẨM CUỐI CÙNG */}
                    {productName && (
                        <li className="breadcrumb-item">
                            <span className="breadcrumb-current">{productName}</span>
                        </li>
                    )}

                    {/* ẨN TOÀN BỘ PHẦN MAP URL CŨ ĐỂ TRÁNH TRÙNG LẶP */}
                    {/* (Bạn có thể comment đoạn pathnames.map cũ lại) */}
                </ol>
            </nav>
        </div>
    );
};

export default Breadcrumb;