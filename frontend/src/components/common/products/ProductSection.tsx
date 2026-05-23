import React from 'react';
import { Link } from 'react-router-dom';
import ProductSlider from './ProductSlider';
import './ProductSection.css';

interface ProductSectionProps {
    productsId: number[];
    title: string;
    /** Theo cấu hình cửa hàng (admin); chưa tải xong → swiper dùng breakpoint mặc định */
    productsPerRow?: number;
    /** Đường dẫn chuyển hướng khi nhấn nút "Xem Thêm" */
    viewMoreLink?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, productsId, productsPerRow, viewMoreLink }) => {
    return (
        <section className="muji-section">
            <div className="section-container">

                <header className="section-header">
                    {/* Sử dụng tham số title ở đây */}
                    <h2 className="section-title">{title}</h2>
                    {viewMoreLink ? (
                        <Link to={viewMoreLink} className="section-link">Xem Thêm</Link>
                    ) : (
                        <a href="#" className="section-link">Xem Thêm</a>
                    )}
                </header>

                <div className="section-content">
                    <ProductSlider productsId={productsId} slidesPerViewDesktop={productsPerRow} />
                </div>

            </div>
        </section>
    );
};

export default ProductSection;