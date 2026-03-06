import React from 'react';
import FilterHeader from './FilterHeader';
import FilterContent from './FilterContent';
import './CategorySidebar.css';

const CategorySidebar: React.FC = () => {
    return (
        <div className="category-sidebar">
            {/* Header chứa tiêu đề "Bộ lọc" và nút đóng */}
            <FilterHeader />

            {/* Nội dung chứa các nhóm lọc (Danh mục, Giá, Size) */}
            <FilterContent />
        </div>
    );
};

export default CategorySidebar;