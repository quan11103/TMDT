import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import CategoryContainer from '../components/category-page/CategoryContainer';
import { API_BASE } from '../lib/apiConfig';
import { fetchStoreSettings, STORE_SETTINGS_UPDATED_EVENT } from '../lib/storeSettings';

const BestSellerPage: React.FC = () => {
    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(1000000);

    const [productIds, setProductIds] = useState<number[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Theo yêu cầu: 18 sản phẩm
    const productsPerPage = 18;
    const [productsPerRow, setProductsPerRow] = useState(4);

    const applyStoreSettings = useCallback((s: { products_per_row: number }) => {
        setProductsPerRow(s.products_per_row);
    }, []);

    useEffect(() => {
        fetchStoreSettings().then(applyStoreSettings).catch(() => undefined);
        const onUpdated = (ev: Event) => {
            const d = (ev as CustomEvent<{ products_per_row?: number }>).detail;
            if (d?.products_per_row != null) {
                applyStoreSettings({
                    products_per_row: d.products_per_row,
                });
            }
        };
        window.addEventListener(STORE_SETTINGS_UPDATED_EVENT, onUpdated);
        return () => window.removeEventListener(STORE_SETTINGS_UPDATED_EVENT, onUpdated);
    }, [applyStoreSettings]);

    const fetchData = useCallback(async (min: number = minPrice, max: number = maxPrice, selectedIds: number[] = selectedCategoryIds) => {
        try {
            const productsRes = await axios.get(`${API_BASE}/products/bestsellers`, {
                params: {
                    limit: productsPerPage,
                }
            });

            let filteredProducts = productsRes.data.data;

            // Lọc sản phẩm ở client-side vì API bestsellers không hỗ trợ filter
            if (selectedIds.length > 0) {
                filteredProducts = filteredProducts.filter((p: any) => 
                    p.categories && selectedIds.includes(p.categories.id)
                );
            }

            if (min !== undefined) {
                filteredProducts = filteredProducts.filter((p: any) => Number(p.price) >= min);
            }

            if (max !== undefined) {
                filteredProducts = filteredProducts.filter((p: any) => Number(p.price) <= max);
            }

            setProductIds(filteredProducts.map((p: any) => p.id));
            // Không set paginationMeta để ẩn phân trang
            setError(null);
        } catch (err) {
            console.error("Lỗi khi lấy dữ liệu:", err);
            setError("Không thể tải dữ liệu.");
        }
    }, [minPrice, maxPrice, selectedCategoryIds]);

    useEffect(() => {
        fetchData(minPrice, maxPrice, selectedCategoryIds);
    }, [selectedCategoryIds, fetchData, minPrice, maxPrice]);

    const handleCategoryToggle = (id: number) => {
        setSelectedCategoryIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter(catId => catId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleFilterPrice = (min: number, max: number) => {
        setMinPrice(min);
        setMaxPrice(max);
        fetchData(min, max, selectedCategoryIds);
    };

    if (error) return <div className="error-message">{error}</div>;

    return (
        <>
            <Header />
            <div className="category-page">
                {/* Breadcrumb đơn giản cho trang Bán chạy */}
                <div style={{ padding: '16px 20px', fontSize: '14px', color: '#555' }} className="container">
                    <span>Trang chủ</span> <span style={{ margin: '0 8px' }}>/</span> <span>Bán chạy</span>
                </div>
                <CategoryContainer
                    title="Bán Chạy"
                    totalItems={productIds.length}
                    productIds={productIds}
                    currentCategoryId={undefined}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onFilterPrice={handleFilterPrice}
                    selectedCategoryIds={selectedCategoryIds}
                    onCategoryToggle={handleCategoryToggle}
                    productsPerRow={productsPerRow}
                />
            </div>
            <Footer />
        </>
    );
};

export default BestSellerPage;
