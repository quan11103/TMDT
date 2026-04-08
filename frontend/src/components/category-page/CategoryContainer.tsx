import React from 'react';
import type { PaginationMeta } from '../../types';
import CategoryFilterTitle from './CategoryFilterTitle';
import CategoryPageContainer from './CategoryPageContainer';
import './CategoryContainer.css';

interface Props {
    title?: string;
    totalItems?: number;
    productIds?: number[];
    paginationMeta?: PaginationMeta;
    onPageChange?: (page: number) => void;
    currentCategoryId?: number;
    selectedCategoryIds: number[];
    onCategoryToggle: (id: number) => void;
    minPrice: number;
    maxPrice: number;
    onFilterPrice: (min: number, max: number) => void;
    productsPerRow?: number;
}

const CategoryContainer: React.FC<Props> = ({ title, totalItems, productIds, paginationMeta, onPageChange, currentCategoryId, selectedCategoryIds, onCategoryToggle, minPrice, maxPrice, onFilterPrice, productsPerRow }) => {
    return (
        <div className="main-page-wrapper">
            {/* Cấp 1: Tiêu đề trang và số lượng mặt hàng */}
            <CategoryFilterTitle title={title} totalItems={totalItems} />

            {/* Cấp 2: Khu vực chứa Sidebar Lọc và Main Content */}
            <CategoryPageContainer
                productIds={productIds}
                paginationMeta={paginationMeta}
                onPageChange={onPageChange}
                currentCategoryId={currentCategoryId}
                selectedCategoryIds={selectedCategoryIds}
                onCategoryToggle={onCategoryToggle}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onFilterPrice={onFilterPrice}
                productsPerRow={productsPerRow}
            />
        </div>
    );
};

export default CategoryContainer;