import React from 'react';
import type { Product } from '../../types';
import ProductSwiper from './ProductSwiper'; // Tận dụng component Swiper đã viết
import './ProductSlider.css';

interface ProductSliderProps {
    products: Product[];
}

const ProductSlider: React.FC<ProductSliderProps> = ({ products }) => {
    return (
        /* Lớp vỏ bao trọn, xử lý tràn trang và căn giữa */
        <div className="product-slider-wrapper">

            {/* Gọi ProductSwiper và truyền class điều hướng vào */}
            <div className="inner-swiper-container">
                <ProductSwiper products={products} />
            </div>

        </div>
    );
};

export default ProductSlider;