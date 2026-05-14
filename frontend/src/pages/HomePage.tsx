import React, { useCallback, useEffect, useState } from 'react';
import Header from '../components/common/Header';
import BannerSlider from '../components/homepage/BannerSlider';
import Footer from '../components/common/Footer';
import './HomePage.css';
import ProductSection from '../components/common/products/ProductSection';
import { fetchStoreSettings, STORE_SETTINGS_UPDATED_EVENT } from '../lib/storeSettings';
import axios from 'axios';
import { API_BASE } from '../lib/apiConfig';

const HomePage: React.FC = () => {
    const [productsPerRow, setProductsPerRow] = useState<number | undefined>(undefined);
    const [newestIds, setNewestIds] = useState<number[]>([]);
    const [featuredIds, setFeaturedIds] = useState<number[]>([]);
    const [bestSellerIds, setBestSellerIds] = useState<number[]>([]);

    const loadLayout = useCallback(() => {
        fetchStoreSettings()
            .then((s) => setProductsPerRow(s.products_per_row))
            .catch(() => undefined);
    }, []);

    const fetchProductLists = useCallback(async () => {
        try {
            // Lấy 18 sản phẩm cho mỗi danh sách
            const [newestRes, featuredRes, bestSellerRes] = await Promise.all([
                axios.get(`${API_BASE}/products?sort=newest&limit=18`),
                axios.get(`${API_BASE}/products/featured?limit=18`),
                axios.get(`${API_BASE}/products/bestsellers?limit=18`)
            ]);

            setNewestIds(newestRes.data.data.map((p: any) => p.id));
            setFeaturedIds(featuredRes.data.data.map((p: any) => p.id));
            setBestSellerIds(bestSellerRes.data.data.map((p: any) => p.id));
        } catch (error) {
            console.error('Lỗi khi tải danh sách sản phẩm trang chủ:', error);
        }
    }, []);

    useEffect(() => {
        loadLayout();
        fetchProductLists();
        const onSettingsChange = () => loadLayout();
        window.addEventListener(STORE_SETTINGS_UPDATED_EVENT, onSettingsChange);
        return () => window.removeEventListener(STORE_SETTINGS_UPDATED_EVENT, onSettingsChange);
    }, [loadLayout, fetchProductLists]);

    return (
        <>
            <Header />

            <main>
                <div className="home-page">
                    <BannerSlider />
                    
                    {newestIds.length > 0 && (
                        <ProductSection
                            title="Sản Phẩm Mới Về"
                            productsId={newestIds}
                            productsPerRow={productsPerRow}
                        />
                    )}

                    {featuredIds.length > 0 && (
                        <ProductSection
                            title="Sản Phẩm Nổi Bật"
                            productsId={featuredIds}
                            productsPerRow={productsPerRow}
                        />
                    )}

                    {bestSellerIds.length > 0 && (
                        <ProductSection
                            title="Sản Phẩm Bán Chạy"
                            productsId={bestSellerIds}
                            productsPerRow={productsPerRow}
                        />
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
};

export default HomePage;