import React from 'react';
import FilterHeader from '../common/filters/FilterHeader';
import FilterContent from '../common/filters/FilterContent';
import './SearchSidebar.css';

interface Props {
    selectedCategoryIds: number[];
    onCategoryToggle: (id: number) => void;
    searchQuery?: string;
    minPrice: number;
    maxPrice: number;
    onFilterPrice: (min: number, max: number) => void;
}

const CategorySidebar: React.FC<Props> = ({ selectedCategoryIds, onCategoryToggle, searchQuery, minPrice, maxPrice, onFilterPrice }) => {
    return (
        <div className="category-sidebar">
            {/* Header chứa tiêu đề "Bộ lọc" và nút đóng */}
            <FilterHeader />

            {/* Nội dung chứa các nhóm lọc (Danh mục, Giá, Size) */}
            <FilterContent
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

export default CategorySidebar;