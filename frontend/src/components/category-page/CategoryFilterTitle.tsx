import React from 'react';
import './CategoryFilterTitle.css';

interface CategoryFilterTitleProps {
    title?: string;
    totalItems?: number;
}

const CategoryFilterTitle: React.FC<CategoryFilterTitleProps> = ({
    title = "Văn Phòng Phẩm",
    totalItems = 633
}) => {
    return (
        <div className="category-header-title">
            <h1 className="page-main-title">
                {title}
                <span className="total-count">
                    {totalItems} mặt hàng
                </span>
            </h1>
        </div>
    );
};

export default CategoryFilterTitle;