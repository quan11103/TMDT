import React, { useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './FilterSidebar.css';

const FilterSidebar: React.FC = () => {
    const [priceRange, setPriceRange] = useState<[number, number]>([50, 200]);

    const categories = ['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans'];
    const colors = ['#00C129', '#F50606', '#F5DD06', '#F57906', '#06CAF5', '#0000FF', '#DB00FF', '#FF006B', '#FFFFFF', '#000000'];
    const sizes = ['XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large'];
    const styles = ['Casual', 'Formal', 'Party', 'Gym'];

    const [openSections, setOpenSections] = useState({
        price: false,
        colors: false,
        size: false,
        style: false
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleRender = (node: any, props: any) => {
        return (
            <div {...node.props} style={{ ...node.props.style }}>
                {/* Đây là nhãn giá sẽ di chuyển theo nút */}
                <span className="dynamic-price-label">
                    ${props.value}
                </span>
            </div>
        );
    };

    const [selectedColor, setSelectedColor] = useState<string>('#0000FF');
    const [selectedSize, setSelectedSize] = useState<string>('Large');

    return (
        <aside className="filter-sidebar">
            <div className="sidebar-header">
                <h3>Filters</h3>
                <button className="btn-icon"><img src="/icons/filter.svg" alt="filter" /></button>
            </div>

            <hr />

            {/* List Categories */}
            <ul className="filter-list">
                {categories.map(item => (
                    <li key={item}>{item} <span><img src="/icons/arrow-right.svg" alt="toggle" /></span></li>
                ))}
            </ul>

            <hr />

            {/* Price Filter */}
            <div className={`filter-section ${openSections.price ? 'is-open' : ''}`}>
                <div className="category-section-title" onClick={() => toggleSection('price')}>
                    <h4>Price</h4>
                    <span className="toggle-icon">
                        <img src="/icons/arrow-up.svg" alt="toggle" />
                    </span>
                </div>

                <div className="filter-content-wrapper">
                    <div className="price-slider-wrapper">
                        <Slider
                            range
                            min={0}
                            max={500}
                            defaultValue={[0, 500]}
                            onChange={(value) => setPriceRange(value as [number, number])}
                            allowCross={false}
                            className="custom-range-slider"
                            handleRender={handleRender}
                        />
                    </div>
                </div>
            </div>

            <hr />

            {/* Color Filter */}
            <div className={`filter-section ${openSections.colors ? 'is-open' : ''}`}>
                <div className="category-section-title" onClick={() => toggleSection('colors')}>
                    <h4>Colors</h4>
                    <span className="toggle-icon">
                        <img src="/icons/arrow-up.svg" alt="toggle" />
                    </span>
                </div>
                <div className="filter-content-wrapper">
                    <div className="color-grid">
                        {colors.map(color => (
                            <div
                                key={color}
                                // So sánh với state selectedColor thay vì mã màu cố định
                                className={`color-circle ${color === selectedColor ? 'active' : ''}`}
                                style={{
                                    backgroundColor: color,
                                    border: color === '#FFFFFF' ? '1px solid #ddd' : 'none'
                                }}
                                // Cập nhật màu khi click
                                onClick={() => setSelectedColor(color)}
                            >
                                {/* Chỉ hiện 1 dấu tick duy nhất khi màu đó được chọn */}
                                {color === selectedColor && <span className="tick">✓</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <hr />

            {/* Size Filter */}
            <div className={`filter-section ${openSections.size ? 'is-open' : ''}`}>
                <div className="category-section-title" onClick={() => toggleSection('size')}>
                    <h4>Size</h4>
                    <span className="toggle-icon">
                        <img src="/icons/arrow-up.svg" alt="toggle" />
                    </span>
                </div>
                <div className="filter-content-wrapper">
                    <div className="size-flex">
                        {sizes.map(size => (
                            <button
                                key={size}
                                // Kiểm tra xem size này có đang được chọn hay không
                                className={size === selectedSize ? 'active' : ''}
                                // Cập nhật state khi người dùng click
                                onClick={() => setSelectedSize(size)}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <hr />

            {/* Dress Style */}
            <div className={`filter-section ${openSections.style ? 'is-open' : ''}`}>
                <div className="category-section-title" onClick={() => toggleSection('style')}>
                    <h4>Dress Style</h4>
                    <span className="toggle-icon">
                        <img src="/icons/arrow-up.svg" alt="toggle" />
                    </span>
                </div>
                <div className="filter-content-wrapper">
                    <ul className="filter-list">
                        {styles.map(style => (
                            <li key={style}>{style} <span><img src="/icons/arrow-right.svg" alt="toggle" /></span></li>
                        ))}
                    </ul>
                </div>
            </div>

            <button className="btn-apply" onClick={() => console.log("Lọc theo giá:", priceRange)}>
                Apply Filter
            </button>
        </aside>
    );
};

export default FilterSidebar;