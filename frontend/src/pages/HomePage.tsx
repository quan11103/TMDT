import React from 'react';
import Header from '../components/common/Header';
import BannerSlider from '../components/homepage/BannerSlider';
import Footer from '../components/common/Footer';
import './HomePage.css';
import ProductSection from '../components/common/products/ProductSection';

const HomePage: React.FC = () => {
    return (
        <>
            <Header />

            <main>
                <div className="home-page">
                    <BannerSlider />
                    <ProductSection title='Sản Phẩm Mới Về' productsId={[1, 2, 3, 4, 5, 6]} />
                    <ProductSection title='Sản Phẩm Nổi Bật' productsId={[7, 19, 9, 10, 11, 12]} />
                    <ProductSection title='Sản Phẩm Bán Chạy' productsId={[13, 14, 15, 16, 17, 18]} />
                </div>
            </main>

            <Footer />
        </>
    );
};

export default HomePage;