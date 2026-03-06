import React, { useState } from 'react';
import './FilterCategory.css';

interface Category {
    id: string;
    name: string;
    count: number;
    subCategories?: Category[];
}

const FilterCategory: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);

    // Dữ liệu mẫu dựa trên hình ảnh của bạn
    const categories: Category[] = [
        { id: '1', name: 'Sổ Ghi Chú', count: 133 },
        {
            id: '2', name: 'Bút', count: 164,
            subCategories: [
                { id: '2-1', name: '506:NOTEBOOKS', count: 3 },
                { id: '2-2', name: '523:OFFICE ACCESSORIES', count: 1 },
            ]
        },
        { id: '3', name: 'Dụng Cụ Đựng Tài Liệu', count: 28 },
        {
            id: '4', name: 'Dụng Cụ Văn Phòng', count: 221,
            subCategories: [
                { id: '4-1', name: '065:OFFICE ITEMS', count: 4 },
                { id: '4-2', name: '513:MECHANICAL PENCILS', count: 2 },
            ]
        },
    ];

    return (
        <div className="filter-container">
            {/* Header của Accordion */}
            <button
                className={`filter-header ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>Danh Mục</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24" height="24"
                    viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    className="chevron-icon"
                >
                    <path d="m6 9 6 6 6-6"></path>
                </svg>
            </button>

            {/* Nội dung danh sách (Content) */}
            <div className={`filter-content ${isOpen ? 'show' : ''}`}>
                <ul className="category-list">
                    {categories.map((cat) => (
                        <li key={cat.id} className="category-group">
                            <label className="category-item">
                                <input type="checkbox" className="custom-checkbox" />
                                <span className="category-name">{cat.name}</span>
                                <span className="category-count">({cat.count})</span>
                            </label>

                            {/* Render sub-categories nếu có */}
                            {cat.subCategories && (
                                <ul className="sub-category-list">
                                    {cat.subCategories.map((sub) => (
                                        <li key={sub.id}>
                                            <label className="category-item sub-item">
                                                <input type="checkbox" className="custom-checkbox" />
                                                <span className="category-name">{sub.name}</span>
                                                <span className="category-count">({sub.count})</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FilterCategory;