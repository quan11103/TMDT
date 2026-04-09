import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import type { CategoryData, PaginationMeta } from '../types';
import { fetchStoreSettings, STORE_SETTINGS_UPDATED_EVENT } from '../lib/storeSettings';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Breadcrumb from '../components/common/Breadcrumb';
import CategoryContainer from '../components/category-page/CategoryContainer';

const CategoryPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();

    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(1000000);

    const [category, setCategory] = useState<CategoryData | null>(null);
    const [productIds, setProductIds] = useState<number[]>([]);
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>();
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [productsPerPage, setProductsPerPage] = useState(12);
    const [productsPerRow, setProductsPerRow] = useState(4);

    const applyStoreSettings = useCallback((s: { products_per_page: number; products_per_row: number }) => {
        setProductsPerPage(s.products_per_page);
        setProductsPerRow(s.products_per_row);
    }, []);

    useEffect(() => {
        fetchStoreSettings().then(applyStoreSettings).catch(() => undefined);
        const onUpdated = (ev: Event) => {
            const d = (ev as CustomEvent<{ products_per_page?: number; products_per_row?: number }>).detail;
            if (d?.products_per_page != null && d?.products_per_row != null) {
                applyStoreSettings({
                    products_per_page: d.products_per_page,
                    products_per_row: d.products_per_row,
                });
            }
        };
        window.addEventListener(STORE_SETTINGS_UPDATED_EVENT, onUpdated);
        return () => window.removeEventListener(STORE_SETTINGS_UPDATED_EVENT, onUpdated);
    }, [applyStoreSettings]);

    const fetchData = useCallback(async (page: number = 1, min: number = minPrice, max: number = maxPrice, selectedIds: number[] = selectedCategoryIds) => {
        try {
            // Lấy id để gửi lên API: Nếu có tick chọn thì gửi chuỗi "1,2", nếu ko thì gửi categoryId trên URL
            const queryCategoryId = selectedIds.length > 0 ? selectedIds.join(',') : categoryId;

            const [categoryRes, productsRes] = await Promise.all([
                axios.get(`http://localhost:3000/api/categories/${categoryId}`),
                axios.get(`http://localhost:3000/api/products`, {
                    params: {
                        category_id: queryCategoryId,
                        min_price: min,
                        max_price: max,
                        limit: productsPerPage,
                        page: page
                    }
                })
            ]);

            setCategory(categoryRes.data);
            setProductIds(productsRes.data.data.map((p: any) => p.id));
            setPaginationMeta(productsRes.data.meta);
            setError(null);
        } catch (err) {
            console.error("Lỗi khi lấy dữ liệu:", err);
            setError("Không thể tải dữ liệu.");
        }
    }, [categoryId, minPrice, maxPrice, selectedCategoryIds, productsPerPage]);

    // Gọi API khi có thay đổi
    useEffect(() => {
        if (categoryId) {
            fetchData(1, minPrice, maxPrice, selectedCategoryIds);
        }
    }, [categoryId, selectedCategoryIds, productsPerPage, fetchData, minPrice, maxPrice]);

    // THÊM: Hàm xử lý khi tick/bỏ tick 1 category
    const handleCategoryToggle = (id: number) => {
        setSelectedCategoryIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter(catId => catId !== id); // Xóa khỏi danh sách nếu bỏ tick
            } else {
                return [...prev, id]; // Thêm vào danh sách nếu được tick
            }
        });
    };

    const handleFilterPrice = (min: number, max: number) => {
        setMinPrice(min);
        setMaxPrice(max);
        fetchData(1, min, max, selectedCategoryIds);
    };

    if (error) return <div className="error-message">{error}</div>;

    return (
        <>
            <Header />
            <div className="category-page">
                <Breadcrumb category={category} />
                <CategoryContainer
                    title={category?.name}
                    totalItems={paginationMeta?.total || 0}
                    productIds={productIds}
                    paginationMeta={paginationMeta}
                    onPageChange={(newPage) => fetchData(newPage, minPrice, maxPrice, selectedCategoryIds)}
                    currentCategoryId={category?.id}
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

export default CategoryPage;