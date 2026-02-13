import React from 'react';
// Import Components chung
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ProductList from '../components/sections/ProductList';

// Import Components chi tiết
import ProductGallery from '../components/product-detail/ProductGallery';
import ProductInfo from '../components/product-detail/ProductInfo';
import ProductTabs from '../components/product-detail/ProductTabs';
import ReviewCard from '../components/product-detail/ReviewCard';

// Import Types & CSS
import type { Product } from '../types';
import './ProductDetailPage.css';
import '../components/common/Breadcrumbs.css';

const ProductDetail: React.FC = () => {
    // Dữ liệu mẫu cho phần gợi ý (You might also like)
    const relatedProducts: Product[] = [
        { id: 9, name: "Polo with Contrast Trims", price: 212, originalPrice: 242, discountPercent: 20, rating: 4.0, image: "/images/p9.svg" },
        { id: 10, name: "Gradient Graphic T-shirt", price: 145, rating: 3.5, image: "/images/p10.svg" },
        { id: 11, name: "Polo with Tipping Details", price: 180, rating: 4.5, image: "/images/p11.svg" },
        { id: 12, name: "Black Striped T-shirt", price: 120, originalPrice: 150, discountPercent: 30, rating: 5.0, image: "/images/p12.svg" },
    ];

    return (
        <>
            <Header />

            <div className="product-detail-page">
                <nav className="breadcrumbs">
                    <span>Home &nbsp; </span>
                    <img src="/icons/arrow-right.svg" alt="arrow" />
                    <span> &nbsp; Shop &nbsp; </span>
                    <img src="/icons/arrow-right.svg" alt="arrow" />
                    <span> &nbsp; Men &nbsp; </span>
                    <img src="/icons/arrow-right.svg" alt="arrow" />
                    <span className="current"> &nbsp; T-Shirt</span>
                </nav>

                {/* Phần 1: Ảnh và Thông tin mua hàng */}
                <div className="product-top-section">
                    <ProductGallery />
                    <ProductInfo />
                </div>

                {/* Phần 2: Tabs (Details, Reviews, FAQ) */}
                <ProductTabs />

                {/* Phần 3: Danh sách Review (Grid 2 cột) */}
                <div className="reviews-grid">
                    <ReviewCard name="Samantha D." date="August 14, 2023" content="I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable." />
                    <ReviewCard name="Alex M." date="August 15, 2023" content="The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch." />
                    <ReviewCard name="Ethan R." date="August 16, 2023" content="This t-shirt is a must-have for anyone who appreciates good design. The minimalist yet stylish pattern caught my eye." />
                    <ReviewCard name="Olivia P." date="August 17, 2023" content="As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear." />
                </div>

                <div className="load-more-container">
                    <button className="btn-outline">Load More Reviews</button>
                </div>

                {/* Phần 4: Sản phẩm liên quan */}
                <section className="related-products section-padding">
                    <h2 className="section-title">YOU MIGHT ALSO LIKE</h2>
                    <ProductList products={relatedProducts} />
                </section>
            </div>

            <Footer />
        </>
    );
};

export default ProductDetail;