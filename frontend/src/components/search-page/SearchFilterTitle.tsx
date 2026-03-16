import React from 'react';
import './SearchFilterTitle.css';

interface Props {
    title?: string;
    totalItems?: number;
}

const CategoryFilterTitle: React.FC<Props> = ({ title, totalItems }) => {
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