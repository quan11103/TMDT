import React from 'react';
// Import các component của Swiper React
import { Swiper, SwiperSlide } from 'swiper/react';
// Import các module cần thiết (Điều hướng, Chấm tròn phân trang, Tự động chạy)
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import CSS mặc định của Swiper
import 'swiper/swiper-bundle.css';

// Import CSS tùy chỉnh của chúng ta
import './BannerSlider.css';

// Khai báo kiểu dữ liệu cho Slide
interface SlideData {
    id: number;
    title: string;
    link: string;
    imgSrc: string;
}

// Mảng chứa dữ liệu các Banner
const bannerData: SlideData[] = [
    {
        id: 1,
        title: "Feb.26 - Vali vỏ ngoài trong suốt",
        link: "https://www.muji.com.vn/vn/product/muji-vietnam-limited-hard-shell-suitcase-adjustable-handle-suitcase1",
        imgSrc: "https://api.muji.com.vn/media/mageplaza/bannerslider/banner/image/v/a/vali_trong_suo_t_1.png"
    },
    {
        id: 2,
        title: "Feb.26 - PYJAMA",
        link: "https://www.muji.com.vn/vn/search?q=pyjama",
        imgSrc: "https://api.muji.com.vn/media/mageplaza/bannerslider/banner/image/p/y/pyjama.png"
    },
    {
        id: 3,
        title: "Aug - New Skincare Series 1",
        link: "https://www.muji.com.vn/vn/category/2506-booster-essence-sensitive-care-series",
        imgSrc: "https://api.muji.com.vn/media/mageplaza/bannerslider/banner/image/a/r/artboard_3.png"
    },
    {
        id: 4,
        title: "June - EC Promotion - Combo 10 Jute my bag",
        link: "https://www.muji.com.vn/vn/category/32-hand-bags",
        imgSrc: "https://api.muji.com.vn/media/mageplaza/bannerslider/banner/image/c/o/combo_10_tu_i_my_bag.png"
    },
    {
        id: 5,
        title: "July - Gối",
        link: "https://www.muji.com.vn/vn/category/56-pillows",
        imgSrc: "https://api.muji.com.vn/media/mageplaza/bannerslider/banner/image/g/o/go_i_-_desk.png"
    },
    {
        id: 6,
        title: "Feb.26 - EC Promotion",
        link: "https://www.muji.com.vn/vn/category/1315-thursday-promotion-2025",
        imgSrc: "https://api.muji.com.vn/media/mageplaza/bannerslider/banner/image/t/e/te_t_delivery_1.png"
    }
];

const BannerSlider: React.FC = () => {
    return (
        <div className="banner-slider-container">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                navigation // Bật mũi tên chuyển slide
                pagination={{ clickable: true }} // Bật dấu chấm tròn
                autoplay={{ delay: 5000, disableOnInteraction: false }} // Tự động chạy sau 5s
                loop={true} // Lặp lại vô tận
                className="banner-swiper"
            >
                {bannerData.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <a
                            className="banner-link"
                            title={slide.title}
                            target="_blank"
                            rel="noopener noreferrer"
                            href={slide.link}
                        >
                            <img
                                className="banner-image"
                                alt={slide.title}
                                src={slide.imgSrc}
                                loading="eager"
                            />
                        </a>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default BannerSlider;