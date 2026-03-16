import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom'; // Dùng để lấy ?q=...
import axios from 'axios';
import type { PaginationMeta } from '../types';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import SearchContainer from '../components/search-page/SearchContainer';

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || ''; // Lấy từ khóa từ URL

    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(1000000);
    const [productIds, setProductIds] = useState<number[]>([]);
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>();
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (
        page: number = 1,
        min: number = minPrice,
        max: number = maxPrice,
        selectedIds: number[] = selectedCategoryIds
    ) => {
        // Vẫn cho phép fetch nếu query rỗng nhưng có chọn category
        if (!query && selectedIds.length === 0) return;

        try {
            const productsRes = await axios.get(`http://localhost:3000/api/products`, {
                params: {
                    search: query,
                    // CHỈNH SỬA: Gửi chuỗi ID phân cách bằng dấu phẩy
                    category_id: selectedIds.length > 0 ? selectedIds.join(',') : undefined,
                    min_price: min,
                    max_price: max,
                    limit: 15,
                    page: page
                }
            });

            setProductIds(productsRes.data.data.map((p: any) => p.id));
            setPaginationMeta(productsRes.data.meta);
            setError(null);
        } catch (err) {
            console.error("Lỗi khi tìm kiếm:", err);
            setError("Không thể tải kết quả tìm kiếm.");
        }
    }, [query, minPrice, maxPrice, selectedCategoryIds]);

    useEffect(() => {
        fetchData(1, minPrice, maxPrice, selectedCategoryIds);
    }, [query, selectedCategoryIds]); // Khi đổi từ khóa hoặc tick chọn category đều gọi lại API

    const handleCategoryToggle = (id: number) => {
        setSelectedCategoryIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter(catId => catId !== id); // Xóa khỏi danh sách nếu bỏ tick
            } else {
                return [...prev, id]; // Thêm vào danh sách nếu được tick
            }
        });
    };

    const handlePageChange = (newPage: number) => {
        fetchData(newPage, minPrice, maxPrice, selectedCategoryIds);
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
            <div className="search-page-wrapper">
                <SearchContainer
                    title={`Kết quả tìm kiếm cho từ khóa "${query}"`}
                    totalItems={paginationMeta?.total || 0}
                    productIds={productIds}
                    paginationMeta={paginationMeta}
                    onPageChange={handlePageChange}
                    selectedCategoryIds={selectedCategoryIds}
                    onCategoryToggle={handleCategoryToggle}
                    searchQuery={query}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onFilterPrice={handleFilterPrice}
                />
            </div>
            <Footer />
        </>
    );
};

export default SearchPage;