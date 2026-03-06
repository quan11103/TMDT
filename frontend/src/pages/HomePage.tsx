import React from 'react';
import type { Product } from '../types';
import Header from '../components/common/Header';
import BannerSlider from '../components/homepage/BannerSlider';
import Footer from '../components/common/Footer';
import './HomePage.css';
import ProductSection from '../components/common/ProductSection';

const NewArrivals: Product[] = [
    { id: 'p1', name: 'Bút Bi Bấm 0.5mm - Xanh Dương MUJI', price: 25000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550002794132_org.jpg', productUrl: '#' },
    { id: 'p2', name: 'Túi My Bag A6 Vải Sợi Đay', price: 34000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550344878286_org.jpg', productUrl: '#' },
    { id: 'p3', name: 'Ruột Bút Mực Smooth Gel 0.5mm - Xanh Dương MUJI', price: 19000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550002822897_org.jpg', productUrl: '#' },
    { id: 'p4', name: 'Bút Bi Polycarbonate 0.7mm - Xanh Dương MUJI', price: 25000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550002186579_org.jpg', productUrl: '#' },
    { id: 'p5', name: 'Bộ 5 Bao Lì Xì 2026 (Quà tặng không bán)', price: 200000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/l/i/lizi2026.png', productUrl: '#' },
    { id: 'p6', name: 'Bút Bi Bấm 0.5mm - Đen MUJI', price: 25000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550002794118_org_1.jpg', productUrl: '#' }
];

const FeaturedProducts: Product[] = [
    { id: 'p7', name: 'Nến Thơm Mùi Cây Xô Thơm', price: 97000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4547315275007_org.jpg', productUrl: '#' },
    { id: 'p8', name: 'Cuộn Lăn Bụi Thay Thế - Xé Chéo (1 cuộn) - Dành cho Cây Lăn Bụi Thảm', price: 38000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550344131954_org.jpg', productUrl: '#' },
    { id: 'p9', name: 'Ruột Bút Mực Smooth Gel 0.5mm - Đen MUJI', price: 19000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550002822873_org.jpg', productUrl: '#' },
    { id: 'p10', name: 'Kệ Đựng Hồ Sơ Nhựa W10Cm - Xám Trắng', price: 146000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550002186579_org.jpg', productUrl: '#' },
    { id: 'p11', name: 'Bông Tẩy Trang Ecru', price: 58000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/l/i/lizi2026.png', productUrl: '#' },
    { id: 'p12', name: 'Túi My Bag A4 Vải Sợi Đay', price: 68000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550002794118_org_1.jpg', productUrl: '#' }
];

const BestSellers: Product[] = [
    { id: 'p13', name: 'Ruột Bút Mực Gel 0.5mm - Xanh Dương MUJI', price: 19000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550002814458_org.jpg', productUrl: '#' },
    { id: 'p14', name: 'Bút Bi Bấm 0.5mm - Xanh Đen MUJI', price: 25000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550002794200_org.jpg', productUrl: '#' },
    { id: 'p15', name: 'Túi My Bag A4 (Phở) / Green Màu Xanh Lá', price: 78000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/8/9/8936215241308_1.jpg', productUrl: '#' },
    { id: 'p16', name: 'MUJI Gối Ôm Polyester Tái Chế (Không Kèm Vỏ Gối)', price: 294000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550583715533_adjust.png', productUrl: '#' },
    { id: 'p17', name: 'Bút Bi Bấm 0.5mm - Đỏ MUJI', price: 25000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550002794149_org.jpg', productUrl: '#' },
    { id: 'p18', name: 'Ruột Bút Mực Gel 0.5mm - Đen MUJI', price: 19000, imageUrl: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4550002814434_org.jpg', productUrl: '#' }
];

const HomePage: React.FC = () => {
    return (
        <>
            <Header />

            <main>
                <div className="home-page">
                    <BannerSlider />
                    <ProductSection products={NewArrivals} title='Sản Phẩm Mới Về' />
                    <ProductSection products={FeaturedProducts} title='Sản Phẩm Nổi Bật' />
                    <ProductSection products={BestSellers} title='Sản Phẩm Bán Chạy' />
                </div>
            </main>

            <Footer />
        </>
    );
};

export default HomePage;