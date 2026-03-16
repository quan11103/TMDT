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
                navigation // Bật nút Next/Prev
                spaceBetween={12} // Khoảng cách giữa các sản phẩm (tương đương margin-right: 12px)
                // Cấu hình Responsive: Tự động chỉnh số lượng sản phẩm hiển thị theo kích thước màn hình
                breakpoints={{
                    320: { slidesPerView: 2 }, // Mobile: hiện 2 sản phẩm
                    768: { slidesPerView: 4 }, // Tablet: hiện 4 sản phẩm
                    1024: { slidesPerView: 5 }, // Laptop nhỏ: hiện 5 sản phẩm
                    1280: { slidesPerView: 6 }, // Desktop: hiện 6 sản phẩm (khớp với width ~201px của MUJI)
                }}
                className="product-swiper"
            >
                {productsId.map((productsId) => (
                    // Thẻ SwiperSlide bọc ngoài ProductItem
                    <SwiperSlide key={productsId}>
                        <ProductItem Id={productsId} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default ProductSwiper;