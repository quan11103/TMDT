import React from 'react';
// Import Types
import type { Product, Review } from '../types';

// Import Components
import Header from '../components/common/Header';
import Hero from '../components/home/Hero';
import BrandBar from '../components/home/BrandBar';
import ProductList from '../components/sections/ProductList';
import { StyleBrowse } from '../components/home/StyleBrowse';
import Testimonials from '../components/home/Testimonials';
import Footer from '../components/common/Footer';

// Import CSS toàn cục
import './HomePage.css';

const HomePage: React.FC = () => {
    // 1. Dữ liệu mẫu cho New Arrivals
    const newArrivals: Product[] = [
        { id: 1, name: "T-shirt with Tape Details", price: 120, rating: 4.5, image: "/images/p1.svg" },
        { id: 2, name: "Skinny Fit Jeans", price: 240, originalPrice: 260, discountPercent: 20, rating: 3.5, image: "/images/p2.svg" },
        { id: 3, name: "Checkered Shirt", price: 180, rating: 4.5, image: "/images/p3.svg" },
        { id: 4, name: "Sleeve Striped T-shirt", price: 130, originalPrice: 160, discountPercent: 30, rating: 4.5, image: "/images/p4.svg" },
    ];

    // 2. Dữ liệu mẫu cho Top Selling
    const topSelling: Product[] = [
        { id: 5, name: "Vertical Striped Shirt", price: 212, originalPrice: 232, discountPercent: 20, rating: 5.0, image: "/images/p5.svg" },
        { id: 6, name: "Courage Graphic T-shirt", price: 145, rating: 4.0, image: "/images/p6.svg" },
        { id: 7, name: "Loose Fit Bermuda Shorts", price: 80, rating: 3.0, image: "/images/p7.svg" },
        { id: 8, name: "Faded Skinny Jeans", price: 210, rating: 4.5, image: "/images/p8.svg" },
    ];

    // 3. Dữ liệu mẫu cho Review
    const customerReviews: Review[] = [
        { id: 1, author: "Sarah M.", content: "I'm blown away by the quality and style of the clothes...", rating: 5, isVerified: true },
        { id: 2, author: "Alex K.", content: "Finding clothes that align with my personal style used to be a challenge...", rating: 5, isVerified: true },
        { id: 3, author: "James L.", content: "As someone who's always on the lookout for unique fashion pieces...", rating: 5, isVerified: true },
    ];

    return (
        <div className="homepage-container">
            {/* 1. Thanh điều hướng & Thông báo */}
            <Header />

            <main>
                {/* 2. Phần giới thiệu (Hero) */}
                <Hero />

                {/* 3. Dải logo thương hiệu */}
                <BrandBar />

                {/* 4. Danh sách sản phẩm mới */}
                <section className="section-padding">
                    <h2 className="section-title">NEW ARRIVALS</h2>
                    <ProductList products={newArrivals} />
                    <div className="view-all-container">
                        <button className="btn-outline">View All</button>
                    </div>
                </section>

                {/* 5. Danh sách sản phẩm bán chạy */}
                <section className="section-padding">
                    <h2 className="section-title">TOP SELLING</h2>
                    <ProductList products={topSelling} />
                    <div className="view-all-container">
                        <button className="btn-outline">View All</button>
                    </div>
                </section>

                {/* 6. Khám phá phong cách (Grid Bento) */}
                <StyleBrowse />

                {/* 7. Ý kiến khách hàng */}
                <Testimonials reviews={customerReviews} />
            </main>

            {/* 8. Chân trang (Bao gồm Newsletter) */}
            <Footer />
        </div>
    );
};

export default HomePage;