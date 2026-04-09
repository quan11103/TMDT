import React from 'react';
import ProductSlider from './ProductSlider';
import './ProductSection.css';

interface ProductSectionProps {
    productsId: number[];
    title: string;
    /** Theo cấu hình cửa hàng (admin); chưa tải xong → swiper dùng breakpoint mặc định */
    productsPerRow?: number;
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, productsId, productsPerRow }) => {
    return (
        <section className="muji-section">
            <div className="section-container">

                <header className="section-header">
                    {/* Sử dụng tham số title ở đây */}
                    <h2 className="section-title">{title}</h2>
                    <a href="#" className="section-link">Xem Thêm</a>
                </header>

                <div className="section-content">
                    <ProductSlider productsId={productsId} slidesPerViewDesktop={productsPerRow} />
                </div>

            </div>
        </section>
    );
};

export default ProductSection;