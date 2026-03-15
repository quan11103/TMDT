import React from 'react';
import type { PaginationMeta } from '../../types';
import CategoryFilterTitle from './SearchFilterTitle';
import CategoryPageContainer from './SearchPageContainer';
import './SearchContainer.css';

interface Props {
    title?: string;
    totalItems?: number;
    productIds?: number[];
    paginationMeta?: PaginationMeta;
    onPageChange?: (page: number) => void;
    selectedCategoryIds: number[];
    onCategoryToggle: (id: number) => void;
    searchQuery?: string;
    minPrice: number;
    maxPrice: number;
    onFilterPrice: (min: number, max: number) => void;
}

const SearchContainer: React.FC<Props> = ({ title, totalItems, productIds, paginationMeta, onPageChange, selectedCategoryIds, onCategoryToggle, searchQuery, minPrice, maxPrice, onFilterPrice }) => {
    return (
        <div className="main-page-wrapper">
            {/* Cấp 1: Tiêu đề trang và số lượng mặt hàng */}
            <CategoryFilterTitle title={title} totalItems={totalItems} />

            {/* Cấp 2: Khu vực chứa Sidebar Lọc và Main Content */}
            <CategoryPageContainer
                productIds={productIds}
                paginationMeta={paginationMeta}
                onPageChange={onPageChange}
                selectedCategoryIds={selectedCategoryIds}
                onCategoryToggle={onCategoryToggle}
                searchQuery={searchQuery}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onFilterPrice={onFilterPrice}
            />
        </div>
    );
};

export default SearchContainer;