import React from 'react';
import CategoryFilterTitle from './CategoryFilterTitle';
import CategoryPageContainer from './CategoryPageContainer';
import './CategoryContainer.css';

const CategoryContainer: React.FC = () => {
    return (
        <div className="main-page-wrapper">
            {/* Cấp 1: Tiêu đề trang và số lượng mặt hàng */}
            <CategoryFilterTitle />

            {/* Cấp 2: Khu vực chứa Sidebar Lọc và Main Content */}
            <CategoryPageContainer />
        </div>
    );
};

export default CategoryContainer;