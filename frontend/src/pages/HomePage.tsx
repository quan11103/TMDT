import React, { useCallback, useEffect, useState } from 'react';
import Header from '../components/common/Header';
import BannerSlider from '../components/homepage/BannerSlider';
import Footer from '../components/common/Footer';
import './HomePage.css';
import ProductSection from '../components/common/products/ProductSection';
import { fetchStoreSettings, STORE_SETTINGS_UPDATED_EVENT } from '../lib/storeSettings';

const HomePage: React.FC = () => {
    const [productsPerRow, setProductsPerRow] = useState<number | undefined>(undefined);

    const loadLayout = useCallback(() => {
        fetchStoreSettings()
            .then((s) => setProductsPerRow(s.products_per_row))
            .catch(() => undefined);
    }, []);

    useEffect(() => {
        loadLayout();
        const onSettingsChange = () => loadLayout();
        window.addEventListener(STORE_SETTINGS_UPDATED_EVENT, onSettingsChange);
        return () => window.removeEventListener(STORE_SETTINGS_UPDATED_EVENT, onSettingsChange);
    }, [loadLayout]);

    return (
        <>
            <Header />

            <main>
                <div className="home-page">
                    <BannerSlider />
                    <ProductSection
                        title="Sản Phẩm Mới Về"
                        productsId={[1, 2, 3, 4, 5, 6]}
                        productsPerRow={productsPerRow}
                    />
                    <ProductSection
                        title="Sản Phẩm Nổi Bật"
                        productsId={[7, 19, 9, 10, 11, 12]}
                        productsPerRow={productsPerRow}
                    />
                    <ProductSection
                        title="Sản Phẩm Bán Chạy"
                        productsId={[13, 14, 15, 16, 17, 18]}
                        productsPerRow={productsPerRow}
                    />
                </div>
            </main>

            <Footer />
        </>
    );
};

export default HomePage;