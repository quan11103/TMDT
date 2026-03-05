import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb: React.FC = () => {
    const location = useLocation();

    // Tách đường dẫn URL thành các mảng, lọc bỏ các phần tử rỗng
    // Ví dụ: "/vn/signup" -> ["vn", "signup"]
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Bảng tra cứu tên hiển thị cho các path (Mapping)
    const breadcrumbLabels: Record<string, string> = {
        'vn': 'Trang chủ',
        'login': 'Đăng nhập',
        'signup': 'Đăng ký',
        'checkout': 'Thanh toán',
        'category': 'Danh mục',
        'product': 'Sản phẩm',
        'stationery': 'Văn phòng phẩm'
    };

    // Hàm chuyển đổi slug thành tên hiển thị (nếu không có trong mapping)
    const getLabel = (path: string) => {
        return breadcrumbLabels[path] || decodeURIComponent(path).replace(/-/g, ' ');
    };

    return (
        <div className="breadcrumb-wrapper">
            <nav aria-label="breadcrumb" className="breadcrumb-nav">
                <ol className="breadcrumb-list">
                    {/* Luôn hiển thị Trang chủ (vn) nếu pathnames trống hoặc phần tử đầu tiên không phải vn */}
                    {pathnames[0] !== 'vn' && (
                        <li className="breadcrumb-item">
                            <Link to="/" className="breadcrumb-link">Trang chủ</Link>
                            <svg className="breadcrumb-separator" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6"></path>
                            </svg>
                        </li>
                    )}

                    {pathnames.map((value, index) => {
                        const last = index === pathnames.length - 1;
                        // Tạo đường dẫn tích lũy: /vn -> /vn/signup
                        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                        const label = getLabel(value);

                        return (
                            <li key={to} className="breadcrumb-item">
                                {last ? (
                                    <span className="breadcrumb-current" aria-current="page">
                                        {label}
                                    </span>
                                ) : (
                                    <>
                                        <Link to={to} className="breadcrumb-link">
                                            {label}
                                        </Link>
                                        <svg className="breadcrumb-separator" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m9 18 6-6-6-6"></path>
                                        </svg>
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </div>
    );
};

export default Breadcrumb;