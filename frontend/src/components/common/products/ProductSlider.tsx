import React from 'react';
import ProductSwiper from './ProductSwiper';
import './ProductSlider.css';

interface ProductSliderProps {
    productsId: number[];
    /** Số slide desktop từ cấu hình cửa hàng (admin) */
    slidesPerViewDesktop?: number;
}

const ProductSlider: React.FC<ProductSliderProps> = ({ productsId, slidesPerViewDesktop }) => {
    return (
        <div className="product-slider-wrapper">

            <div className="inner-swiper-container">
                <ProductSwiper productsId={productsId} slidesPerViewDesktop={slidesPerViewDesktop} />
            </div>

        </div>
    );
};

export default ProductSlider;