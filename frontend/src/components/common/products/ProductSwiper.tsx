import React, { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import ProductItem from './ProductItem';
import 'swiper/swiper-bundle.css';
import './ProductSwiper.css';

interface ProductSwiperProps {
    productsId: number[];
    /** Từ store settings (admin); không có → breakpoint mặc định cũ */
    slidesPerViewDesktop?: number;
}

function normalizeCols(raw?: number | null) {
    if (raw == null) return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    return Math.min(12, Math.max(1, Math.floor(n)));
}

function buildSwiperBreakpoints(slidesPerViewDesktop?: number | null) {
    const d = normalizeCols(slidesPerViewDesktop);
    if (d == null) {
        return {
            320: { slidesPerView: 2 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 6 },
        };
    }
    return {
        320: { slidesPerView: Math.min(2, d) },
        480: { slidesPerView: Math.min(3, d) },
        768: { slidesPerView: Math.min(4, d) },
        1024: { slidesPerView: d },
        1280: { slidesPerView: d },
    };
}

const ProductSwiper: React.FC<ProductSwiperProps> = ({ productsId, slidesPerViewDesktop }) => {
    const cols = normalizeCols(slidesPerViewDesktop);
    const breakpoints = useMemo(() => buildSwiperBreakpoints(slidesPerViewDesktop), [slidesPerViewDesktop]);
    /* Swiper không cập nhật breakpoints khi prop đổi sau mount — key ép tạo lại khi API settings về */
    const swiperKey = cols == null ? 'swiper-pending' : `swiper-cols-${cols}`;

    return (
        <div className="product-swiper-container">
            <Swiper
                key={swiperKey}
                modules={[Navigation]}
                navigation
                spaceBetween={12}
                breakpoints={breakpoints}
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
