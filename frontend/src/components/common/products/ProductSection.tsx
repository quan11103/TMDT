import React from 'react';
import ProductSlider from './ProductSlider';
import './ProductSection.css';

interface ProductSectionProps {
    productsId: number[];
    title: string;
}

// Nhận title thông qua props
const ProductSection: React.FC<ProductSectionProps> = ({ title, productsId }) => {
    return (
        <section className="muji-section">
            <div className="section-container">

                <header className="section-header">
                    {/* Sử dụng tham số title ở đây */}
                    <h2 className="section-title">{title}</h2>
                    <a href="#" className="section-link">Xem Thêm</a>
                </header>

                <div className="section-content">
                    <ProductSlider productsId={productsId} />
                </div>

            </div>
        </section>
    );
};

export default ProductSection;