import { useState } from 'react';
import './ProductInfo.css';
import StarRating from '../common/StarRating';

const ProductInfo = () => {
    const [selectedColor, setSelectedColor] = useState('olive');
    const [selectedSize, setSelectedSize] = useState('Large');
    const [quantity, setQuantity] = useState<number | ''>(1);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Cho phép để trống (khi đang xóa) hoặc nhập số
        if (val === '') {
            setQuantity('');
        } else {
            const num = parseInt(val);
            if (!isNaN(num) && num > 0) {
                setQuantity(num);
            }
        }
    };

    const handleBlur = () => {
        if (quantity === '' || quantity === 0) {
            setQuantity(1);
        }
    };

    return (
        <div className="product-info">
            <h1>ONE LIFE GRAPHIC T-SHIRT</h1>
            <StarRating rating={4.5}></StarRating>
            <div className="price-row">
                <span className="current-price">$260</span>
                <span className="old-price">$300</span>
                <span className="discount-tag">-40%</span>
            </div>
            <p className="desc">This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric...</p>
            <div className="selector-group">
                <label>Select Colors</label>
                <div className="colors">
                    {['#4F4631', '#314F4A', '#31344F'].map(color => (
                        <div
                            key={color}
                            className={`product-color-circle ${selectedColor === color ? 'active' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setSelectedColor(color)}
                        />
                    ))}
                </div>
            </div>
            <div className="selector-group">
                <label>Choose Size</label>
                <div className="sizes">
                    {['Small', 'Medium', 'Large', 'X-Large'].map(size => (
                        <button
                            key={size}
                            className={selectedSize === size ? 'active' : ''}
                            onClick={() => setSelectedSize(size)}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>
            <div className="action-row">
                <div className="qty-box">
                    <button onClick={() => setQuantity((prev) => (prev === '' ? 1 : Math.max(1, prev - 1)))}>
                        −
                    </button>
                    <input
                        type="number"
                        className="qty-input"
                        value={quantity}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                    />
                    <button onClick={() => setQuantity((prev) => (prev === '' ? 1 : prev + 1))}>
                        +
                    </button>
                </div>
                <button className="add-to-cart">Add to Cart</button>
            </div>
        </div>
    );
};

export default ProductInfo;