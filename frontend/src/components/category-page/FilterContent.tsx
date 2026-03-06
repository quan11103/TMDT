import React from 'react';
import FilterCategory from './FilterCategory';
import FilterPrice from './FilterPrice';
import FilterSize from './FilterSize';
import './FilterContent.css';

const FilterContent: React.FC = () => {
    return (
        <aside className="filter-sidebar">
            <div className="filter-wrapper">
                {/* Bộ lọc Danh mục */}
                <div className="filter-section">
                    <FilterCategory />
                </div>

                {/* Bộ lọc Giá */}
                <div className="filter-section">
                    <FilterPrice />
                </div>

                {/* Bộ lọc Phân loại (Size) */}
                <div className="filter-section">
                    <FilterSize />
                </div>
            </div>
        </aside>
    );
};

export default FilterContent;