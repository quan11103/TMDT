import React from 'react';
import type { PaginationMeta } from '../../types';
import CategorySidebar from './SearchSidebar';
import CategoryMain from './SearchMain';
import './SearchPageContainer.css';

interface Props {
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
    sort?: string;
    onSortChange?: (nextSort: string) => void;
}

const CategoryPageContainer: React.FC<Props> = ({ productIds, paginationMeta, onPageChange, selectedCategoryIds, onCategoryToggle, searchQuery, minPrice, maxPrice, onFilterPrice, productsPerRow, sort, onSortChange }) => {
    return (
        <div className="category-page-container">
            {/* CỘT 1: SIDEBAR (Bên trái) */}
            <aside className="page-sidebar">
                <CategorySidebar
                    selectedCategoryIds={selectedCategoryIds}
                    onCategoryToggle={onCategoryToggle}
                    searchQuery={searchQuery}
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
                    sort={sort}
                    onSortChange={onSortChange}
                />
            </main>
        </div>
    );
};

export default CategoryPageContainer;