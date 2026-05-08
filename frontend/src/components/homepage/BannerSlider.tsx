import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import './BannerSlider.css';
import { API_BASE, apiUrl } from '../../lib/apiConfig';

const API_PUBLIC_BANNERS = `${API_BASE}/banners/public`;

interface BannerPublic {
    id: number;
    title: string;
    link_url: string | null;
    image_url: string;
    sort_order: number;
}

const imgFullUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    return apiUrl(imageUrl);
};

const BannerSlider: React.FC = () => {
    const [slides, setSlides] = useState<BannerPublic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                const res = await fetch(API_PUBLIC_BANNERS);
                const data = await res.json().catch(() => []);
                if (!cancelled && res.ok && Array.isArray(data)) {
                    setSlides(data);
                } else if (!cancelled) {
                    setSlides([]);
                }
            } catch {
                if (!cancelled) setSlides([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return <div className="banner-slider-container banner-slider-skeleton" aria-hidden="true" />;
    }

    if (slides.length === 0) {
        return null;
    }

    return (
        <div className="banner-slider-container">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                navigation={slides.length > 1}
                pagination={slides.length > 1 ? { clickable: true } : false}
                autoplay={
                    slides.length > 1
                        ? { delay: 5000, disableOnInteraction: false }
                        : false
                }
                loop={slides.length > 1}
                className="banner-swiper"
            >
                {slides.map((slide, index) => {
                    const img = (
                        <img
                            className="banner-image"
                            alt={slide.title}
                            src={imgFullUrl(slide.image_url)}
                            loading={index === 0 ? 'eager' : 'lazy'}
                        />
                    );
                    return (
                        <SwiperSlide key={slide.id}>
                            {slide.link_url ? (
                                <a
                                    className="banner-link"
                                    title={slide.title}
                                    href={slide.link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {img}
                                </a>
                            ) : (
                                <div className="banner-link" title={slide.title}>
                                    {img}
                                </div>
                            )}
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default BannerSlider;
