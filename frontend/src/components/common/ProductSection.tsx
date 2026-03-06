import React from 'react';
import type { Product } from '../../types';
import ProductSlider from './ProductSlider';
import './ProductSection.css';

interface ProductSectionProps {
    products: Product[];
    title: string;
}

// Nhận title thông qua props
const ProductSection: React.FC<ProductSectionProps> = ({ products, title }) => {
    return (
        <section className="muji-section">
            <div className="section-container">

                <header className="section-header">
                    {/* Sử dụng tham số title ở đây */}
                    <h2 className="section-title">{title}</h2>
                    <a href="#" className="section-link">Xem Thêm</a>
                </header>

                <div className="section-content">
                    <ProductSlider products={products} />
                </div>

            </div>
        </section>
    );
};

export default ProductSection;