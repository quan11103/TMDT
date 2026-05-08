import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FilterCategory.css';
import { API_BASE } from '../../../lib/apiConfig';

interface Category {
    id: number;
    name: string;
    other_categories?: Category[];
    _count?: { products: number };
}

interface Props {
    currentCategoryId?: number;
    selectedCategoryIds: number[];
    onCategoryToggle: (id: number) => void;
    searchQuery?: string;
}

// HÀM TIỆN ÍCH: Tính tổng số sản phẩm của một danh mục (bao gồm cả con của nó)
const calculateTotalProducts = (category: Category): number => {
    // Số sản phẩm gán trực tiếp cho danh mục này
    let total = category._count?.products || 0;

    // Cộng thêm số sản phẩm của tất cả danh mục con (nếu có)
    if (category.other_categories && category.other_categories.length > 0) {
        total += category.other_categories.reduce((sum, subCat) => {
            return sum + (subCat._count?.products || 0);
        }, 0);
    }

    return total;
};

const FilterCategory: React.FC<Props> = ({ currentCategoryId, selectedCategoryIds, onCategoryToggle, searchQuery }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            console.log(">>> FilterCategory gọi API với searchQuery:", searchQuery);
            try {
                const params = { search: searchQuery };

                if (currentCategoryId) {
                    // Trang Category: Lấy danh mục con của danh mục hiện tại
                    const res = await axios.get(`${API_BASE}/categories/${currentCategoryId}`, { params });
                    setCategories(res.data.other_categories || []);
                } else {
                    // Trang Search: Lấy tất cả danh mục gốc
                    const res = await axios.get(`${API_BASE}/categories`, { params });
                    setCategories(res.data);
                }
            } catch (err) {
                console.error("Lỗi lấy danh mục:", err);
            }
        };

        fetchCategories();
    }, [currentCategoryId, searchQuery]);

    return (
        <div className="filter-container">
            <button className={`filter-header ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                <span>Danh Mục</span>
                <svg className="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"></path>
                </svg>
            </button>

            <div className={`filter-content ${isOpen ? 'show' : ''}`}>
                <ul className="category-list">
                    {categories.map((cat) => {
                        // Gọi hàm để tính tổng số sản phẩm cho danh mục cha này
                        const totalProductsForCat = calculateTotalProducts(cat);

                        return (
                            <li key={cat.id} className="category-group">
                                <label className="category-item">
                                    <input
                                        type="checkbox"
                                        className="custom-checkbox"
                                        checked={selectedCategoryIds.includes(cat.id)}
                                        onChange={() => onCategoryToggle(cat.id)}
                                    />
                                    <span className="category-name">{cat.name}</span>
                                    {/* Hiển thị tổng số đã tính */}
                                    <span className="category-count">({totalProductsForCat})</span>
                                </label>

                                {cat.other_categories && cat.other_categories.length > 0 && (
                                    <ul className="sub-category-list">
                                        {cat.other_categories.map((sub) => (
                                            <li key={sub.id}>
                                                <label className="category-item sub-item">
                                                    <input
                                                        type="checkbox"
                                                        className="custom-checkbox"
                                                        checked={selectedCategoryIds.includes(sub.id)}
                                                        onChange={() => onCategoryToggle(sub.id)}
                                                    />
                                                    <span className="category-name">{sub.name}</span>
                                                    {/* Danh mục con thì cứ hiển thị số trực tiếp của nó */}
                                                    {sub._count && (
                                                        <span className="category-count">({sub._count.products || 0})</span>
                                                    )}
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default FilterCategory;