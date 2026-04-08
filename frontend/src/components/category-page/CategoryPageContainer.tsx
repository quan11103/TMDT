import React from 'react';
import type { PaginationMeta } from '../../types';
import CategorySidebar from './CategorySidebar';
import CategoryMain from './CategoryMain';
import './CategoryPageContainer.css';

interface Props {
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

const CategoryPageContainer: React.FC<Props> = ({ productIds, paginationMeta, onPageChange, currentCategoryId, selectedCategoryIds, onCategoryToggle, minPrice, maxPrice, onFilterPrice, productsPerRow }) => {
    return (
        <div className="category-page-container">
            {/* CỘT 1: SIDEBAR (Bên trái) */}
            <aside className="page-sidebar">
                <CategorySidebar
                    currentCategoryId={currentCategoryId}
                    selectedCategoryIds={selectedCategoryIds}
                    onCategoryToggle={onCategoryToggle}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onFilterPrice={onFilterPrice}
                />
            </aside>

            {/* CỘT 2: MAIN CONTENT (Bên phải) */}
            <main className="page-main">
                <CategoryMain
                    productIds={productIds}
                    paginationMeta={paginationMeta}
                    onPageChange={onPageChange}
                    productsPerRow={productsPerRow}
                />
            </main>
        </div>
    );
};

export default CategoryPageContainer;