import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import ProductItem from './ProductItem';
import 'swiper/swiper-bundle.css';
import './ProductSwiper.css';

interface ProductSwiperProps {
    productsId: number[];
}

const ProductSwiper: React.FC<ProductSwiperProps> = ({ productsId }) => {
    return (
        <div className="product-swiper-container">
            <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={12}
                breakpoints={{
                    320: { slidesPerView: 2 },
                    768: { slidesPerView: 4 },
                    1024: { slidesPerView: 5 },
                    1280: { slidesPerView: 6 },
                }}
                className="product-swiper"
            >
                {productsId.map((productsId) => (
                    <SwiperSlide key={productsId}>
                        <ProductItem Id={productsId} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default ProductSwiper;