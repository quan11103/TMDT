import React from 'react';
import FilterCategory from './FilterCategory';
import FilterPrice from './FilterPrice';
import './FilterContent.css';

interface Props {
    currentCategoryId?: number;
    selectedCategoryIds: number[];
    onCategoryToggle: (id: number) => void;
    searchQuery?: string;
    minPrice: number;
    maxPrice: number;
    onFilterPrice: (min: number, max: number) => void;
}

const FilterContent: React.FC<Props> = ({ currentCategoryId, selectedCategoryIds, onCategoryToggle, searchQuery, minPrice, maxPrice, onFilterPrice }) => {
    return (
        <aside className="filter-sidebar">
            <div className="filter-wrapper">
                {/* Bộ lọc Danh mục */}
                <div className="filter-section">
                    <FilterCategory
                        currentCategoryId={currentCategoryId}
                        selectedCategoryIds={selectedCategoryIds}
                        onCategoryToggle={onCategoryToggle}
                        searchQuery={searchQuery}
                    />
                </div>

                {/* Bộ lọc Giá */}
                <div className="filter-section">
                    <FilterPrice
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        onFilterPrice={onFilterPrice}
                    />
                </div>
            </div>
        </aside>
    );
};

export default FilterContent;