import React from 'react';
import ProductSwiper from './ProductSwiper';
import './ProductSlider.css';

interface ProductSliderProps {
    productsId: number[];
}

const ProductSlider: React.FC<ProductSliderProps> = ({ productsId }) => {
    return (
        <div className="product-slider-wrapper">

            <div className="inner-swiper-container">
                <ProductSwiper productsId={productsId} />
            </div>

        </div>
    );
};

export default ProductSlider;