import React from 'react';
import type { PaginationMeta } from '../../types';
import CategoryFilterTitle from './SearchFilterTitle';
import CategoryPageContainer from './SearchPageContainer';
import Sort from '../common/sorter/Sort';
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
    productsPerRow?: number;
}

const SearchContainer: React.FC<Props> = ({
    title,
    totalItems,
    productIds,
    paginationMeta,
    onPageChange,
    selectedCategoryIds,
    onCategoryToggle,
    searchQuery,
    minPrice,
    maxPrice,
    onFilterPrice,
    productsPerRow
}) => {
    return (
        <div className="main-page-wrapper">
            {/* Cấp 1: Tiêu đề trang và Sắp xếp nằm cùng hàng */}
            <div className="search-header-flex">
                <CategoryFilterTitle title={title} totalItems={totalItems} />
                <Sort />
            </div>

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
                productsPerRow={productsPerRow}
            />
        </div>
    );
};

export default SearchContainer;